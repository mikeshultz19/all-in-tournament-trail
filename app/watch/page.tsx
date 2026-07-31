import { getNextUpcomingTournament } from "@/lib/tournaments";
import { toPublicTournament } from "@/lib/tournament-record-adapter";

import Header from "@/components/Header";
import LiveStreamPlayer from "@/components/LiveStreamPlayer";
import TroubleshootingBanner from "@/components/TroubleshootingBanner";
import UpcomingTournamentPanel from "@/components/UpcomingTournamentPanel";
import WatchInfoCard from "@/components/WatchInfoCard";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";
import { watchPageData } from "@/data/watch";
import { getTournamentDisplay } from "@/lib/tournament-display";

export default async function WatchPage() {
  let upcomingTournament = watchPageData.tournament;

  try {
    const nextTournament = await getNextUpcomingTournament();
    if (nextTournament) {
      const publicTournament = toPublicTournament(nextTournament);
      const display = getTournamentDisplay(publicTournament);
      upcomingTournament = {
        label: "Current Tournament",
        lake: `${publicTournament.lake} Lake`,
        date: display.date,
        venue: publicTournament.venue ?? "To Be Announced",
        location: publicTournament.city
          ? `${publicTournament.city}, ${
              publicTournament.state === "Texas"
                ? "TX"
                : publicTournament.state
            }`
          : "To Be Announced",
        dateTime: publicTournament.date,
      };
    }
  } catch (error) {
    console.error("Watch page tournament load failed.", error);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Watch" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <header className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Watch Live
            </h1>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400 sm:text-base">
              Live Weigh-In Broadcast
            </p>
          </header>
        </div>
      </section>

      <div className={`${PUBLIC_PAGE_CONTAINER} py-10 md:py-14`}>
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.78fr)]">
          <LiveStreamPlayer />
          <UpcomingTournamentPanel tournament={upcomingTournament} />
        </div>

        <section aria-label="Watching information" className="mt-8 grid gap-5 md:grid-cols-3">
          <WatchInfoCard title="How to Watch">
            <p>The live weigh-in will begin at 1:00 PM. Come back before then so you don&apos;t miss a minute of the action.</p>
          </WatchInfoCard>
          <WatchInfoCard title="Weigh-In Info">
            <ul className="space-y-2 pl-4 marker:text-red-500">
              <li>Anglers must be in line in person to weigh in.</li>
              <li>Five legal fish limit. Legal dead fish incur a one-pound penalty each and are not eligible for Big Bass.</li>
              <li>Weigh-in order is based on official check-in.</li>
              <li>Official results will be posted after weigh-in.</li>
            </ul>
          </WatchInfoCard>
          <WatchInfoCard title="Stay Connected">
            <p>Follow us for live updates, photos, and announcements.</p>
            <nav aria-label="Social media" className="mt-4 flex flex-wrap gap-2">
              {watchPageData.socialLinks.map((link) => (
                <a key={link.label} href={link.href} className="inline-flex min-h-11 items-center border border-[#5B4715] px-3 text-xs font-black uppercase tracking-[0.1em] text-white transition hover:border-[#D4A017] hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]">{link.label}</a>
              ))}
            </nav>
          </WatchInfoCard>
        </section>

        <div className="mt-8"><TroubleshootingBanner /></div>
      </div>
    </main>
  );
}
