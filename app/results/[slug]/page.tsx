import { CalendarDays, Clock3, DollarSign, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Breadcrumb from "@/components/Breadcrumb";
import Header from "@/components/Header";
import {
  getTournamentBySlug,
  getTournamentImage,
  tournaments,
  type Tournament,
} from "@/data/tournaments";
import { getTournamentResultsBySlug } from "@/data/tournamentResults";

interface TournamentDetailsPageProps {
  params: Promise<{ slug: string }>;
}

const unavailable = "To Be Announced";

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function hasRegistrationRoute(tournament: Tournament): tournament is Tournament & {
  registrationUrl: string;
} {
  return (
    tournament.registrationStatus === "open" &&
    tournament.registrationUrl !== null
  );
}

export function generateStaticParams() {
  return tournaments.map(({ slug }) => ({ slug }));
}

export default async function TournamentDetailsPage({
  params,
}: TournamentDetailsPageProps) {
  const { slug } = await params;
  const tournament = getTournamentBySlug(slug);

  if (!tournament) {
    notFound();
  }

  const result = getTournamentResultsBySlug(slug);
  const resultsPublished = Boolean(
    tournament.resultsAvailable && result?.published,
  );
  const information = [
    { label: "Date", value: formatDate(tournament.date), Icon: CalendarDays },
    { label: "Launch", value: tournament.venue ?? unavailable, Icon: MapPin },
    { label: "Hours", value: unavailable, Icon: Clock3 },
    { label: "Entry Fee", value: unavailable, Icon: DollarSign },
  ] as const;

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <div className="mx-auto max-w-7xl px-5 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-6 lg:pb-20">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Schedule", href: "/schedule" },
            { label: tournament.name },
          ]}
        />

        <header className="pb-6 pt-7 sm:pb-8 sm:pt-9">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            {tournament.name}
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-yellow-400 sm:text-base">
            {tournament.city ?? unavailable}
          </p>
        </header>

        <div className="relative h-[210px] overflow-hidden rounded-md bg-zinc-900 sm:h-[270px] lg:h-[340px]">
          <Image
            src={getTournamentImage(tournament)}
            alt={`${tournament.name} lake`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
          />
        </div>

        <section className="pt-10 sm:pt-12" aria-labelledby="tournament-information">
          <div className="border-b border-white/15 pb-3">
            <h2 id="tournament-information" className="border-l-2 border-yellow-400 pl-3 text-xl font-black uppercase tracking-tight text-red-500 sm:text-2xl">
              Tournament Information
            </h2>
          </div>
          <dl className="grid grid-cols-1 border-b border-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {information.map(({ label, value, Icon }) => (
              <div key={label} className="flex gap-3 border-b border-white/10 py-5 last:border-b-0 sm:border-b sm:px-4 sm:first:pl-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-yellow-400" strokeWidth={1.75} />
                <div>
                  <dt className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
                  <dd className="mt-1 text-sm font-bold text-zinc-100 sm:text-base">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section className="pt-10 sm:pt-12" aria-labelledby="about-tournament">
          <div className="border-b border-white/15 pb-3">
            <h2 id="about-tournament" className="border-l-2 border-yellow-400 pl-3 text-xl font-black uppercase tracking-tight text-red-500 sm:text-2xl">
              About This Tournament
            </h2>
          </div>
          <p className="max-w-3xl pt-5 text-sm leading-7 text-zinc-300 sm:text-base">
            Additional tournament details will be announced soon.
          </p>
        </section>

        <section className="pt-10 sm:pt-12" aria-labelledby="tournament-actions">
          <div className="border-b border-white/15 pb-3">
            <h2 id="tournament-actions" className="border-l-2 border-yellow-400 pl-3 text-xl font-black uppercase tracking-tight text-red-500 sm:text-2xl">
              Actions
            </h2>
          </div>
          <div className="grid gap-3 pt-5 sm:grid-cols-3">
            {hasRegistrationRoute(tournament) ? (
              <Link href={tournament.registrationUrl} className="inline-flex min-h-12 items-center justify-center rounded-sm bg-yellow-400 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">
                Register
              </Link>
            ) : null}

            <span aria-disabled="true" className="inline-flex min-h-12 cursor-not-allowed items-center justify-center rounded-sm border border-yellow-400/35 px-6 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-yellow-400/45">
              Tournament Rules
            </span>

            {resultsPublished ? (
              <Link href={`/results/${tournament.slug}`} className="inline-flex min-h-12 items-center justify-center rounded-sm border border-yellow-400 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition hover:bg-yellow-400 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400">
                Results
              </Link>
            ) : (
              <div className="text-center">
                <span aria-disabled="true" className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-sm border border-yellow-400/35 px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-yellow-400/45">
                  Results
                </span>
                <p className="mt-2 text-xs text-zinc-500">Available after the tournament</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
