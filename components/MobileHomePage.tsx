import Link from "next/link";
import { Mail } from "lucide-react";

import MobileLatestNews from "@/components/MobileLatestNews";
import MobileFeaturedTournament from "@/components/MobileFeaturedTournament";
import SponsorHome from "@/components/SponsorHome";
import MobileWinnerCircle from "@/components/MobileWinnerCircle";
import RegistrationInterest from "@/components/RegistrationInterest";
import type { Announcement } from "@/types/announcement";

type MobileHomePageProps = {
  announcements: Announcement[];
  featuredTournament: Parameters<
    typeof MobileFeaturedTournament
  >[0]["tournament"];
  operations: Parameters<
    typeof MobileFeaturedTournament
  >[0]["operations"];
  homepageSponsors: Parameters<typeof SponsorHome>[0]["sponsors"];
  latestResults: Parameters<typeof MobileWinnerCircle>[0]["latestResults"];
};

export default function MobileHomePage({
  announcements,
  featuredTournament,
  operations,
  homepageSponsors,
  latestResults,
}: MobileHomePageProps) {
  return (
    <section className="bg-black px-4 pb-4 pt-2 md:hidden">
      <div className="mx-auto w-full max-w-[430px] space-y-4">
        <div className="flex min-h-10 items-center justify-center border-b border-white/10 pb-2">
          <div className="flex min-w-0 flex-1 items-center justify-center pr-3">
            <Link
              href="/no-forward-facing-sonar"
              className="group inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[0.68rem] font-black uppercase tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-yellow-400"
            >
              <span className="text-[#D4A017]">No FFS</span>

              <span className="text-zinc-500 transition group-hover:text-yellow-300">
                Learn Why →
              </span>
            </Link>
          </div>

          <div
            aria-hidden="true"
            className="h-7 w-px shrink-0 bg-white/15"
          />

          <div className="flex min-w-0 flex-1 items-center justify-center pl-3">
            <RegistrationInterest
              display="inline"
              icon={
                <Mail
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[#D4A017] transition group-hover:text-yellow-300"
                />
              }
            />
          </div>
        </div>

        <MobileLatestNews announcements={announcements} />

        <MobileFeaturedTournament
          tournament={featuredTournament}
          operations={operations}
        />

        <SponsorHome sponsors={homepageSponsors} />

        <MobileWinnerCircle latestResults={latestResults} />
      </div>
    </section>
  );
}
