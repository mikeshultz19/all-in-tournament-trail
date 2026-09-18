import "server-only";

import { EmailProviderError, sendResendEmail } from "@/lib/resend-email";
import { buildRegistrationConfirmationEmail, normalizeEmailAddress, uniqueRegistrationRecipients } from "@/lib/registration-confirmation-email-template";
import { formatCurrencyFromCents } from "@/config/payment-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTournamentDisplay } from "@/lib/tournament-display";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentById, getTournamentBySlug } from "@/lib/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

type Delivery = { id: string; registration_id: string; payment_attempt_id: string | null; recipient_email: string; provider_idempotency_key: string };
type WalkUpContact = { firstName?: unknown; lastName?: unknown };
type WalkUpLineItem = { name?: unknown; priceCents?: unknown };
type WalkUpRegistration = {
  boat_number: number | null;
  registration_source: string;
  tournament_id: string;
  participant_contact_snapshot: unknown;
  price_snapshot: unknown;
  payment_method: string | null;
};

export function assertRegistrationEmailRecipientAllowed(recipient: string): void {
  const environment = process.env.AITT_EMAIL_ENVIRONMENT?.trim().toLowerCase();
  if (environment === "production") return;
  if (environment !== "staging") throw new EmailProviderError("EMAIL_ENVIRONMENT_NOT_CONFIGURED");
  const allowlist = uniqueRegistrationRecipients((process.env.AITT_STAGING_EMAIL_ALLOWLIST ?? "").split(","));
  if (!allowlist.length) throw new EmailProviderError("STAGING_ALLOWLIST_NOT_CONFIGURED");
  if (!allowlist.includes(normalizeEmailAddress(recipient))) throw new EmailProviderError("STAGING_RECIPIENT_NOT_ALLOWED");
}

async function finishDelivery(deliveryId: string, succeeded: boolean, providerMessageId?: string, errorCode?: string) {
  const { error } = await createSupabaseServerClient().rpc("finish_registration_confirmation_email_delivery", {
    p_delivery_id: deliveryId,
    p_succeeded: succeeded,
    p_provider_message_id: providerMessageId ?? null,
    p_error_code: errorCode ?? null,
  });
  if (error) throw new Error("Email delivery status could not be saved.", { cause: error });
}

async function buildEmailForDelivery(delivery: Delivery) {
  const supabase = createSupabaseServerClient();
  const { data: registration, error: registrationError } = await supabase
    .from("tournament_registrations")
    .select("boat_number,online_payment_state,registration_source,tournament_id,participant_contact_snapshot,price_snapshot,payment_method")
    .eq("id", delivery.registration_id)
    .single();
  if (registrationError || !registration) throw new EmailProviderError("CONFIRMATION_DATA_UNAVAILABLE");

  if (registration.registration_source === "walk_up") {
    if (delivery.payment_attempt_id !== null) throw new EmailProviderError("WALKUP_PAYMENT_ATTEMPT_INVALID");
    const tournament = await getTournamentById(registration.tournament_id);
    if (!tournament) throw new EmailProviderError("TOURNAMENT_DATA_UNAVAILABLE");
    return buildWalkUpRegistrationConfirmationEmail(registration as WalkUpRegistration, tournament);
  }

  if (!delivery.payment_attempt_id) throw new EmailProviderError("ONLINE_PAYMENT_ATTEMPT_REQUIRED");
  const { data: attempt, error: attemptError } = await supabase
    .from("online_registration_payment_attempts")
    .select("state,registration_id,registration_request,quote_snapshot,amount_cents")
    .eq("id", delivery.payment_attempt_id)
    .single();
  if (attemptError || !attempt) throw new EmailProviderError("CONFIRMATION_DATA_UNAVAILABLE");
  if (attempt.state !== "completed" || attempt.registration_id !== delivery.registration_id || registration.online_payment_state !== "completed") throw new EmailProviderError("REGISTRATION_NOT_COMPLETED");

  const request = attempt.registration_request as { tournamentSlug: string; anglers: Array<{ firstName: string; lastName: string }> };
  const quote = attempt.quote_snapshot as { lineItems: Array<{ name: string }> };
  const tournament = await getTournamentBySlug(request.tournamentSlug);
  if (!tournament) throw new EmailProviderError("TOURNAMENT_DATA_UNAVAILABLE");
  const publicTournament = toPublicTournament(tournament);
  const display = getTournamentDisplay(publicTournament);
  const operations = getTournamentOperationsViewModel(publicTournament);

  return buildRegistrationConfirmationEmail({
    boatNumber: registration.boat_number,
    tournamentName: tournament.name,
    tournamentDate: tournament.tournament_date,
    lake: tournament.lake,
    ramp: tournament.ramp,
    launchType: publicTournament.launchTypeText ?? display.launchType,
    morningRegistration: publicTournament.morningRegistrationText ?? display.morningRegistration,
    safeLight: operations.safeLight.time,
    officialSunrise: operations.safeLight.officialSunrise,
    scalesClose: publicTournament.scalesCloseText ?? null,
    anglers: request.anglers.map((angler) => `${angler.firstName} ${angler.lastName}`.trim()),
    selectedOptions: quote.lineItems.map((item) => item.name),
    totalCents: attempt.amount_cents,
  });
}

