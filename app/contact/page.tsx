import type { Metadata } from "next";

import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Contact | All-In Tournament Trail",
  description:
    "Contact All-In Tournament Trail with tournament, sponsorship, website, or general questions.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        compact
        subtitle="Send the All-In Tournament Trail team a question, suggestion, or inquiry."
        title="Contact"
      />
      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <p className="text-base leading-7 text-zinc-300">
          The contact form opens automatically on this page. You can also use
          the Contact tab at the right edge of the screen to reopen it.
        </p>
        <a
          className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-[#D4A017] transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
          href="mailto:info@allintrail.com"
        >
          info@allintrail.com
        </a>
      </section>
    </main>
  );
}
