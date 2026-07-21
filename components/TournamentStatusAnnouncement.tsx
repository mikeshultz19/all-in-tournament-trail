import { getEffectiveTournamentDate, type Tournament } from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import { formatTournamentDate, formatTournamentTimestamp } from "@/lib/tournament-time";

const STATUS_STYLES = {
  scheduled: "border-[#4A3A12] bg-[#111111]",
  weather_watch: "border-amber-500/60 bg-amber-950/20",
  delayed: "border-red-500 bg-red-950/25",
  postponed: "border-red-500 bg-red-950/35",
  cancelled: "border-red-500 bg-red-950/40",
  rescheduled: "border-[#D4A017] bg-[#2a2108]",
} as const;

export default function TournamentStatusAnnouncement({ tournament, compact = tournament.tournamentStatus === "scheduled" }: { tournament: Tournament; compact?: boolean }) {
  const label = TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus];
  const isUrgent = ["delayed", "postponed", "cancelled"].includes(tournament.tournamentStatus);

  return (
    <article aria-labelledby={`status-${tournament.slug}`} aria-live={isUrgent ? "assertive" : "polite"} className={`border-l-4 ${STATUS_STYLES[tournament.tournamentStatus]} ${compact ? "px-5 py-4" : "px-5 py-6 sm:px-6"}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D4A017]">{label}</p>
        <time dateTime={tournament.statusUpdatedAt} className="text-xs text-neutral-500">Updated {formatTournamentTimestamp(tournament.statusUpdatedAt)}</time>
      </div>
      <h3 id={`status-${tournament.slug}`} className={`${compact ? "mt-2 text-lg" : "mt-3 text-2xl"} font-black uppercase tracking-tight text-white`}>{tournament.name}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Tournament date: {formatTournamentDate(getEffectiveTournamentDate(tournament))}
      </p>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-300">{tournament.statusMessage}</p>
      {tournament.tournamentStatus === "weather_watch" && <p className="mt-2 text-sm font-semibold text-amber-200">Tournament officials are monitoring conditions.</p>}
      {tournament.rescheduledDate && ["postponed", "rescheduled"].includes(tournament.tournamentStatus) && (
        <p className="mt-3 text-sm font-black uppercase tracking-wide text-[#D4A017]">
          {tournament.tournamentStatus === "rescheduled" ? "New tournament date" : "Replacement date"}: {formatTournamentDate(tournament.rescheduledDate)}
        </p>
      )}
    </article>
  );
}
