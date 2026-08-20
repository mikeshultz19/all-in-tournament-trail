import "server-only";

import { completeDurableRegistration } from "@/lib/durable-registration";
import type { OnlineRegistrationRequest, RegistrationPriceSnapshot } from "@/lib/online-registration";
import { createSquarePayment, retrieveSquarePayment, SquarePaymentError, type SquarePayment } from "@/lib/square-payments";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type OnlinePaymentAttempt = {
  id: string;
  tournament_id: string;
  idempotency_key: string;
  registration_request: OnlineRegistrationRequest;
  quote_snapshot: RegistrationPriceSnapshot;
  amount_cents: number;
  currency: "USD";
  state: "pending" | "processing" | "completed" | "failed" | "cancelled" | "reconciliation_required";
  square_payment_id: string | null;
  square_status: string | null;
  registration_id: string | null;
};

export async function createOnlinePaymentAttempt(input: { tournamentId: string; request: OnlineRegistrationRequest; quote: RegistrationPriceSnapshot }) {
  const { data, error } = await createSupabaseServerClient().rpc("create_online_registration_payment_attempt", {
    p_tournament_id: input.tournamentId,
    p_registration_request: input.request,
    p_quote_snapshot: input.quote,
    p_amount_cents: input.quote.totalCents,
  });
  if (error || !data) throw new Error("Payment preparation could not be saved.", { cause: error });
  return data.id as string;
}

async function loadAttempt(attemptId: string): Promise<OnlinePaymentAttempt> {
  const { data, error } = await createSupabaseServerClient().from("online_registration_payment_attempts").select("*").eq("id", attemptId).maybeSingle();
  if (error || !data) throw new Error("Payment attempt was not found.", { cause: error });
  return data as OnlinePaymentAttempt;
}

async function claimAttempt(attemptId: string): Promise<OnlinePaymentAttempt> {
  const { data, error } = await createSupabaseServerClient().rpc("claim_online_registration_payment_attempt", { p_attempt_id: attemptId });
  if (error || !data) throw new Error("This payment attempt is no longer available.", { cause: error });
  return data as OnlinePaymentAttempt;
}

async function updateAttempt(attemptId: string, values: Record<string, unknown>) {
  const { error } = await createSupabaseServerClient().from("online_registration_payment_attempts").update(values).eq("id", attemptId);
  if (error) throw new Error("Payment state could not be saved.", { cause: error });
}

async function createRetryAttempt(attempt: OnlinePaymentAttempt) {
  const { data, error } = await createSupabaseServerClient().rpc("create_online_registration_payment_attempt", {
    p_tournament_id: attempt.tournament_id,
    p_registration_request: attempt.registration_request,
    p_quote_snapshot: attempt.quote_snapshot,
    p_amount_cents: attempt.amount_cents,
  });
  if (error || !data) throw new Error("A payment retry could not be prepared.", { cause: error });
  return data.id as string;
}

function assertPaymentIdentity(attempt: OnlinePaymentAttempt, payment: SquarePayment) {
  if (payment.reference_id !== attempt.id
    || payment.amount_money?.amount !== attempt.amount_cents || payment.amount_money.currency !== "USD") {
    throw new Error("Square payment verification did not match the authoritative registration quote.");
  }
}

export async function completeAttemptFromVerifiedSquarePayment(attemptId: string, payment: SquarePayment) {
  const attempt = await loadAttempt(attemptId);
  if (attempt.state === "completed" && attempt.registration_id) return { status: "completed" as const, registrationId: attempt.registration_id };
  assertPaymentIdentity(attempt, payment);
  if (payment.status !== "COMPLETED") throw new Error("Square payment is not complete.");
  await updateAttempt(attempt.id, { state: "processing", square_payment_id: payment.id, square_status: payment.status, failure_code: null, failure_message: null });
  try {
    const registration = await completeDurableRegistration(attempt.registration_request, {
      status: "authorized",
      paymentReference: payment.id,
      amountCents: attempt.amount_cents,
    });
    const { error: registrationPaymentError } = await createSupabaseServerClient().rpc("mark_online_registration_payment_completed", {
      p_registration_id: registration.id,
      p_square_payment_id: payment.id,
    });
    if (registrationPaymentError) throw new Error("Verified payment could not be attached to the registration.", { cause: registrationPaymentError });
    await updateAttempt(attempt.id, { state: "completed", registration_id: registration.id, processed_at: new Date().toISOString() });
    return { status: "completed" as const, registrationId: registration.id };
  } catch (error) {
    await updateAttempt(attempt.id, { state: "reconciliation_required", failure_code: "REGISTRATION_PERSISTENCE_FAILED", failure_message: error instanceof Error ? error.message : "Registration persistence failed." });
    throw error;
  }
}

