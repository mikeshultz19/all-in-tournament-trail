import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FeaturedTournament from "@/components/FeaturedTournament";
import { getTournamentOperationSteps } from "@/lib/admin-tournament-operations";
import { toPublicTournament } from "@/lib/tournament-record-adapter";
import { databaseTournament } from "@/tests/tournament-db-fixture";

describe("Tournament practice information", () => {
  it("displays saved free-form text in the requested homepage position", () => {
    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={toPublicTournament(databaseTournament)} />,
    );

    const tournamentInformation = html.indexOf("Tournament Information");
    const practiceInformation = html.indexOf("Practice Information");
    const viewEntries = html.indexOf("View Tournament Entries");

    expect(practiceInformation).toBeGreaterThan(tournamentInformation);
    expect(viewEntries).toBeGreaterThan(practiceInformation);
    expect(html).toContain(
      "Non-members are off-limits beginning Sunday prior to the tournament.",
    );
    expect(html).toContain(
      "Members may practice beginning Friday before the tournament.",
    );
    expect(html).toContain("whitespace-pre-line");
    expect(html).not.toContain(">Non-Members<");
    expect(html).not.toContain(">Members<");
  });

  it("hides the public panel when practice information is empty", () => {
    const tournament = toPublicTournament({
      ...databaseTournament,
      practice_information: " ",
    });

    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={tournament} />,
    );

    expect(html).not.toContain("Practice Information");
    expect(html).not.toContain(">Non-Members<");
  });

  it("requires meaningful free-form text for Step 1 completion", () => {
    const completePracticeItem = getTournamentOperationSteps(
      databaseTournament,
      new Date("2026-07-28T12:00:00-05:00"),
    )[0].items.find(
      (item) => item.label === "Practice Information Complete",
    );
    const incompletePracticeItem = getTournamentOperationSteps(
      {
        ...databaseTournament,
        practice_information: " ",
      },
      new Date("2026-07-28T12:00:00-05:00"),
    )[0].items.find(
      (item) => item.label === "Practice Information Complete",
    );

    expect(completePracticeItem?.status).toBe("complete");
    expect(incompletePracticeItem?.status).toBe("incomplete");
  });
});

describe("Featured Tournament registration information", () => {
  it("renders saved text between tournament and practice information", () => {
    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={toPublicTournament(databaseTournament)} />,
    );

    const tournamentInformation = html.indexOf("Tournament Information");
    const registrationInformation = html.indexOf("Registration Information");
    const practiceInformation = html.indexOf("Practice Information");

    expect(registrationInformation).toBeGreaterThan(tournamentInformation);
    expect(practiceInformation).toBeGreaterThan(registrationInformation);
    expect(html).toContain(
      "Online registration closes Friday, October 30 at 6:00 PM.",
    );
  });

  it("hides empty registration information", () => {
    const tournament = toPublicTournament({
      ...databaseTournament,
      registration_information: " ",
    });
    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={tournament} />,
    );

    expect(html).not.toContain("Registration Information");
  });

  it("always links Register Now and omits homepage status messaging", () => {
    const tournament = {
      ...toPublicTournament(databaseTournament),
      registrationStatus: "closed" as const,
    };
    const html = renderToStaticMarkup(
      <FeaturedTournament tournament={tournament} />,
    );

    expect(html).toContain(
      'href="/register?tournament=eagle-mountain-2026"',
    );
    expect(html).toContain("Register Now");
    expect(html).not.toContain("Registration Closed");
    expect(html).not.toContain("Tournament Status:");
    expect(html).not.toContain(
      "Registration is closed for this tournament.",
    );
  });
});
