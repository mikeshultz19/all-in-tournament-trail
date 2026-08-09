import {
  ArrowLeft,
  FileSpreadsheet,
  Pencil,
} from "lucide-react";
import Link from "next/link";

import PublishTournamentForm from "@/components/admin/PublishTournamentForm";
import { excludeDisqualified } from "@/lib/disqualification";
import {
  calculateResultPayouts,
  payoutAmount,
} from "@/lib/result-payouts";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getTournamentByIdentifier } from "@/lib/tournaments";

interface PublishPageProps {
  searchParams: Promise<{
    tournament?: string | string[];
  }>;
}

export const dynamic = "force-dynamic";

type ImportedEntry = {
  place: number | null;
  team_name: string;
  fish_count: number | null;
  total_weight: number | null;
  big_fish_weight: number | null;
  base_payout: number | null;
  bronze_payout: number | null;
  silver_payout: number | null;
  gold_payout: number | null;
  big_bass_payout: number | null;
  participation_status: string;
};

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function weight(value: number | null | undefined): string {
  return `${payoutAmount(value).toFixed(2)} lbs`;
}

export default async function PublishPage({
  searchParams,
}: PublishPageProps) {
  const params = await searchParams;

  const identifier = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  const tournament = identifier
    ? await getTournamentByIdentifier(identifier)
    : null;

  if (!identifier || !tournament) {
    return (
      <section className="border border-white/10 bg-[#111111] p-6">
        <h1 className="text-xl font-black uppercase text-white">
          Tournament Not Found
        </h1>

        <p className="mt-3 text-sm text-neutral-400">
          Return to Catalyst and select a tournament.
        </p>

        <Link
          href="/admin/tournament-manager"
          className="mt-5 inline-flex min-h-11 items-center bg-[#D4A017] px-5 text-xs font-black uppercase text-black"
        >
          Return to Catalyst
        </Link>
      </section>
    );
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("tournament_result_entries")
    .select(
      "place, team_name, fish_count, total_weight, big_fish_weight, base_payout, bronze_payout, silver_payout, gold_payout, big_bass_payout, participation_status",
    )
    .eq("tournament_id", tournament.id)
    .order("place", {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    console.error("Publish review load failed.", error);
  }

  const entries = excludeDisqualified((data ?? []) as ImportedEntry[]);

  const champion =
    entries.find((entry) => entry.place === 1) ??
    entries[0];

  const bigBass = [...entries]
    .filter(
      (entry) => payoutAmount(entry.big_fish_weight) > 0,
    )
    .sort(
      (left, right) =>
        payoutAmount(right.big_fish_weight) -
        payoutAmount(left.big_fish_weight),
    )[0];

  const basePayoutTotal = entries.reduce(
    (total, entry) =>
      total + payoutAmount(entry.base_payout),
    0,
  );

  const bronzePayoutTotal = entries.reduce(
    (total, entry) =>
      total + payoutAmount(entry.bronze_payout),
    0,
  );

  const silverPayoutTotal = entries.reduce(
    (total, entry) =>
      total + payoutAmount(entry.silver_payout),
    0,
  );

  const goldPayoutTotal = entries.reduce(
    (total, entry) =>
      total + payoutAmount(entry.gold_payout),
    0,
  );

  const bigBassPayoutTotal = entries.reduce(
    (total, entry) =>
      total + payoutAmount(entry.big_bass_payout),
    0,
  );

  const payoutTotals = calculateResultPayouts({
    total_payout: basePayoutTotal,
    bronze_payout: bronzePayoutTotal,
    silver_payout: silverPayoutTotal,
    gold_payout: goldPayoutTotal,
    insurance_pot_payout: tournament.insurance_payout,
    big_bass_payout: bigBassPayoutTotal,
  });

  return (
    <>
      <Link
        href={`/admin/tournament-manager?tournament=${encodeURIComponent(
          identifier,
        )}&step=5`}
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />

        Back to Publish Results
      </Link>

      <header className="mt-6 border-b border-white/10 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Final Check
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Review & Publish
        </h1>

        <p className="mt-3 text-sm text-neutral-400">
          {tournament.name} — {tournament.lake}
        </p>
      </header>

      {entries.length === 0 ? (
        <section className="mt-6 border border-amber-500/40 bg-amber-500/10 p-6">
          <h2 className="font-black uppercase text-amber-200">
            Import Results First
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-100/80">
            There are no imported WeighFish results to
            publish.
          </p>

          <Link
            href={`/admin/tournament-manager/import?tournament=${encodeURIComponent(
              identifier,
            )}`}
            className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[#D4A017] px-5 text-xs font-black uppercase text-black"
          >
            <FileSpreadsheet
              aria-hidden="true"
              className="size-4"
            />

            Import WeighFish CSV
          </Link>
        </section>
      ) : (
        <div className="mt-6 space-y-4">
          <section id="public-preview" className="scroll-mt-28 border border-white/10 bg-[#111111] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
                  Imported Results
                </p>

                <h2 className="mt-1 text-xl font-black uppercase text-white">
                  Quick Review
                </h2>
              </div>

              <Link
                href={`/admin/tournament-manager/import?tournament=${encodeURIComponent(
                  identifier,
                )}`}
                className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-4 text-xs font-black uppercase tracking-[0.12em] text-neutral-200 hover:border-[#D4A017] hover:text-[#D4A017]"
              >
                <Pencil
                  aria-hidden="true"
                  className="size-3.5"
                />

                Re-import
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Summary
                label="Teams"
                value={String(entries.length)}
              />

              <Summary
                label="Champion"
                value={
                  champion?.team_name ?? "Not listed"
                }
                detail={
                  champion
                    ? weight(champion.total_weight)
                    : undefined
                }
              />

              <Summary
                label="Big Bass"
                value={
                  bigBass?.team_name ?? "Not listed"
                }
                detail={
                  bigBass
                    ? weight(bigBass.big_fish_weight)
                    : undefined
                }
              />

              <Summary
                label="Total Paid Out to Anglers"
                value={currency(payoutTotals.totalPaidOutToAnglers)}
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Summary
                label="Base"
                value={currency(basePayoutTotal)}
              />

              <Summary
                label="Bronze"
                value={currency(bronzePayoutTotal)}
              />

              <Summary
                label="Silver"
                value={currency(silverPayoutTotal)}
              />

              <Summary
                label="Gold"
                value={currency(goldPayoutTotal)}
              />

              <Summary
                label="Big Bass"
                value={currency(bigBassPayoutTotal)}
              />

              <Summary
                label="Insurance"
                value={currency(
                  payoutAmount(tournament.insurance_payout),
                )}
              />
            </div>
          </section>

          <div id="publish-results" className="scroll-mt-28">
            <PublishTournamentForm
              tournamentId={tournament.id}
              identifier={identifier}
            />
          </div>

          <section className="border border-white/10 bg-[#111111] p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
              Full Results
            </p>

            <h2 className="mt-1 text-xl font-black uppercase text-white">
              {entries.length} Imported Teams
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Scroll inside the table to review every
              imported team.
            </p>

            <div className="mt-5 max-h-[36rem] overflow-auto rounded-sm border border-white/10">
              <table className="min-w-[1200px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-white/15 bg-[#090909] text-xs font-black uppercase tracking-[0.1em] text-neutral-400">
                  <tr>
                    <th className="px-4 py-3">Place</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Fish</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">
                      Big Fish
                    </th>
                    <th className="px-4 py-3">Base</th>
                    <th className="px-4 py-3">
                      Bronze
                    </th>
                    <th className="px-4 py-3">
                      Silver
                    </th>
                    <th className="px-4 py-3">Gold</th>
                    <th className="px-4 py-3">
                      Big Bass
                    </th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {entries.map((entry, index) => {
                    const rowTotal =
                      payoutAmount(entry.base_payout) +
                      payoutAmount(entry.bronze_payout) +
                      payoutAmount(entry.silver_payout) +
                      payoutAmount(entry.gold_payout) +
                      payoutAmount(entry.big_bass_payout);

                    return (
                      <tr
                        key={`${entry.place ?? "none"}-${entry.team_name}-${index}`}
                        className="border-t border-white/10 transition-colors hover:bg-white/[0.025]"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-bold text-white">
                          {entry.place ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-neutral-200">
                          {entry.team_name}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {payoutAmount(entry.fish_count)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {weight(entry.total_weight)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {payoutAmount(
                            entry.big_fish_weight,
                          ) > 0
                            ? weight(
                                entry.big_fish_weight,
                              )
                            : "—"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {currency(
                            payoutAmount(entry.base_payout),
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {currency(
                            payoutAmount(
                              entry.bronze_payout,
                            ),
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {currency(
                            payoutAmount(
                              entry.silver_payout,
                            ),
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {currency(
                            payoutAmount(entry.gold_payout),
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                          {currency(
                            payoutAmount(
                              entry.big_bass_payout,
                            ),
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 font-bold text-[#D4A017]">
                          {currency(rowTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function Summary({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-neutral-400">
          {detail}
        </p>
      )}
    </div>
  );
}
