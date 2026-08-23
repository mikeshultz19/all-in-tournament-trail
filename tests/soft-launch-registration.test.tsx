import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FeaturedTournament from "@/components/FeaturedTournament";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

describe("manual registration availability", () => {
  it("keeps registration open after the former cutoff", () => {
    const open = { ...tournaments[0], registrationStatus: "open" as const };
    const operations = getTournamentOperationsViewModel(open, new Date("2030-01-01T12:00:00Z"));
    const markup = renderToStaticMarkup(<FeaturedTournament tournament={open} operations={operations} />);
    expect(markup).toContain("Register");
    expect(markup).not.toContain("Registration Closed");
  });

  it("shows the manual suspension message and disables payment review", () => {
    const closed = { ...tournaments[0], registrationStatus: "closed" as const };
    const operationsBySlug = { [closed.slug]: getTournamentOperationsViewModel(closed) };
    const markup = renderToStaticMarkup(<RegistrationForm tournaments={[closed]} operationsBySlug={operationsBySlug} policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }} />);
    expect(markup).toContain("Registration is temporarily unavailable.");
    expect(markup).toContain('disabled=""');
  });
});
