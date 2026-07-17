export default function SeasonStrip() {
  return (
    <section className="border-y border-yellow-600/50 bg-black">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-8 py-4">
        <div className="flex items-baseline gap-5">
          <span className="text-2xl font-black uppercase tracking-wide text-yellow-500 md:text-4xl">
            Inaugural Season
          </span>

          <span className="text-2xl font-black text-white md:text-4xl">
            2026–2027
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-lg font-black text-white md:text-2xl">
          <span>9 Tournaments</span>
          <span className="text-red-600">★</span>
          <span>1 Champion</span>
          <span className="text-red-600">★</span>
          <span className="text-yellow-500">All In</span>
        </div>
      </div>
    </section>
  );
}