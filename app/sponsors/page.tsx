import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Sponsors | All In Tournament Trail",
  description:
    "Meet the businesses that support All In Tournament Trail and competitive bass fishing.",
  alternates: {
    canonical: "/sponsors",
  },
};

interface PublicSponsor {
  name: string;
  logo: string;
  logoFit: "contain" | "cover";
  softenWhiteBackground?: boolean;
  partnershipIntro: string;
  description: string;
  website: string;
  ctaLabel: string;
}

const publicSponsors: PublicSponsor[] = [
  {
    name: "Texas Boat Works",
    logo: "/images/sponsors/texas-boat-works.png",
    logoFit: "contain",
    partnershipIntro:
      "AITT is proud to partner with Texas Boat Works, a trusted resource for boat sales, financing, service, and parts.",
    description:
      "“Our commitment extends beyond mere transactions—we’re here to enhance your entire boating journey. Whether you’re exploring new boats or seeking pre-owned options, our friendly and knowledgeable teams in sales, financing, service, and parts are dedicated to ensuring your experience is exceptional.”",
    website: "https://www.texasboatworks.com",
    ctaLabel: "Visit Texas Boat Works →",
  },
  {
    name: "Fenix Parts",
    logo: "/images/sponsors/fenix-parts-logo-bright-green.png",
    logoFit: "contain",
    partnershipIntro:
      "AITT is proud to partner with Fenix Parts, a trusted leader in quality recycled auto parts.",
    description:
      "With more than 30 locations nationwide and over 1 million parts in stock, Fenix Parts helps customers find reliable engines, transmissions, body panels, interior components, and more—backed by knowledgeable service and strong warranty options.",
    website: "https://fenixparts.com",
    ctaLabel: "Visit Fenix Parts →",
  },
  {
    name: "Mad Dawg Graphics & Design",
    logo: "/sponsors/maddawg.png",
    logoFit: "contain",
    softenWhiteBackground: true,
    partnershipIntro:
      "AITT is proud to partner with Mad Dawg Graphics & Design for custom graphics, signage, apparel, and branding.",
    description:
      "Banners • Signs • Coro/Metal • Sublimation • Wraps • Embroidery • Screen Printing • and more",
    website: "https://facebook.com/BillyandGarry",
    ctaLabel: "Visit Mad Dawg Graphics & Design →",
  },
  {
    name: "Yukon Outfitters",
    logo: "/sponsors/Yukon-Outfitters.png",
    logoFit: "cover",
    partnershipIntro:
      "AITT is proud to partner with Yukon Outfitters, a brand built for people who live for the outdoors.",
    description:
      "“Whether your journey starts and ends in your own backyard or takes you to the edges of the known wilderness, put your trust in Yukon Outfitters.”",
    website: "https://yukon-outfitters.com",
    ctaLabel: "Visit Yukon Outfitters →",
  },
];

export default function SponsorsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header activeItem="Sponsors" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All In Tournament Trail
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Sponsors
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              Support competitive bass fishing and connect your business with the AITT community.
            </p>

            <p className="mt-5 text-sm leading-6 text-neutral-500">
              Interested in partnering with AITT?{" "}
              <Link
                href="/sponsorship-opportunities"
                className="font-bold text-[#D4A017] transition-colors hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
              >
                Learn about sponsorship opportunities →
              </Link>
            </p>
          </div>

          <section aria-labelledby="partners-heading" className="mt-8">
            <h2
              id="partners-heading"
              className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl"
            >
              Our Partners
            </h2>

            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {publicSponsors.map((sponsor) => (
                <article
                  key={sponsor.name}
                  className="grid min-w-0 gap-5 py-7 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center lg:grid-cols-[210px_minmax(0,1fr)_auto] lg:gap-8"
                >
                  <div className="relative flex min-h-24 items-center justify-center sm:min-h-28">
                    {sponsor.softenWhiteBackground ? (
                      <Image
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        width={1254}
                        height={1254}
                        className="max-h-24 w-auto border border-[#D4A017]/40 object-contain opacity-80 sm:max-h-28"
                      />
                    ) : (
                      <Image
                        src={sponsor.logo}
                        alt={`${sponsor.name} logo`}
                        fill
                        sizes="(min-width: 1024px) 210px, (min-width: 640px) 180px, 100vw"
                        className={`${sponsor.logoFit === "contain" ? "object-contain" : "object-cover"} object-center`}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">
                      {sponsor.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-300 sm:text-base">
                      {sponsor.partnershipIntro}
                    </p>
                    <p className="mt-3 text-sm italic leading-6 text-neutral-400">
                      {sponsor.description}
                    </p>
                  </div>

                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-sm font-black uppercase tracking-wide text-[#D4A017] transition-colors hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] sm:col-start-2 lg:col-start-auto lg:justify-self-end"
                  >
                    {sponsor.ctaLabel}
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
