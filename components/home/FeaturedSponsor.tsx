import Image from "next/image";
import Link from "next/link";

export interface FeaturedSponsorItem {
  id: string;
  name: string;
  image: string;
  url?: string;
  tier: "presenting" | "featured";
  scale?: "standard" | "compact" | "small";
  active: boolean;
  displayOrder: number;
}

interface FeaturedSponsorProps {
  featuredSponsors: readonly FeaturedSponsorItem[];
  enableFadeTransition?: boolean;
}

function SponsorLogo({
  sponsor,
  enableFadeTransition = false,
}: {
  sponsor: FeaturedSponsorItem;
  enableFadeTransition?: boolean;
}) {
  const isMadDawg = sponsor.name === "Mad Dawg Graphics & Design";

  const logo = (
    <Image
      src={sponsor.image}
      alt={
        isMadDawg
          ? sponsor.name
          : `${sponsor.name} logo`
      }
      width={500}
      height={220}
      className={`h-auto w-auto object-contain ${
        isMadDawg
          ? "bg-[#0b0b0b] max-h-[72px] max-w-[96%]"
          : sponsor.scale === "small"
            ? "max-h-[48px] max-w-[90%]"
            : sponsor.scale === "compact"
              ? "max-h-[52px] max-w-[90%]"
              : "max-h-[64px] max-w-[92%]"
      } ${
        enableFadeTransition
          ? "transition-opacity duration-500 ease-in-out"
          : ""
      }`}
    />
  );

  if (!sponsor.url) {
    return logo;
  }

  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${sponsor.name} website (opens in a new tab)`}
      className="flex size-full cursor-pointer items-center justify-center opacity-85 grayscale transition-[opacity,filter] hover:opacity-100 hover:grayscale-0 focus-visible:opacity-100 focus-visible:grayscale-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
    >
      {logo}
    </a>
  );
}

export default function FeaturedSponsor({
  featuredSponsors,
  enableFadeTransition = false,
}: FeaturedSponsorProps) {
  const activeSponsors = featuredSponsors
    .filter((item) => item.active)
    .toSorted((a, b) => a.displayOrder - b.displayOrder);

  if (activeSponsors.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="featured-sponsor-heading"
      className="border border-[#4A3A12] bg-[#0b0b0b]"
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <h2
          id="featured-sponsor-heading"
          className="shrink-0 text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]"
        >
          AITT BROUGHT TO YOU BY...
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-red-700/70 to-transparent" />
      </div>

      <div className="px-3 py-3 sm:px-4">
        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 md:grid-cols-3">
          {activeSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex h-20 min-w-0 items-center justify-center px-3 py-2 sm:h-24"
            >
              <SponsorLogo
                sponsor={sponsor}
                enableFadeTransition={enableFadeTransition}
              />
            </div>
          ))}
        </div>

        <p className="border-t border-white/10 px-2 pb-1 pt-3 text-center text-xs leading-5 text-neutral-500">
          AITT is open to sponsorship opportunities.{" "}
          <Link
            href="/sponsors"
            aria-label="Learn more about AITT sponsorship opportunities"
            className="cursor-pointer font-bold text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
          >
            Learn more
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
