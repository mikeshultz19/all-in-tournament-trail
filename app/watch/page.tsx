import { Radio } from "lucide-react";

import Header from "@/components/Header";
import LiveStreamPlayer from "@/components/LiveStreamPlayer";
import TroubleshootingBanner from "@/components/TroubleshootingBanner";
import UpcomingTournamentPanel from "@/components/UpcomingTournamentPanel";
import WatchInfoCard from "@/components/WatchInfoCard";
import { watchPageData } from "@/data/watch";

export default function WatchPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Watch" />

      <section className="border-b border-[#5B4715] bg-[#111111]">
        <div className="mx-auto max-w-[1400px] px-5 py-9 sm:px-6 sm:py-11">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-red-700/15 text-red-500 ring-1 ring-red-600/40" aria-hidden="true">
              <Radio className="size-5" />
            </span>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[0.04em] text-red-500 sm:text-4xl">Watch Live</h1>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400 sm:text-base">Live Weigh-In Broadcast</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6 sm:py-10">
        <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.78fr)]">
          <LiveStreamPlayer />
          <UpcomingTournamentPanel tournament={watchPageData.tournament} />
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
