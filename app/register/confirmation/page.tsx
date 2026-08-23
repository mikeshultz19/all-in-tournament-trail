import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationConfirmation from "@/components/RegistrationConfirmation";
import { getOnlinePaymentAttempt } from "@/lib/online-payment-attempts";
import { getTournamentDisplay } from "@/lib/tournament-display";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { getTournamentBySlug } from "@/lib/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { getRegistrationConfirmationIdentifiers } from "@/lib/tournament-registrations";

export const metadata: Metadata = { title: "Registration Confirmation | All-In Tournament Trail" };

export default async function RegistrationConfirmationPage({ searchParams }: { searchParams: Promise<{ attempt?: string }> }) {
  const { attempt: attemptId } = await searchParams;
  let confirmation = null;
  let recoveryMessage: string | null = null;
  if (attemptId) {
    try {
      const attempt = await getOnlinePaymentAttempt(attemptId);
      if (attempt.state === "completed" && attempt.registration_id) {
        const [tournament, identifiers] = await Promise.all([
          getTournamentBySlug(attempt.registration_request.tournamentSlug),
          getRegistrationConfirmationIdentifiers(attempt.registration_id),
        ]);
        const publicTournament = tournament ? toPublicTournament(tournament) : null;
        const display = publicTournament ? getTournamentDisplay(publicTournament) : null;
        const operations = publicTournament
          ? getTournamentOperationsViewModel(publicTournament)
          : null;
        confirmation = {
          boatNumber: identifiers.boatNumber,
          tournamentName: tournament?.name ?? attempt.registration_request.tournamentSlug,
          tournamentDate: tournament?.tournament_date ?? "",
          lake: tournament?.lake ?? null,
          ramp: tournament?.ramp ?? null,
          launchType: publicTournament?.launchTypeText ?? display?.launchType ?? null,
          morningRegistration: publicTournament?.morningRegistrationText ?? display?.morningRegistration ?? null,
          launchTime: operations?.safeLight.time ?? null,
          officialSunrise: operations?.safeLight.officialSunrise ?? null,
          scalesClose: publicTournament?.scalesCloseText ?? null,
          anglers: attempt.registration_request.anglers.map((angler) => `${angler.firstName} ${angler.lastName}`),
          selectedOptions: attempt.quote_snapshot.lineItems.map((item) => item.name),
          subtotalCents: attempt.quote_snapshot.subtotalCents,
          totalCents: attempt.amount_cents,
          paymentStatus: "paid" as const,
        };
      } else if (attempt.state === "failed" || attempt.state === "cancelled") {
        recoveryMessage = "Payment was not completed. You are not registered. Return to registration to try another card or payment method.";
      } else {
        recoveryMessage = "Square payment confirmation is still being verified. Do not pay again. AITT will recover the registration automatically when confirmation arrives.";
      }
    } catch { recoveryMessage = "Payment verification is temporarily unavailable. If Square shows success, do not pay again; contact AITT for reconciliation."; }
  }
  return <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]"><Header /><RegistrationConfirmation confirmation={confirmation} recoveryMessage={recoveryMessage} recoveryAttemptId={!confirmation ? attemptId : null} /></main>;
}
