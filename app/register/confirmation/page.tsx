import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationConfirmation from "@/components/RegistrationConfirmation";
import { getOnlinePaymentAttempt } from "@/lib/online-payment-attempts";
import { getTournamentBySlug } from "@/lib/tournaments";

export const metadata: Metadata = { title: "Registration Confirmation | All-In Tournament Trail" };

export default async function RegistrationConfirmationPage({ searchParams }: { searchParams: Promise<{ attempt?: string }> }) {
  const { attempt: attemptId } = await searchParams;
  let confirmation = null;
  let recoveryMessage: string | null = null;
  if (attemptId) {
    try {
      const attempt = await getOnlinePaymentAttempt(attemptId);
      if (attempt.state === "completed" && attempt.registration_id) {
        const tournament = await getTournamentBySlug(attempt.registration_request.tournamentSlug);
        confirmation = {
          confirmationNumber: attempt.registration_id,
          tournamentName: tournament?.name ?? attempt.registration_request.tournamentSlug,
          tournamentDate: tournament?.tournament_date ?? "",
          venue: [tournament?.lake, tournament?.ramp].filter(Boolean).join(" · "),
          anglers: attempt.registration_request.anglers.map((angler) => `${angler.firstName} ${angler.lastName}`),
          selectedOptions: attempt.quote_snapshot.lineItems.map((item) => item.name),
          subtotalCents: attempt.quote_snapshot.subtotalCents,
          cardProcessingFeeCents: attempt.quote_snapshot.cardProcessingFeeCents,
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
