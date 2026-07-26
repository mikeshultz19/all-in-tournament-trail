import Image from "next/image";

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
  const logo = (
    <Image
      src={sponsor.image}
      alt={`${sponsor.name} logo`}
      width={500}
      height={220}
      className={`h-auto w-auto object-contain ${
        sponsor.scale === "small"
          ? "max-h-[40px] max-w-[85%]"
          : sponsor.scale === "compact"
            ? "max-h-[42px] max-w-[85%]"
            : "max-h-[48px] max-w-[85%]"
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
      className="flex size-full items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
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

      <div className="px-3 py-2 sm:px-4">
        <div className="grid grid-cols-2 gap-1 min-[640px]:grid-cols-4">
          {activeSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex h-16 min-w-0 items-center justify-center px-2 py-1 sm:h-20"
            >
              <SponsorLogo
                sponsor={sponsor}
                enableFadeTransition={enableFadeTransition}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
