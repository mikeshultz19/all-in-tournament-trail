import { getEffectiveTournamentDate, type Tournament } from "@/data/tournaments";

export const TOURNAMENT_LAUNCH_TYPE_LABELS = {
  TRAILERING: "Trailering",
  NUMBERED_START: "Numbered Start",
} as const;

export interface TournamentDisplay {
  date: string;
  dayOfWeek: string;
  ramp: string;
  location: string;
  hours: string;
  stopFishing: string;
  launchType: string;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
}

export function getTournamentDisplay(tournament: Tournament): TournamentDisplay {
  const effectiveDate = getEffectiveTournamentDate(tournament);
  const date = new Date(`${effectiveDate}T12:00:00Z`);
  const stopFishing = formatTime(tournament.stopFishingTime);

  return {
    date: new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date),
    dayOfWeek: new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      weekday: "long",
    }).format(date),
    ramp: tournament.venue ?? "To Be Announced",
    location: [tournament.city, tournament.state].filter(Boolean).join(", "),
    hours: `${tournament.startTimeDisplay} – ${stopFishing}`,
    stopFishing: `Stop Fishing: ${stopFishing}`,
    launchType: TOURNAMENT_LAUNCH_TYPE_LABELS[tournament.launchType],
  };
}
