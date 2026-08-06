export default function FAQPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#D4A017]">
          Website
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase text-white">
          Frequently Asked Questions
        </h1>

        <p className="mt-3 text-neutral-400">
          Manage the frequently asked questions shown on the public website.
        </p>
      </div>

      <div className="rounded border border-white/10 bg-[#111111] p-8">
        <h2 className="text-xl font-black uppercase text-white">
          Coming Soon
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-400">
          This page will allow administrators to create, edit, publish, and
          preview frequently asked questions.
        </p>
      </div>
    </section>
  );
}