export async function recordTerminalSquarePaymentFailure(attemptId: string, payment: SquarePayment) {
  const attempt = await loadAttempt(attemptId);
  if (attempt.state === "completed") return;
  if (payment.reference_id !== attempt.id || !["FAILED", "CANCELED"].includes(payment.status)) return;
  await updateAttempt(attempt.id, {
    state: payment.status === "CANCELED" ? "cancelled" : "failed",
    square_payment_id: payment.id,
    square_status: payment.status,
    failure_code: `SQUARE_${payment.status}`,
    failure_message: "Square did not complete the payment.",
  });
}

export async function processOnlineCardPayment(attemptId: string, sourceId: string) {
  const existing = await loadAttempt(attemptId);
  if (existing.state === "completed" && existing.registration_id) return { status: "completed" as const, attemptId };
  const attempt = await claimAttempt(attemptId);
  try {
    const payment = await createSquarePayment({ sourceId, idempotencyKey: attempt.idempotency_key, attemptId: attempt.id, amountCents: attempt.amount_cents });
    assertPaymentIdentity(attempt, payment);
    if (payment.status !== "COMPLETED") {
      await updateAttempt(attempt.id, { state: "reconciliation_required", square_payment_id: payment.id, square_status: payment.status });
      return { status: "reconciliation_required" as const, attemptId };
    }
    await completeAttemptFromVerifiedSquarePayment(attempt.id, payment);
    return { status: "completed" as const, attemptId };
  } catch (error) {
    if (error instanceof SquarePaymentError) {
      if (error.payment) {
        assertPaymentIdentity(attempt, error.payment);
        if (error.payment.status === "COMPLETED") {
          await completeAttemptFromVerifiedSquarePayment(attempt.id, error.payment);
          return { status: "completed" as const, attemptId };
        }
        if (!["FAILED", "CANCELED"].includes(error.payment.status)) {
          await updateAttempt(attempt.id, {
            state: "reconciliation_required",
            square_payment_id: error.payment.id,
            square_status: error.payment.status,
            failure_code: error.code,
            failure_message: error.message,
          });
          return { status: "reconciliation_required" as const, attemptId };
        }
      }
      await updateAttempt(attempt.id, { state: "failed", failure_code: error.code, failure_message: error.message, square_payment_id: error.payment?.id ?? null, square_status: error.payment?.status ?? "FAILED" });
      return { status: "failed" as const, attemptId, retryAttemptId: await createRetryAttempt(attempt), message: "Payment was not completed. Try another card or payment method." };
    }
    const current = await loadAttempt(attempt.id);
    if (current.square_payment_id) await updateAttempt(attempt.id, { state: "reconciliation_required" });
    throw error;
  }
}

export async function reconcileOnlinePaymentAttempt(attemptId: string) {
  const attempt = await loadAttempt(attemptId);
  if (attempt.state === "completed") return { status: "completed" as const, registrationId: attempt.registration_id };
  if (!attempt.square_payment_id) return { status: attempt.state };
  const payment = await retrieveSquarePayment(attempt.square_payment_id);
  if (payment.status !== "COMPLETED") return { status: attempt.state };
  return completeAttemptFromVerifiedSquarePayment(attempt.id, payment);
}

export async function getOnlinePaymentAttempt(attemptId: string) { return loadAttempt(attemptId); }