export function buildWalkUpRegistrationConfirmationEmail(
  registration: WalkUpRegistration,
  tournament: NonNullable<Awaited<ReturnType<typeof getTournamentById>>>,
) {
  if (registration.registration_source !== "walk_up" || !Number.isSafeInteger(registration.boat_number) || (registration.boat_number ?? 0) <= 0) {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  if (registration.payment_method !== "cash" && registration.payment_method !== "card" && registration.payment_method !== "other") {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  if (!Array.isArray(registration.participant_contact_snapshot) || registration.participant_contact_snapshot.length < 1) {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  const contacts = registration.participant_contact_snapshot as WalkUpContact[];
  const anglers = contacts.map((contact) => {
    if (typeof contact.firstName !== "string" || !contact.firstName.trim() || typeof contact.lastName !== "string" || !contact.lastName.trim()) {
      throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
    }
    return `${contact.firstName.trim()} ${contact.lastName.trim()}`;
  });
  if (!registration.price_snapshot || typeof registration.price_snapshot !== "object") {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  const snapshot = registration.price_snapshot as { lineItems?: unknown; cardProcessingFeeCents?: unknown; totalCents?: unknown };
  if (!Array.isArray(snapshot.lineItems) || !Number.isSafeInteger(snapshot.totalCents) || (snapshot.totalCents as number) < 0) {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  const lineItems = (snapshot.lineItems as WalkUpLineItem[]).map((item) => {
    if (typeof item.name !== "string" || !item.name.trim() || !Number.isSafeInteger(item.priceCents) || (item.priceCents as number) < 0) {
      throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
    }
    return { name: item.name.trim(), priceCents: item.priceCents as number };
  });
  const cardFee = snapshot.cardProcessingFeeCents ?? 0;
  if (!Number.isSafeInteger(cardFee) || (cardFee as number) < 0 || (registration.payment_method !== "card" && cardFee !== 0)) {
    throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");
  }
  const itemizedTotal = lineItems.reduce((sum, item) => sum + item.priceCents, 0) + (cardFee as number);
  if (itemizedTotal !== snapshot.totalCents) throw new EmailProviderError("WALKUP_CONFIRMATION_DATA_INVALID");

  const publicTournament = toPublicTournament(tournament);
  const display = getTournamentDisplay(publicTournament);
  const operations = getTournamentOperationsViewModel(publicTournament);
  const selectedOptions = lineItems.map((item) => `${item.name} — ${formatCurrencyFromCents(item.priceCents)}`);
  if ((cardFee as number) > 0) selectedOptions.push(`Card Processing Fee — ${formatCurrencyFromCents(cardFee as number)}`);

  return buildRegistrationConfirmationEmail({
    variant: "walk_up",
    boatNumber: registration.boat_number,
    tournamentName: tournament.name,
    tournamentDate: tournament.tournament_date,
    lake: tournament.lake,
    ramp: tournament.ramp,
    launchType: publicTournament.launchTypeText ?? display.launchType,
    morningRegistration: publicTournament.morningRegistrationText ?? display.morningRegistration,
    safeLight: operations.safeLight.time,
    officialSunrise: operations.safeLight.officialSunrise,
    scalesClose: publicTournament.scalesCloseText ?? null,
    anglers,
    selectedOptions,
    paymentMethod: registration.payment_method,
    totalCents: snapshot.totalCents as number,
  });
}

export async function deliverRegistrationConfirmationEmails(registrationId: string): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  while (true) {
    const { data, error } = await createSupabaseServerClient().rpc("claim_registration_confirmation_email_delivery", { p_registration_id: registrationId });
    if (error) throw new Error("Confirmation email delivery could not be claimed.", { cause: error });
    const delivery = data as Delivery | null;
    if (!delivery?.id) break;
    try {
      assertRegistrationEmailRecipientAllowed(delivery.recipient_email);
      const email = await buildEmailForDelivery(delivery);
      const result = await sendResendEmail({ to: delivery.recipient_email, subject: email.subject, html: email.html, idempotencyKey: delivery.provider_idempotency_key });
      await finishDelivery(delivery.id, true, result.id);
      sent += 1;
    } catch (deliveryError) {
      const code = deliveryError instanceof EmailProviderError ? deliveryError.code : "CONFIRMATION_EMAIL_ERROR";
      await finishDelivery(delivery.id, false, undefined, code);
      console.error("Registration confirmation email delivery failed.", { deliveryId: delivery.id, code });
      failed += 1;
    }
  }
  return { sent, failed };
}
