import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import AoyStandingsTable from "@/components/AoyStandingsTable";
import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import {
  getDetailedPublishedAoyStandings,
  paginatePublicAoyStandings,
  type PublicDetailedAoyStanding,
} from "@/lib/aoy-standings";
export const metadata: Metadata = {
  title: "AOY Standings",
  description:
    "View the current All-In Tournament Trail Angler of the Year standings, tournament participation, rankings, and season points.",
  alternates: {
    canonical: "/standings",
  },
};

export const dynamic = "force-dynamic";

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  let standings: PublicDetailedAoyStanding[] = [];

  try {
    standings = await getDetailedPublishedAoyStandings();
  } catch (error) {
    console.error("AOY standings page load failed.", error);
  }
  const pagination = paginatePublicAoyStandings(standings, requestedPage);
  const { page, totalPages, standings: pageStandings } = pagination;
  const pageHref = (targetPage: number) => targetPage === 1 ? "/standings#standings" : `/standings?page=${targetPage}#standings`;

  return (
    <main className="min-h-screen bg-black text-white">
      <Header activeItem="Standings" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,160,23,0.16),transparent_42%)]">
            <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(135deg,transparent,rgba(127,29,29,0.12))]" />
            <header className="relative border-b border-[#D4A017]/50 pb-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[#c9aa4a]/70 bg-[#c9aa4a]/10 text-[#d0ae4c] shadow-[0_0_28px_rgba(212,160,23,0.16)] md:size-14">
                  <Trophy aria-hidden="true" className="size-6 md:size-7" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">Season Championship Race</p>
                  <h1 className="mt-2 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">AOY Standings</h1>
                </div>
              </div>
              <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
                The current race for AITT Angler and Team of the Year, calculated from officially published tournament results.
              </p>
            </header>
          </div>
        </div>
      </section>

      <section id="standings" className={`${PUBLIC_PAGE_CONTAINER} scroll-mt-24 py-10 md:py-14`}>
        {standings.length === 0 ? (
          <div className="border border-white/10 bg-[#111111] px-6 py-12 text-center">
            <p className="text-sm text-neutral-400">
              AOY standings will appear after the first tournament results are published.
            </p>
          </div>
        ) : (
          <>
            <AoyStandingsTable standings={pageStandings} />
            {totalPages > 1 ? (
              <nav aria-label="AOY standings pagination" className="flex flex-wrap items-center justify-between gap-3 border-x border-b border-[#8f762f]/60 bg-[#111111] px-4 py-4">
                <Link href={pageHref(page - 1)} aria-disabled={page === 1} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${page === 1 ? "pointer-events-none text-neutral-600" : "text-[#c9aa4a] hover:border-[#c9aa4a]/60 hover:text-white"}`}>Previous</Link>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">Page {page} of {totalPages}</span>
                <Link href={pageHref(page + 1)} aria-disabled={page === totalPages} className={`border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${page === totalPages ? "pointer-events-none text-neutral-600" : "text-[#c9aa4a] hover:border-[#c9aa4a]/60 hover:text-white"}`}>Next</Link>
              </nav>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
