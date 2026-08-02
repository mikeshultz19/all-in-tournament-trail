import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Privacy Policy | All-In Tournament Trail",
  description: "How All-In Tournament Trail handles website and tournament information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <header className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              This notice explains the information AITT uses to operate its website and tournament activities.
            </p>
          </header>

          <div className="max-w-3xl space-y-8 py-10 text-base leading-7 text-neutral-300">
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Information We Use</h2>
              <p className="mt-3">
                AITT may use contact, registration, membership, eligibility, acknowledgment, tournament, and limited payment-reference information needed to administer events and respond to inquiries.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Public Information</h2>
              <p className="mt-3">
                Only approved tournament information—such as display names, entries, results, and standings—is published. Private contact details, street addresses, payment details, and administrative notes are not displayed publicly.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Website Analytics</h2>
              <p className="mt-3">
                AITT uses limited website activity information to understand page usage and improve the site. Payments are processed by Square; AITT does not store raw card numbers or security codes.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Questions</h2>
              <p className="mt-3">
                For a privacy question or correction request, contact{" "}
                <a className="font-semibold text-yellow-400 underline underline-offset-4" href="mailto:info@allintrail.com">
                  info@allintrail.com
                </a>
                .
              </p>
            </section>
            <Link href="/" className="inline-flex text-sm font-black uppercase tracking-[0.14em] text-yellow-400 transition hover:text-yellow-300">
              ← Return to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
