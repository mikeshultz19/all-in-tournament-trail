import "server-only";

import { EmailProviderError, sendResendEmail } from "@/lib/resend-email";
import { buildRegistrationConfirmationEmail, normalizeEmailAddress, uniqueRegistrationRecipients } from "@/lib/registration-confirmation-email-template";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTournamentDisplay } from "@/lib/tournament-display";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentBySlug } from "@/lib/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

type Delivery = { id: string; registration_id: string; payment_attempt_id: string; recipient_email: string; provider_idempotency_key: string };

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
  const [{ data: attempt, error: attemptError }, { data: registration, error: registrationError }] = await Promise.all([
    supabase.from("online_registration_payment_attempts").select("state,registration_id,registration_request,quote_snapshot,amount_cents").eq("id", delivery.payment_attempt_id).single(),
    supabase.from("tournament_registrations").select("boat_number,online_payment_state").eq("id", delivery.registration_id).single(),
  ]);
  if (attemptError || registrationError || !attempt || !registration) throw new EmailProviderError("CONFIRMATION_DATA_UNAVAILABLE");
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
    scalesClose: publicTournament.scalesCloseText ?? null,
    anglers: request.anglers.map((angler) => `${angler.firstName} ${angler.lastName}`.trim()),
    selectedOptions: quote.lineItems.map((item) => item.name),
    totalCents: attempt.amount_cents,
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
