import type { TournamentInsurancePotResultRecord } from "@/types/insurance-pot";

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
const ordinal = (position: number) => {
  const mod100 = position % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${position}th`;
  return `${position}${position % 10 === 1 ? "st" : position % 10 === 2 ? "nd" : position % 10 === 3 ? "rd" : "th"}`;
};

export default function InsurancePotWinnersSection({
  result,
}: {
  result?: TournamentInsurancePotResultRecord | null;
}) {
  if (!result?.published) return null;
  const payouts = result.winners.map((winner) => winner.amountCents);
  const payoutSummary = payouts.length && payouts.every((amount) => amount === payouts[0])
    ? money(payouts[0])
    : `${money(Math.min(...payouts))}–${money(Math.max(...payouts))}`;

  return (
    <section id="insurance-pot-winners" className="mt-10 scroll-mt-24 border-t border-[#D4A017]/30 pt-10">
      <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
        AITT Insurance Pot Winners
      </h2>
      <dl className="mt-6 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
        {[
          ["Insurance Pot Entries", String(result.entry_count)],
          ["Total Pot", money(result.total_pot_cents)],
          ["Places Paid", String(result.places_paid)],
          ["Payout Per Winning Entry", payoutSummary],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#111111] p-4">
            <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</dt>
            <dd className="mt-2 font-black text-[#d0ae4c]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 divide-y divide-white/10 border-y border-white/10">
        {result.winners.map((winner, index) => (
          <div key={winner.entryId ?? `${winner.entryName}-${index}`} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-black uppercase text-white">{winner.finishingPosition ? `${ordinal(winner.finishingPosition)} Place — ` : ""}{winner.entryName}</p>
            <p className="font-black text-[#d0ae4c]">{money(winner.amountCents)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
