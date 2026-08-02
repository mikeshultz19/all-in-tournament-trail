import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export const metadata: Metadata = {
  title: "Terms of Use | All-In Tournament Trail",
  description: "Terms for using the All-In Tournament Trail website.",
};

export default function TermsPage() {
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
              Terms of Use
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              These terms apply to use of the public AITT website.
            </p>
          </header>

          <div className="max-w-3xl space-y-8 py-10 text-base leading-7 text-neutral-300">
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Website Information</h2>
              <p className="mt-3">
                AITT works to keep schedules, registration status, conditions, results, and other public information current. Tournament status and instructions may change when safety or operational conditions require it.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Controlling Rules</h2>
              <p className="mt-3">
                The{" "}
                <Link href="/rules" className="font-semibold text-yellow-400 underline underline-offset-4">
                  Official Tournament Rules
                </Link>{" "}
                control tournament eligibility, conduct, procedures, penalties, and competition. General website summaries do not replace those rules.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Safe Participation</h2>
              <p className="mt-3">
                No website content, schedule, deadline, or competitive opportunity requires a participant to operate a vessel unsafely or continue in unsafe conditions.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-black uppercase text-[#D4A017]">Contact</h2>
              <p className="mt-3">
                Questions about this website may be sent to{" "}
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
