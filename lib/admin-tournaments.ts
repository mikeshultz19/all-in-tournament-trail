import type { Tournament } from "@/types/tournament";

export function getInitialAdminTournament(
  tournaments: readonly Tournament[],
  now: Date,
  preferredId?: string,
): Tournament | undefined {
  if (preferredId) {
    const preferredTournament = tournaments.find(
      (tournament) => tournament.id === preferredId,
    );

    if (preferredTournament) {
      return preferredTournament;
    }
  }

  const sortedTournaments = [...tournaments].sort(
    (first, second) =>
      new Date(first.tournament_date).getTime() -
      new Date(second.tournament_date).getTime(),
  );
  const upcomingTournament = sortedTournaments.find(
    (tournament) =>
      tournament.status !== "Cancelled" &&
      new Date(tournament.tournament_date).getTime() >= now.getTime(),
  );

  if (upcomingTournament) {
    return upcomingTournament;
  }

  return sortedTournaments
    .filter(
      (tournament) =>
        new Date(tournament.tournament_date).getTime() < now.getTime(),
    )
    .at(-1);
}

export function groupAdminTournaments(
  tournaments: readonly Tournament[],
  now: Date,
): {
  upcoming: Tournament[];
  past: Tournament[];
} {
  const sortedTournaments = [...tournaments].sort(
    (first, second) =>
      new Date(first.tournament_date).getTime() -
      new Date(second.tournament_date).getTime(),
  );

  return {
    upcoming: sortedTournaments.filter(
      (tournament) =>
        new Date(tournament.tournament_date).getTime() >= now.getTime(),
    ),
    past: sortedTournaments
      .filter(
        (tournament) =>
          new Date(tournament.tournament_date).getTime() < now.getTime(),
      )
      .reverse(),
  };
}

export function formatAdminTournamentDate(
  value: string | Date,
  includeWeekday = false,
): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: includeWeekday ? "long" : undefined,
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(value instanceof Date ? value : new Date(value));
}

export function withTournamentContext(href: string, tournamentId: string) {
  const url = new URL(href, "https://admin.aitt.local");
  url.searchParams.set("tournament", tournamentId);

  return `${url.pathname}${url.search}${url.hash}`;
}
