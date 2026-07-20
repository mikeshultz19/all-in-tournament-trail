import PageHeader from "@/components/PageHeader";
import { tournaments } from "@/data/tournaments";

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* PAGE HEADER */}
<PageHeader
  title="2026–2027 Schedule"
  subtitle="Review the full tournament information before registering."
/>

      {/* EVENT INFORMATION */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <h2 className="shrink-0 text-xl font-black uppercase tracking-wide sm:text-2xl">
              Event Information
            </h2>

            <div className="h-px flex-1 bg-white/15" />
          </div>

          <p className="mt-2 text-sm text-neutral-400">
            Review the full tournament information before registering.
          </p>
        </div>

        {/* DESKTOP SCHEDULE */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[70px_155px_1.25fr_1fr_125px_140px] items-center gap-5 border-b border-white/25 px-3 pb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
            <span>Event</span>
            <span>Date</span>
            <span>Lake</span>
            <span>City</span>
            <span>Event Info</span>
            <span className="text-right">Register</span>
          </div>

          <div>
            {tournaments.map((tournament, index) => (
              <article
                key={tournament.id}
                className="grid grid-cols-[70px_155px_1.25fr_1fr_125px_140px] items-center gap-5 border-b border-white/15 px-3 py-6 transition hover:bg-white/[0.025]"
              >
                <span className="text-2xl font-black text-red-500">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm font-bold uppercase text-neutral-200">
                  {formatDate(tournament.date)}
                </span>

                <div>
                  <h3 className="text-lg font-black uppercase tracking-wide">
                    {tournament.lake}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {tournament.launchSite}
                  </p>
                </div>

                <span className="text-sm font-semibold uppercase text-neutral-300">
                  {tournament.city}, TX
                </span>

                <span
                  aria-disabled="true"
                  className="w-fit cursor-not-allowed border-b border-neutral-800 pb-1 text-sm font-semibold text-neutral-600"
                >
                  View Info
                </span>

                <div className="text-right">
                  {tournament.registrationOpen ? (
                    <span
                      aria-disabled="true"
                      className="inline-flex min-w-32 cursor-not-allowed items-center justify-center bg-red-950 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-400"
                    >
                      Register
                    </span>
                  ) : (
                    <span className="inline-flex min-w-32 items-center justify-center border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-600">
                      Closed
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* MOBILE SCHEDULE */}
        <div className="divide-y divide-white/15 border-t border-white/20 md:hidden">
          {tournaments.map((tournament, index) => (
            <article key={tournament.id} className="py-6">
              <div className="flex items-start gap-4">
                <span className="text-2xl font-black leading-none text-red-500">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                    {formatDate(tournament.date)}
                  </p>

                  <h3 className="mt-2 text-xl font-black uppercase">
                    {tournament.lake}
                  </h3>

                  <p className="mt-1 text-sm text-neutral-400">
                    {tournament.city}, TX
                  </p>

                  <p className="mt-1 text-sm text-neutral-500">
                    {tournament.launchSite}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span
                      aria-disabled="true"
                      className="cursor-not-allowed border-b border-neutral-800 pb-1 text-sm font-semibold text-neutral-600"
                    >
                      View Event Info
                    </span>

                    {tournament.registrationOpen ? (
                      <span
                        aria-disabled="true"
                        className="cursor-not-allowed bg-red-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-neutral-400"
                      >
                        Register
                      </span>
                    ) : (
                      <span className="border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-wider text-neutral-600">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
