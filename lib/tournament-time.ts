import { TOURNAMENT_TIME_ZONE } from "@/config/tournament-operations";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function dateParts(date: string): [number, number, number] {
  const match = DATE_PATTERN.exec(date);
  if (!match) throw new Error(`Invalid tournament date: ${date}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function timeParts(time: string): [number, number] {
  const match = TIME_PATTERN.exec(time);
  if (!match) throw new Error(`Invalid tournament time: ${time}`);
  return [Number(match[1]), Number(match[2])];
}

function zonedParts(date: Date): Record<Intl.DateTimeFormatPartTypes, string> {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TOURNAMENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<
    Intl.DateTimeFormatPartTypes,
    string
  >;
}

function timeZoneOffset(date: Date): number {
  const parts = zonedParts(date);
  const representedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return representedAsUtc - date.getTime();
}

export function tournamentDateTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = dateParts(date);
  const [hour, minute] = timeParts(time);
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let result = new Date(localAsUtc - timeZoneOffset(new Date(localAsUtc)));
  result = new Date(localAsUtc - timeZoneOffset(result));
  return result;
}

export function tournamentDateAtNoonUtc(date: string): Date {
  const [year, month, day] = dateParts(date);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function previousTournamentDate(date: string): string {
  const [year, month, day] = dateParts(date);
  return new Date(Date.UTC(year, month - 1, day - 1))
    .toISOString()
    .slice(0, 10);
}

export function getTournamentLocalDate(date: Date): string {
  const parts = zonedParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatTournamentDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(tournamentDateAtNoonUtc(date));
}

export function formatTournamentTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TOURNAMENT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTournamentTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TOURNAMENT_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

export function formatPublicRegistrationTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TOURNAMENT_TIME_ZONE,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
}

export function isValidTournamentTime(time: string | null): time is string {
  return time !== null && TIME_PATTERN.test(time);
}
