import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tournaments } from "@/data/tournaments";

interface ResultsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ResultsDetailPage({
  params,
}: ResultsDetailPageProps) {
  const { slug } = await params;

  const tournament = tournaments.find(
    (item) => item.slug === slug
  );

  if (!tournament) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative h-[360px] overflow-hidden border-b border-white/10">
        <Image
          src="/images/tournament-hero.png"
          alt="All-In Tournament Trail"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-6 py-10">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
              All-In Tournament Trail
            </p>

            <h1 className="mt-3 text-5xl font-black uppercase">
              {tournament.lake}
            </h1>

            <p className="mt-3 text-neutral-200">
              {formatDate(tournament.date)}
            </p>

            <p className="mt-1 text-neutral-300">
              {tournament.city}, Texas
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-xl border border-white/10 bg-[#111111] p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                Launch Site
              </p>

              <p className="mt-2 text-lg font-bold">
                {tournament.launchSite}
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                Season
              </p>

              <p className="mt-2 text-lg font-bold">
                {tournament.season}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.25em] text-yellow-400">
              Results Coming Soon
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase">
              Tournament results have not been posted
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
              Official standings, winning weight, Big Bass, and payouts will
              appear here after the tournament is completed.
            </p>

            <Link
              href="/results"
              className="mt-8 inline-flex rounded-md bg-red-600 px-6 py-3 text-sm font-black uppercase transition hover:bg-red-500"
            >
              Back to Results
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
