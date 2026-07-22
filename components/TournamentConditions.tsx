import type { Tournament } from "@/data/tournaments";
import { TOURNAMENT_STATUS_LABELS } from "@/lib/tournament-operations";
import { formatTournamentTimestamp } from "@/lib/tournament-time";
import type { SafeLightViewModel } from "@/lib/tournament-view-model";
import type { TournamentWeatherResult } from "@/lib/tournament-weather";
import TournamentInfoIcon from "@/components/TournamentInfoIcon";

const STATUS_INDICATOR_STYLES = {
  scheduled: "bg-emerald-400",
  weather_watch: "bg-amber-400",
  delayed: "bg-orange-400",
  postponed: "bg-orange-400",
  cancelled: "bg-red-500",
  rescheduled: "bg-sky-400",
} as const;

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
    <section aria-labelledby="tournament-conditions-heading" className="border border-[#4A3A12] bg-[#111111] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="tournament-conditions-heading" className="text-sm font-black uppercase tracking-[0.14em] text-[#D4A017]">
            Tournament Conditions
          </h2>
          <p className="inline-flex items-center gap-2 border border-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white">
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_INDICATOR_STYLES[tournament.tournamentStatus]}`} />
            {TOURNAMENT_STATUS_LABELS[tournament.tournamentStatus]}
          </p>
        </div>
        {safeLight.isOverridden && (
          <span className="border border-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            Adjusted by Tournament Officials
          </span>
        )}
      </div>

      <div className="grid gap-4 py-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:divide-x sm:divide-white/10">
        <div className="flex min-w-0 items-start gap-3">
          <TournamentInfoIcon src="/icons/sun-safe-light.svg" className="size-8 text-[#D4A017] sm:size-9" />
          <div className="min-w-0">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Safe Light</h3>
            <p className="mt-1 text-2xl font-black text-white">{safeLight.time}</p>
            <p className="mt-1 text-xs text-neutral-500">Approximately · Fort Worth sunrise {safeLight.officialSunrise}</p>
          </div>
        </div>

        <div className="sm:pl-4">
          <h3 className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Tournament Forecast</h3>
          {forecast ? (
            <div className="mt-1">
              <p className="font-bold text-white">
                {forecast.temperatureF === null ? null : `${Math.round(forecast.temperatureF)}°F · `}
                {forecast.conditionText}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-300">
                {forecast.windSpeedMph !== null && (
                  <span>Wind {forecast.windDirection ? `${forecast.windDirection} ` : ""}{Math.round(forecast.windSpeedMph)} mph</span>
                )}
                {forecast.windGustMph !== null && <span>Gusts {Math.round(forecast.windGustMph)} mph</span>}
                {forecast.precipitationProbability !== null && <span>Rain {Math.round(forecast.precipitationProbability)}%</span>}
              </div>
              {forecast.highF !== null && forecast.lowF !== null && (
                <p className="mt-1 text-xs text-neutral-500">High {Math.round(forecast.highF)}°F · Low {Math.round(forecast.lowF)}°F</p>
              )}
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-300">
              {weather.status === "pending"
                ? "Tournament forecast will be available closer to the event."
                : "Forecast temporarily unavailable."}
            </p>
          )}
        </div>
      </div>

      {safeLight.publicOverrideReason && (
        <p className="mb-3 border-l-2 border-[#D4A017] pl-3 text-sm text-neutral-300">{safeLight.publicOverrideReason}</p>
      )}
      <p className="text-xs leading-5 text-neutral-400">Be on the water and prepared to launch before Safe Light. Final launch timing is determined by Tournament Officials.</p>

      {forecast && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[11px] text-neutral-500">
          <time dateTime={forecast.fetchedAt}>Updated {formatTournamentTimestamp(forecast.fetchedAt)}</time>
          <a href="https://www.accuweather.com" target="_blank" rel="noreferrer" aria-label="Weather data by AccuWeather (opens in a new tab)" className="flex items-center gap-2 font-semibold text-neutral-300 hover:text-white">
            Weather data by AccuWeather
          </a>
        </div>
      )}
    </section>
  );
}
