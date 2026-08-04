export default function RulesPage() {
  return (
    <section className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Website
        </p>

        <h1 className="mt-2 text-3xl font-black uppercase text-white">
          Rules
        </h1>

        <p className="mt-3 text-neutral-400">
          Manage the official tournament rules shown on the public website.
        </p>
      </div>

      <div className="rounded border border-white/10 bg-[#111111] p-8">
        <h2 className="text-xl font-black uppercase text-white">
          Coming Soon
        </h2>

        <p className="mt-4 max-w-2xl text-neutral-400">
          This page will allow administrators to create, edit, publish,
          and preview the official tournament rules.
        </p>
      </div>
    </section>
  );
}