import Link from "next/link";
import { CreditCard, SmartphoneNfc } from "lucide-react";

export default function PaymentAnnouncement() {
  return (
    <article
      aria-labelledby="payment-update-heading"
      className="mt-4 overflow-hidden border border-white/10 border-l-4 border-l-[#D4A017] bg-[#111111] px-5 py-5 sm:px-6"
    >
      <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
        Payment Update
      </p>
      <h3
        id="payment-update-heading"
        className="mt-2 text-xl font-black uppercase tracking-tight text-white sm:text-2xl"
      >
        Card and Apple Pay Now Available
      </h3>

      <div
        className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-neutral-200"
        aria-label="Available payment methods include credit cards, debit cards, Apple Pay, and supported contactless wallets"
      >
        <span className="inline-flex items-center gap-2 border border-white/15 bg-black px-3 py-2">
          <CreditCard aria-hidden="true" className="size-4 text-[#D4A017]" />
          Credit &amp; debit
        </span>
        {/* Text fallback until official, Apple-provided mark artwork is approved and added. */}
        <span className="inline-flex items-center border border-white/15 bg-black px-3 py-2">
          Apple Pay
        </span>
        <span className="inline-flex items-center gap-2 border border-white/15 bg-black px-3 py-2">
          <SmartphoneNfc aria-hidden="true" className="size-4 text-[#D4A017]" />
          Contactless
        </span>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-300">
        Register early online or pay at tournament-morning registration using a credit card, debit card, or Apple Pay. Apple Pay is available on supported devices and browsers. Payments are processed securely through Square.
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
        A 3% Card Processing Fee applies to all card and digital-wallet payments. Cash is accepted during tournament-morning registration with no processing fee. Supported contactless wallets can be used through the Square reader.
      </p>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
        Fast. Secure. Less time at the registration table.
      </p>
      <Link
        href="/how-it-works#frequently-asked-questions"
        className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.12em] text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
      >
        View Payment Details
      </Link>
    </article>
  );
}
