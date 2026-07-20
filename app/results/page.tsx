import Image from "next/image";
import Link from "next/link";
import { getTournamentImage, tournaments } from "@/data/tournaments";

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            All-In Tournament Trail
          </p>

          <h1 className="mt-4 text-5xl font-black uppercase tracking-tight">
            Tournament Results
          </h1>

          <p className="mt-5 max-w-3xl text-lg text-neutral-400">
            Official tournament results, payouts, photos, statistics, and event
            recaps from every stop on the All-In Tournament Trail.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((tournament) => (
            <article
              key={tournament.slug}
              className="group overflow-hidden rounded-xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500 hover:shadow-2xl"
            >
              {/* Shared Hero Image */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={getTournamentImage(tournament)}
                  alt="All-In Tournament Trail"
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  priority={tournament.featured}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute left-4 top-4">
                  {tournament.resultsAvailable ? (
                    <span className="rounded-full border border-green-500/40 bg-green-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-green-300">
                      Official Results
                    </span>
                  ) : (
                    <span className="rounded-full border border-yellow-500/40 bg-yellow-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-yellow-300">
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4">
                  <h2 className="text-3xl font-black uppercase">
                    {tournament.lake}
                  </h2>

                  <p className="text-sm text-neutral-200">
                    {tournament.city}, Texas
                  </p>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-red-500">
                  {new Date(tournament.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Status
                    </p>

                    <p className="mt-1 font-semibold">
                      {tournament.resultsAvailable
                        ? "Results Available"
                        : "Tournament Pending"}
                    </p>
                  </div>

                  {tournament.resultsAvailable ? (
                    <Link
                      href={`/results/${tournament.slug}`}
                      className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-black uppercase transition hover:bg-red-500"
                    >
                      View Results
                    </Link>
                  ) : (
                    <span className="rounded-md border border-yellow-500/40 px-5 py-2.5 text-sm font-black uppercase text-yellow-300">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
