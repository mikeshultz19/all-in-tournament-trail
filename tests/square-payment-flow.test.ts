import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const attempts = readFileSync("lib/online-payment-attempts.ts", "utf8");
const square = readFileSync("lib/square-payments.ts", "utf8");
const paymentRoute = readFileSync("app/api/registrations/payment/route.ts", "utf8");
const webhook = readFileSync("app/api/webhooks/square/route.ts", "utf8");
const reconcile = readFileSync("app/api/registrations/reconcile/route.ts", "utf8");
const quote = readFileSync("app/api/registrations/quote/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608200003_add_online_square_payment_attempts.sql", "utf8");
const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const walkup = readFileSync("supabase/migrations/202608200002_add_admin_walkup_registration.sql", "utf8");
const boatNumbers = readFileSync("supabase/migrations/202608220001_assign_sequential_boat_numbers.sql", "utf8");

describe("verified Square registration payments", () => {
  it("creates a private attempt from the authoritative quote without creating a registration", () => {
    expect(quote).toContain("createAuthoritativeRegistrationQuote");
    expect(quote).toContain("createOnlinePaymentAttempt");
    expect(quote).not.toContain("completeDurableRegistration");
    expect(migration).toContain("online_registration_payment_attempts");
  });

  it("creates one durable registration only for a verified completed matching Square payment", () => {
    expect(attempts).toContain('payment.status !== "COMPLETED"');
    expect(attempts).toContain("payment.amount_money?.amount !== attempt.amount_cents");
    expect(attempts).toContain('payment.amount_money.currency !== "USD"');
    expect(attempts).toContain("completeDurableRegistration(attempt.registration_request");
    expect(attempts).toContain('rpc("mark_online_registration_payment_completed"');
    expect(migration).toContain("set online_payment_state = 'completed'");
    expect(boatNumbers).toContain("create or replace function public.mark_online_registration_payment_completed");
    expect(boatNumbers).toContain("set boat_number = v_next_boat_number");
  });

  it("assigns tournament-specific boat numbers only at verified completion", () => {
    expect(boatNumbers).toContain("'tournament-boat-number:' || v_registration.tournament_id::text");
    expect(boatNumbers).toContain("coalesce(max(boat_number), 0) + 1");
    expect(boatNumbers).toContain("where tournament_id = v_registration.tournament_id");
    expect(boatNumbers).toContain("if v_registration.boat_number is null then");
    expect(boatNumbers).toContain("v_next_boat_number := v_registration.boat_number");
    expect(boatNumbers.match(/pg_advisory_xact_lock/g)).toHaveLength(2);
    expect(migration.slice(0, migration.indexOf("mark_online_registration_payment_completed"))).not.toContain("boat_number");
  });

  it("returns a retry attempt after a decline and never calls durable registration from the failure branch", () => {
    expect(paymentRoute).toContain('result.status === "failed" ? 402 : 200');
    expect(attempts).toContain('state: "failed"');
    expect(attempts).toContain("retryAttemptId: await createRetryAttempt(attempt)");
    expect(attempts).toContain("Payment was not completed. Try another card or payment method.");
    expect(attempts.slice(attempts.indexOf("recordTerminalSquarePaymentFailure"), attempts.indexOf("processOnlineCardPayment"))).not.toContain("mark_online_registration_payment_completed");
  });

  it("does not invite a retry when an error response still contains a completed or nonterminal payment", () => {
    expect(square).toContain("body.payment");
    expect(attempts).toContain('if (error.payment.status === "COMPLETED")');
    expect(attempts).toContain('!["FAILED", "CANCELED"].includes(error.payment.status)');
    expect(attempts).toContain('state: "reconciliation_required"');
  });

  it("uses Square and database idempotency for browser, webhook, and reconciliation retries", () => {
    expect(square).toContain("idempotency_key: input.idempotencyKey");
    expect(square).toContain("reference_id: input.attemptId");
    expect(attempts).toContain('attempt.state === "completed" && attempt.registration_id');
    expect(migration).toContain("square_payment_id text unique");
    expect(migration).toContain("idempotency_key uuid not null");
  });

  it("recovers completed payments through a signature-verified idempotent webhook", () => {
    expect(webhook).toContain("verifySquareWebhookSignature");
    expect(webhook).toContain('status: 403');
    expect(webhook).toContain('payment.status === "COMPLETED"');
    expect(webhook).toContain("completeAttemptFromVerifiedSquarePayment(payment.reference_id, payment)");
    expect(webhook).toContain("recordTerminalSquarePaymentFailure(payment.reference_id, payment)");
    expect(attempts).toContain('["FAILED", "CANCELED"].includes(payment.status)');
    expect(square).toContain("timingSafeEqual");
    expect(reconcile).toContain("reconcileOnlinePaymentAttempt");
    expect(attempts).toContain("retrieveSquarePayment(attempt.square_payment_id)");
  });

  it("does not persist abandoned attempts as active registrations", () => {
    expect(migration).not.toMatch(/online_registration_payment_attempts[\s\S]*references public\.tournament_registrations\(id\) on delete cascade/);
    expect(attempts).not.toMatch(/createOnlinePaymentAttempt[\s\S]{0,500}completeDurableRegistration/);
    expect(migration.slice(0, migration.indexOf("claim_online_registration_payment_attempt"))).not.toContain("boat_number");
  });

  it("requires verified Square completion for online Paid while preserving manual walk-ups", () => {
    expect(roster).toContain('row.registration_source === "walk_up"');
    expect(roster).toContain('row.online_payment_state === "completed" && row.square_payment_id');
    expect(walkup).toContain("v_payment_reference text := 'walk-up:'");
    expect(walkup).toContain("payment_method = p_payment_method");
  });
});
