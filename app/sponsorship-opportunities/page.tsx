import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Sponsorship Opportunities | All In Tournament Trail",
  description:
    "Partner with All In Tournament Trail and connect with competitive bass anglers and outdoor enthusiasts.",
  alternates: {
    canonical: "/sponsorship-opportunities",
  },
};

const sponsorshipBenefits = [
  "Website exposure",
  "Social media promotion",
  "Tournament recognition",
  "Angler engagement",
  "Event visibility",
  "Future promotional opportunities",
];

const sponsorshipLevels = [
  {
    name: "Supporting Sponsor",
    range: "Under $1,000",
    copy: "Official AITT sponsor recognition, logo and business listing on the Sponsors Page, website link, sponsor announcement, and occasional social-media recognition.",
  },
  {
    name: "Silver Sponsor",
    range: "$1,000–$2,499",
    copy: "Everything in Supporting, plus seasonal recognition, approved sponsor promotions, standard logo placement on applicable event signage, prize/program recognition, and the opportunity to provide promotional materials to anglers.",
  },
  {
    name: "Gold Sponsor",
    range: "$2,500–$4,999",
    copy: "Everything in Silver, plus larger and more prominent event branding, enhanced Sponsors Page recognition, featured social-media exposure, and the opportunity for an approved on-site presence at regular-season events.",
  },
  {
    name: "Premier Sponsor",
    range: "$5,000+",
    copy: "AITT’s highest sponsorship level. Includes priority event branding, Premier placement on the Sponsors Page, homepage recognition, enhanced Championship exposure, priority social-media recognition, and first consideration for Championship, event, prize, or presenting sponsorship opportunities.",
  },
] as const;

export default function SponsorshipOpportunitiesPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header activeItem="Sponsors" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <section aria-labelledby="partnership-heading">
            <h1
              id="partnership-heading"
              className="break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
            >
              Partner With All In Tournament Trail
            </h1>

            <div className="mt-6 max-w-4xl space-y-5 text-base leading-7 text-neutral-300">
              <p>
                The All In Tournament Trail is actively seeking business partners
                and sponsors who want to support competitive bass fishing while
                reaching a dedicated community of anglers and outdoor enthusiasts.
              </p>
              <p>
                Whether you are a local business, regional company, or national
                brand, AITT offers sponsorship opportunities designed to provide
                meaningful visibility both on and off the water.
              </p>
            </div>

            <div className="mt-10 border-y border-white/10 py-8">
              <h2 className="break-words text-xl font-black uppercase tracking-wide text-[#D4A017]">
                Sponsorship benefits may include
              </h2>
              <ul className="mt-5 grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {sponsorshipBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 text-sm font-semibold text-neutral-200 sm:text-base"
                  >
                    <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 max-w-4xl">
              <section aria-labelledby="sponsorship-levels-heading" className="max-w-6xl">
                <h2
                  id="sponsorship-levels-heading"
                  className="break-words text-2xl font-black uppercase tracking-wide text-[#D4A017]"
                >
                  Sponsorship Levels
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-neutral-300 sm:text-base sm:leading-7">
                  AITT sponsorship levels are based on total approved sponsorship value, including cash, products, prizes, gift cards, and services. Each level builds on the benefits of the tier below it.
                </p>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {sponsorshipLevels.map((level, index) => (
                    <article
                      key={level.name}
                      className={`flex min-w-0 flex-col border bg-[#111111] p-5 ${
                        index >= 2
                          ? "border-[#D4A017]/60"
                          : "border-white/15"
                      } ${index === 3 ? "shadow-[0_8px_24px_rgba(212,160,23,0.12)]" : ""}`}
                    >
                      <h3 className="break-words text-base font-black uppercase tracking-wide text-white">
                        {level.name}
                      </h3>
                      <p className="mt-1 text-sm font-black text-[#D4A017]">
                        {level.range}
                      </p>
                      <p className="mt-4 text-sm leading-6 text-neutral-300">
                        {level.copy}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-8 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide text-[#D4A017]">
                      Custom Sponsorship Opportunities
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      AITT can also build custom partnerships around individual tournaments, the Championship, Big Bass, prizes, products, services, and presenting sponsorships. Category exclusivity and naming rights may also be available through separate agreements.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wide text-[#D4A017]">
                      Sponsorship Value
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-300">
                      Non-cash contributions such as products, prizes, gift cards, and services may count toward sponsorship level based on an AITT-approved value. Event participation and physical branding are subject to available space, venue requirements, and AITT approval.
                    </p>
                  </div>
                </div>
              </section>

              <p className="text-base leading-7 text-neutral-300">
                We would welcome the opportunity to discuss a sponsorship package
                that fits your business goals.
              </p>
              <p className="mt-4 text-base leading-7 text-neutral-300">
                If you are interested in becoming an AITT sponsor, please contact
                us and we will get back with you promptly to discuss available
                opportunities.
              </p>
              <Link
                href="/contact"
                className="mt-7 inline-flex min-h-12 items-center justify-center bg-red-700 px-7 py-3 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
              >
                Contact Us
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
