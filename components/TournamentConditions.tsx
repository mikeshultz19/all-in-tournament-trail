import TournamentInfoIcon from "@/components/TournamentInfoIcon";
import type { Tournament } from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import { formatTournamentTimestamp } from "@/lib/tournament-time";
import type { SafeLightViewModel } from "@/lib/tournament-view-model";
import type {
  TournamentWeatherDay,
  TournamentWeatherResult,
} from "@/lib/tournament-weather";

const STATUS_INDICATOR_STYLES = {
  scheduled: "bg-emerald-400",
  weather_watch: "bg-amber-400",
  delayed: "bg-orange-400",
  postponed: "bg-orange-400",
  cancelled: "bg-red-500",
  rescheduled: "bg-sky-400",
} as const;

function formatForecastWeekday(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function weatherIndicator(day: TournamentWeatherDay) {
  if (day.condition === "clear" || day.condition === "mostly-clear") return "☀";
  if (day.condition === "partly-cloudy" || day.condition === "overcast") {
    return "☁";
  }
  if (day.condition === "fog") return "≋";
  if (day.condition === "snow" || day.condition === "snow-showers") return "❄";
  if (
    day.condition === "drizzle" ||
    day.condition === "rain" ||
    day.condition === "freezing-rain" ||
    day.condition === "rain-showers" ||
    day.condition === "thunderstorms"
  ) {
    return "☂";
  }
  return "○";
}

function weatherDayLabel(day: TournamentWeatherDay) {
  const temperatures = [
    day.highF === null ? null : `high ${Math.round(day.highF)} degrees`,
    day.lowF === null ? null : `low ${Math.round(day.lowF)} degrees`,
  ]
    .filter(Boolean)
    .join(", ");
  const rain =
    day.precipitationProbability === null
      ? ""
      : `, ${Math.round(day.precipitationProbability)} percent chance of rain`;

  return `${formatForecastWeekday(day.date)}, ${day.conditionText}${temperatures ? `, ${temperatures}` : ""}${rain}`;
}

export default function TournamentConditions({
  tournament,
  safeLight,
  weather,
}: {
  tournament: Tournament;
  safeLight: SafeLightViewModel;
  weather: TournamentWeatherResult;
}) {
  const forecast = weather.status === "available" ? weather.forecast : null;

  return (
    <section
      aria-labelledby="tournament-conditions-heading"
      className="min-w-0 border border-[#4A3A12] bg-[#111111] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id="tournament-conditions-heading"
            className="text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]"
          >
            Tournament Conditions
          </h2>
          <p className="inline-flex items-center gap-2 border border-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${STATUS_INDICATOR_STYLES[tournament.tournamentStatus]}`}
            />
            {TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus]}
          </p>
        </div>
        {safeLight.isOverridden && (
          <span className="border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            Adjusted by Tournament Officials
          </span>
        )}
      </div>

      <div
        data-conditions-row
        className="grid min-w-0 gap-3 pt-3 md:grid-cols-[minmax(170px,0.34fr)_minmax(0,1fr)] md:divide-x md:divide-white/10"
      >
        <div className="min-w-0 md:pr-3">
          <div className="flex min-w-0 items-start gap-3">
            <TournamentInfoIcon
              src="/icons/sun-safe-light.svg"
              className="size-8 text-[#D4A017]"
            />
            <div className="min-w-0">
              <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
                Safe Light
              </h3>
              <p className="mt-0.5 text-2xl font-black text-white">
                {safeLight.time}
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-neutral-500">
                Approximately · Fort Worth sunrise {safeLight.officialSunrise}
              </p>
            </div>
          </div>

          {safeLight.publicOverrideReason && (
            <p className="mt-2 border-l-2 border-[#D4A017] pl-2 text-xs text-neutral-300">
              {safeLight.publicOverrideReason}
            </p>
          )}
          <p className="mt-2 text-[10px] leading-4 text-neutral-500">
            Be prepared to launch before Safe Light. Tournament Officials
            determine final launch timing.
          </p>
        </div>

        <div className="min-w-0 md:pl-3">
          <h3 className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-500">
            Next 5 Days
          </h3>

          {forecast ? (
            <>
              <div className="mt-2 max-w-full overflow-x-auto overscroll-x-contain pb-1">
                <ol className="grid min-w-[410px] grid-cols-5 gap-1.5 md:min-w-0">
                  {forecast.days.map((day) => (
                    <li
                      key={day.date}
                      aria-label={weatherDayLabel(day)}
                      title={day.conditionText}
                      className="min-w-0 border border-white/10 bg-black/30 px-1 py-2 text-center"
                    >
                      <time
                        dateTime={day.date}
                        className="block text-[10px] font-black uppercase tracking-[0.1em] text-[#D4A017]"
                      >
                        {formatForecastWeekday(day.date)}
                      </time>
                      <span
                        aria-hidden="true"
                        className="mt-1 block text-lg leading-none text-neutral-300"
                      >
                        {weatherIndicator(day)}
                      </span>
                      {(day.highF !== null || day.lowF !== null) && (
                        <p className="mt-1 whitespace-nowrap text-xs font-black text-white">
                          {day.highF === null
                            ? "—"
                            : `${Math.round(day.highF)}°`}
                          <span className="px-0.5 text-neutral-600">/</span>
                          <span className="text-neutral-400">
                            {day.lowF === null
                              ? "—"
                              : `${Math.round(day.lowF)}°`}
                          </span>
                        </p>
                      )}
                      {day.precipitationProbability !== null && (
                        <p className="mt-0.5 text-[9px] text-neutral-500">
                          Rain {Math.round(day.precipitationProbability)}%
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[9px] text-neutral-500">
                <time dateTime={forecast.fetchedAt}>
                  Updated {formatTournamentTimestamp(forecast.fetchedAt)}
                </time>
                <a
                  href="https://open-meteo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Weather data by Open-Meteo (opens in a new tab)"
                  className="font-semibold text-neutral-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
                >
                  Weather data by Open-Meteo
                </a>
              </div>
            </>
          ) : (
            <p className="mt-2 text-xs text-neutral-300">
              {weather.status === "unavailable" &&
              weather.reason === "location-not-configured"
                ? "Forecast unavailable: tournament weather location is not configured."
                : "Forecast temporarily unavailable."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
