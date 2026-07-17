import Link from "next/link";

const headlines = [
  {
    category: "Schedule",
    title: "2026–2027 Tournament Schedule Announced",
    href: "/schedule",
  },
  {
    category: "AOY",
    title: "How Angler of the Year Points Will Work",
    href: "/news/aoy-points",
  },
  {
    category: "Rules",
    title: "Official Tournament Rules and Requirements",
    href: "/rules",
  },
];

export default function TournamentTrailNews() {
  return (
    <article className="flex h-full min-h-[330px] flex-col overflow-hidden rounded-md border border-yellow-700/50 bg-[#080808]">
      {/* Header */}
      <div className="flex h-11 items-center gap-3 border-b border-yellow-700/30 px-4">
        <h2 className="shrink-0 text-xs font-black uppercase tracking-[0.16em] text-red-500 sm:text-sm">
          Tournament Trail News
        </h2>

        <div className="h-px flex-1 bg-gradient-to-r from-red-700/80 to-transparent" />

        <Link
          href="/news"
          className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 transition hover:text-yellow-400"
        >
          View All
        </Link>
      </div>

      {/* Content */}
      <div className="grid flex-1 md:grid-cols-[1.55fr_0.85fr]">
        {/* Featured story */}
        <div
          className="relative min-h-[220px] bg-cover bg-center md:min-h-0"
          style={{
            backgroundImage: "url('/images/all-in-flyer.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />

          <div className="relative flex h-full max-w-lg flex-col justify-end p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-yellow-400">
              Featured Story
            </p>

            <h3 className="mt-2 max-w-md text-xl font-black uppercase leading-tight text-white lg:text-2xl">
              Registration Opens for the Inaugural Season
            </h3>

            <p className="mt-2 max-w-md text-xs leading-5 text-zinc-300 sm:text-sm">
              Teams can now register for the opening event of the All In
              Tournament Trail at Eagle Mountain Lake.
            </p>

            <Link
              href="/register"
              className="mt-4 inline-flex w-fit border border-red-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-red-600"
            >
              Read Story
            </Link>
          </div>
        </div>

        {/* Secondary headlines */}
        <div className="divide-y divide-yellow-700/20 border-t border-yellow-700/30 bg-black md:border-l md:border-t-0">
          {headlines.map((headline) => (
            <Link
              key={headline.title}
              href={headline.href}
              className="group flex min-h-[95px] items-center justify-between gap-3 px-4 py-3 transition hover:bg-zinc-950"
            >
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-yellow-500">
                  {headline.category}
                </p>

                <h3 className="mt-1 text-xs font-black uppercase leading-5 text-zinc-200 transition group-hover:text-white sm:text-sm">
                  {headline.title}
                </h3>
              </div>

              <span className="shrink-0 text-xl font-light text-red-500 transition group-hover:translate-x-1">
                ›
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}