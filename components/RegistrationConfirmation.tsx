import Link from "next/link";

import { formatCurrencyFromCents } from "@/config/payment-policy";

export type RegistrationConfirmationView = {
  confirmationNumber: string;
  tournamentName: string;
  tournamentDate: string;
  venue: string;
  anglers: string[];
  selectedOptions: string[];
  subtotalCents: number;
  cardProcessingFeeCents: number;
  totalCents: number;
  paymentStatus: "paid";
};

export default function RegistrationConfirmation({ confirmation }: { confirmation: RegistrationConfirmationView | null }) {
  if (!confirmation) {
    return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6"><h1 className="text-3xl font-black uppercase text-[#D4A017]">Confirmation Unavailable</h1><p className="mt-4 leading-7 text-neutral-300">No verified registration confirmation was supplied. If Square shows a successful payment, do not pay again. Contact AITT so the payment can be reconciled using its stable Square reference.</p><Link href="/register" className="mt-8 inline-flex min-h-12 items-center border border-[#D4A017] px-5 text-sm font-black uppercase tracking-wide text-[#D4A017]">Return to Registration</Link></section>;
  }

  return <section className="mx-auto max-w-3xl px-5 py-16 sm:px-6">
    <p className="text-sm font-black uppercase tracking-[0.16em] text-green-400">Registration confirmed</p>
    <h1 className="mt-2 text-4xl font-black uppercase text-white">You’re registered.</h1>
    <p className="mt-3 text-neutral-300">Confirmation number: <strong className="text-[#D4A017]">{confirmation.confirmationNumber}</strong></p>
    <dl className="mt-8 grid gap-5 border-y border-[#4A3A12] py-6 sm:grid-cols-2">
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Tournament</dt><dd className="mt-1 text-white">{confirmation.tournamentName}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Date and venue</dt><dd className="mt-1 text-white">{confirmation.tournamentDate} · {confirmation.venue}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Registered anglers</dt><dd className="mt-1 text-white">{confirmation.anglers.join(" / ")}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Selected options</dt><dd className="mt-1 text-white">{confirmation.selectedOptions.join(", ")}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Card Processing Fee</dt><dd className="mt-1 text-white">{formatCurrencyFromCents(confirmation.cardProcessingFeeCents)}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Amount paid</dt><dd className="mt-1 font-black text-[#D4A017]">{formatCurrencyFromCents(confirmation.totalCents)}</dd></div>
      <div><dt className="text-xs font-black uppercase text-[#D4A017]">Payment status</dt><dd className="mt-1 capitalize text-white">{confirmation.paymentStatus}</dd></div>
    </dl>
    <p className="mt-6 leading-7 text-neutral-300">Bring any required identification and complete tournament-morning check-in as directed. Online registration does not replace check-in.</p>
    <nav aria-label="Confirmation actions" className="mt-8 flex flex-wrap gap-3"><Link href="/schedule" className="inline-flex min-h-12 items-center bg-[#D4A017] px-5 text-sm font-black uppercase tracking-wide text-black">Tournament Details</Link><Link href="/how-it-works" className="inline-flex min-h-12 items-center border border-[#4A3A12] px-5 text-sm font-black uppercase tracking-wide text-white">Rules and Policies</Link></nav>
  </section>;
}
