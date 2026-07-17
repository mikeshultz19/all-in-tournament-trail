import { currentTournament } from "@/data/tournamentData";

type AwardIconProps = {
  type: "champion" | "gold" | "silver" | "bronze" | "bass";
};

function AwardIcon({ type }: AwardIconProps) {
  if (type === "bass") {
    return (
      <svg
        viewBox="0 0 120 80"
        aria-hidden="true"
        className="h-14 w-20"
        fill="none"
      >
        <path
          d="M27 42c12-20 37-26 58-15l17-11-3 18 12 8-12 8 3 18-17-11c-21 11-46 5-58-15Z"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M42 43c11 8 26 8 37-1M43 33c7-5 15-7 24-5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="84" cy="34" r="3" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="h-14 w-14"
      fill="none"
    >
      <path
        d="M28 16h44v18c0 16-9 29-22 35-13-6-22-19-22-35V16Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      <path
        d="M28 24H16v8c0 12 7 21 18 23M72 24h12v8c0 12-7 21-18 23"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M50 69v12M36 84h28"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <path
        d="m50 27 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

const awards = [
  {
    title: "Overall Champion",
    name: currentTournament.winners.champion.name,
    icon: "champion" as const,
    iconColor: "text-yellow-400",
    nameColor: "text-yellow-400",
    borderColor: "border-yellow-700/70",
  },
  {
    title: "Gold Pot Winner",
    name: currentTournament.winners.goldPot.name,
    icon: "gold" as const,
    iconColor: "text-yellow-400",
    nameColor: "text-yellow-400",
    borderColor: "border-yellow-700/70",
  },
  {
    title: "Silver Pot Winner",
    name: currentTournament.winners.silverPot.name,
    icon: "silver" as const,
    iconColor: "text-zinc-300",
    nameColor: "text-yellow-400",
    borderColor: "border-zinc-600/80",
  },
  {
    title: "Bronze Pot Winner",
    name: currentTournament.winners.bronzePot.name,
    icon: "bronze" as const,
    iconColor: "text-amber-600",
    nameColor: "text-yellow-400",
    borderColor: "border-amber-800/80",
  },
  {
    title: "Big Bass Winner",
    name: currentTournament.winners.bigBass.name,
    icon: "bass" as const,
    iconColor: "text-zinc-300",
    nameColor: "text-yellow-400",
    borderColor: "border-yellow-700/70",
  },
];

export default function WinnersCircle() {
  return (
    <section
      id="winners"
      className="border-b border-yellow-900/40 bg-[#050505] px-4 py-6"
    >
      <div className="mx-auto max-w-[1300px]">
        {/* Event-specific heading */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 h-px w-full max-w-[650px] bg-gradient-to-r from-transparent via-red-700 to-transparent" />

          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white md:text-2xl">
            Winner&apos;s Circle
          </h2>

          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 md:text-xs">
            Official Tournament Results
          </p>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300 md:text-sm">
            {currentTournament.lake}
            <span className="mx-3 text-red-600">•</span>
            {currentTournament.date}
          </p>

          <div className="mx-auto mt-4 h-px w-full max-w-[650px] bg-gradient-to-r from-transparent via-red-700 to-transparent" />
        </div>

        {/* Award cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {awards.map((award) => (
            <article
              key={award.title}
              className={`flex min-h-[150px] flex-col items-center justify-center rounded-md border bg-gradient-to-b from-zinc-900/80 to-black px-3 py-4 text-center ${award.borderColor}`}
            >
              <div className={award.iconColor}>
                <AwardIcon type={award.icon} />
              </div>

              <h3 className="mt-2 text-xs font-black uppercase tracking-wide text-zinc-200 md:text-sm">
                {award.title}
              </h3>

              <p
                className={`mt-3 text-sm font-black uppercase tracking-wide ${award.nameColor}`}
              >
                {award.name || "Your Team Here"}
              </p>

              <p className="mt-1 text-[10px] text-zinc-400">
                {currentTournament.lake}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}