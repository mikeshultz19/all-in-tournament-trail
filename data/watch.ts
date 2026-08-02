import { getFeaturedTournament, getEffectiveTournamentDate } from "@/data/tournaments";
import { SOCIAL_LINKS } from "@/config/social-links";
import { getTournamentDisplay } from "@/lib/tournament-display";

const featuredTournament = getFeaturedTournament();
const featuredDisplay = featuredTournament
  ? getTournamentDisplay(featuredTournament)
  : null;

export const watchPageData = {
  tournament: featuredTournament
    ? {
        label: "Current Tournament",
        lake: `${featuredTournament.lake} Lake`,
        date: featuredDisplay?.date ?? featuredTournament.date,
        venue: featuredTournament.venue ?? "To Be Announced",
        location: featuredTournament.city
          ? `${featuredTournament.city}, ${
              featuredTournament.state === "Texas"
                ? "TX"
                : featuredTournament.state
            }`
          : "To Be Announced",
        dateTime: getEffectiveTournamentDate(featuredTournament),
      }
    : null,
  socialLinks: [
    SOCIAL_LINKS.facebook,
    SOCIAL_LINKS.instagram,
  ],
} as const;
