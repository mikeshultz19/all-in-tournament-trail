import Image from "next/image";
import { getHomepageSponsors, type Sponsor } from "@/data/sponsors";

export default function SponsorHome({ sponsors }: { sponsors: Sponsor[] }) {
  const homepageSponsors = getHomepageSponsors(sponsors);

  if (homepageSponsors.length === 0) return null;

  return (
    <section
      aria-labelledby="major-sponsors-heading"
      className="border border-[#4A3A12] bg-[#0b0b0b] py-5 pl-5 pr-16 sm:p-5"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <h2
          id="major-sponsors-heading"
          className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]"
        >
          AITT BROUGHT TO YOU BY...
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-700/70 to-transparent" />
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
        {homepageSponsors.map((sponsor) => {
          const logo = (
            <Image
              src={sponsor.logo}
              alt={`${sponsor.name} logo`}
              width={260}
              height={120}
              className="h-20 w-full object-contain opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
            />
          );

          return (
            <li key={sponsor.id} className="flex min-w-0 items-center justify-center border border-white/10 bg-black/40 p-4">
              {sponsor.websiteUrl ? (
                <a
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
                  className="group flex w-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
                >
                  {logo}
                </a>
              ) : (
                <div className="group flex w-full items-center justify-center">{logo}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
