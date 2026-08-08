import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck } from "lucide-react";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Sponsors | All-In Tournament Trail",
  description:
    "Partner with All-In Tournament Trail and connect with competitive bass anglers and outdoor enthusiasts.",
  alternates: {
    canonical: "/sponsors",
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

export default function SponsorsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black text-white">
      <Header activeItem="Sponsors" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <div className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Sponsors
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              Support competitive bass fishing and connect your business with the AITT community.
            </p>
          </div>

          <section aria-labelledby="partnership-heading" className="mt-8">
            <h2
              id="partnership-heading"
              className="break-words text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
            >
              Partner With All-In Tournament Trail
            </h2>

            <div className="mt-6 max-w-4xl space-y-5 text-base leading-7 text-neutral-300">
              <p>
                The All-In Tournament Trail is actively seeking business partners
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
