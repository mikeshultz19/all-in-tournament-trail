import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

import TournamentInformationForm from "@/components/admin/TournamentInformationForm";
import {
  getNextUpcomingTournament,
  getTournamentByIdentifier,
} from "@/lib/tournaments";

interface TournamentAdminPageProps {
  searchParams: Promise<{ tournament?: string | string[] }>;
}

export const dynamic = "force-dynamic";

export default async function TournamentAdminPage({
  searchParams,
}: TournamentAdminPageProps) {
  const params = await searchParams;
  const requestedTournament = Array.isArray(params.tournament)
    ? params.tournament[0]
    : params.tournament;

  let tournament = null;
  let loadFailed = false;

  try {
    tournament = requestedTournament
      ? await getTournamentByIdentifier(requestedTournament)
      : await getNextUpcomingTournament();
  } catch (error) {
    console.error("Tournament Information page load failed.", error);
    loadFailed = true;
  }

  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>

      <div className="mt-6 border-b border-white/10 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Management
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Tournament Information
        </h1>
      </div>

      {tournament ? (
        <>
          <aside className="mt-6 border border-[#4A3A12] bg-[#D4A017]/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#D4A017]">
              This information appears on
            </p>
            <ul className="mt-3 grid gap-2 text-sm text-neutral-300 sm:grid-cols-3">
              {[
                "Homepage Featured Tournament",
                "Tournament Schedule",
                "Tournament Details",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check
                    aria-hidden="true"
                    className="size-4 text-emerald-400"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
          <div className="mt-6">
            <TournamentInformationForm
              key={tournament.id}
              tournament={tournament}
            />
          </div>
        </>
      ) : (
        <section className="mt-6 border border-white/10 bg-[#111111] p-6">
          <h2 className="text-xl font-black uppercase text-white">
            {loadFailed
              ? "Tournament Information Unavailable"
              : requestedTournament
                ? "Tournament Not Found"
                : "No Tournaments Yet"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            {loadFailed
              ? "We could not load this tournament. Please try again."
              : requestedTournament
                ? "We could not load this tournament."
                : "No tournaments have been created yet."}
          </p>
        </section>
      )}
    </>
  );
}
