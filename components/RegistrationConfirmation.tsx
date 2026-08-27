import Link from "next/link";

import { formatCurrencyFromCents } from "@/config/payment-policy";
import PaymentRecovery from "@/components/PaymentRecovery";
import { formatTournamentDate } from "@/lib/tournament-time";

export type RegistrationConfirmationView = {
  boatNumber: number | null;
  tournamentName: string;
  tournamentDate: string;
  lake: string | null;
  ramp: string | null;
  launchType: string | null;
  morningRegistration: string | null;
  launchTime: string | null;
  officialSunrise: string | null;
  scalesClose: string | null;
  anglers: string[];
  selectedOptions: string[];
  subtotalCents: number;
  totalCents: number;
  paymentStatus: "paid";
};

export function formatRegistrationTournamentDate(value: string): string {
  const storedDate = value.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/)?.[1];
  return storedDate ? formatTournamentDate(storedDate) : value || "To Be Announced";
}

function TournamentDetail({ label, value, note }: { label: string; value?: string | null; note?: string }) {
  return <div className="min-w-0 border-t border-[#2E2E2E] pt-3 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
    <dt className="text-xs font-black uppercase tracking-[0.1em] text-[#D4A017]">{label}</dt>
    <dd className="mt-1 break-words text-sm font-bold leading-5 text-white">{value || "TBA"}</dd>
    {note && value && value !== "TBA" ? <dd className="mt-1 text-xs leading-5 text-neutral-400">{note}</dd> : null}
  </div>;
}

export default function RegistrationConfirmation({ confirmation, recoveryMessage, recoveryAttemptId }: { confirmation: RegistrationConfirmationView | null; recoveryMessage?: string | null; recoveryAttemptId?: string | null }) {
  if (!confirmation) {
    return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6"><h1 className="text-3xl font-black uppercase text-[#D4A017]">Confirmation Pending</h1><p className="mt-4 leading-7 text-neutral-300">{recoveryMessage ?? "No verified registration confirmation was supplied. If Square shows a successful payment, do not pay again. Contact AITT so the payment can be reconciled using its stable Square reference."}</p>{recoveryAttemptId ? <PaymentRecovery attemptId={recoveryAttemptId} /> : null}<Link href="/register" className="mt-8 inline-flex min-h-12 items-center border border-[#D4A017] px-5 text-sm font-black uppercase tracking-wide text-[#D4A017]">Return to Registration</Link></section>;
  }

  return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
    <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-green-400">You’re Registered</h1>
    <section aria-label="Registration identifiers" className="mt-6 border-y border-[#4A3A12] py-5">
      <dl className="min-w-0">
        <div className="min-w-0 bg-[#111] px-4 py-3">
          <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">Registration / Boat Number</dt>
          <dd className="mt-1 break-words text-2xl font-black text-white">{confirmation.boatNumber ? `#${confirmation.boatNumber}` : "TBA"}</dd>
        </div>
      </dl>
      {confirmation.boatNumber ? <p className="mt-3 text-sm leading-6 text-neutral-300">Your boat number is your launch-order number. If flights are used, this number will also determine which flight you are in.</p> : null}
    </section>
    <dl className="mt-6 grid gap-5 border-b border-[#4A3A12] pb-6 sm:grid-cols-2">
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Registered anglers</dt><dd className="mt-1 text-white">{confirmation.anglers.join(" / ")}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Selected options</dt><dd className="mt-1 text-white">{confirmation.selectedOptions.join(", ")}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Amount paid</dt><dd className="mt-1 font-black text-[#D4A017]">{formatCurrencyFromCents(confirmation.totalCents)}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Payment status</dt><dd className="mt-1 capitalize text-white">{confirmation.paymentStatus}</dd></div>
    </dl>
    <p className="mt-6 leading-7 text-neutral-300">Bring any required identification and complete tournament-morning check-in as directed. Online registration does not replace check-in.</p>
    <section aria-labelledby="confirmation-tournament-information" className="mt-8 border border-[#4A3A12] bg-[#111] px-5 py-5 sm:px-6">
      <h2 id="confirmation-tournament-information" className="text-lg font-black uppercase tracking-[0.05em] text-white">Tournament Information</h2>
      <dl className="mt-5 grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
        <TournamentDetail label="Tournament / Lake" value={[confirmation.tournamentName, confirmation.lake].filter((value, index, values) => value && values.indexOf(value) === index).join(" · ")} />
        <TournamentDetail label="Date" value={formatRegistrationTournamentDate(confirmation.tournamentDate)} />
        <TournamentDetail label="Ramp / Launch Location" value={confirmation.ramp} />
        <TournamentDetail label="Launch Type / Numbered Launch" value={confirmation.launchType} />
        <TournamentDetail label="Morning Registration / Check-In" value={confirmation.morningRegistration} />
        <TournamentDetail label="Estimated Launch / Safe Light" value={confirmation.launchTime} note="Have your boat in the water and ready to launch before this time." />
        <TournamentDetail label="Sunrise" value={confirmation.officialSunrise} />
        <TournamentDetail label="Scales Close / Weigh-In" value={confirmation.scalesClose} />
      </dl>
      <p className="mt-5 border-t border-[#2E2E2E] pt-3 text-xs italic leading-5 text-neutral-500">All tournament times are subject to change by the Tournament Director.</p>
    </section>
    <section aria-labelledby="tournament-status-heading" className="mt-6 border-l-2 border-[#D4A017] bg-[#111] px-5 py-5 sm:px-6">
      <h2 id="tournament-status-heading" className="text-lg font-black uppercase tracking-[0.05em] text-white">Tournament Status</h2>
      <p className="mt-3 text-sm leading-6 text-neutral-300">Check the AITT homepage before the tournament for weather-related postponements, cancellations, or schedule changes. Updates will also be posted on AITT social media.</p>
      <Link href="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-black uppercase tracking-wide text-[#D4A017] transition hover:text-[#F2C94C]">Check AITT Homepage →</Link>
    </section>
  </section>;
}
