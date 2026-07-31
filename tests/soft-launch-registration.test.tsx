import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/registrations/quote/route";
import Header from "@/components/Header";
import FeaturedTournament from "@/components/FeaturedTournament";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments } from "@/data/tournaments";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

describe("Soft Launch registration", () => {
  it("keeps the public Register navigation active", () => {
    const markup = renderToStaticMarkup(<Header />);

    expect(markup).toContain('href="/register"');
    expect(markup).toContain(">Register</");
  });

  it("keeps the Featured Tournament action linked to Registration", () => {
    const markup = renderToStaticMarkup(
      <FeaturedTournament tournament={tournaments[0]} />,
    );

    expect(markup).toContain(
      'href="/register?tournament=eagle-mountain-2026"',
    );
    expect(markup).toContain("Registration Closed");
    expect(markup).toContain("bg-red-700");
    expect(markup).not.toContain("Register Now");
  });

  it("keeps the complete form visible with a disabled closed action", () => {
    const operationsBySlug = Object.fromEntries(
      tournaments.map((tournament) => [
        tournament.slug,
        getTournamentOperationsViewModel(
          tournament,
          new Date("2026-07-30T12:00:00Z"),
        ),
      ]),
    );
    const markup = renderToStaticMarkup(
      <RegistrationForm
        tournaments={tournaments}
        operationsBySlug={operationsBySlug}
        policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }}
      />,
    );

    expect(markup).toContain("Angler Information");
    expect(markup).toContain("Tournament Entry");
    expect(markup).toContain("Optional Side Pots");
    expect(markup).toContain("Member Bonus Pots");
    expect(markup).toContain("Registration Closed");
    expect(markup).toContain('disabled=""');
  });

  it("renders the required Registration page banner copy", () => {
    const source = readFileSync("app/register/page.tsx", "utf8");
    const normalizedSource = source.replace(/\s+/g, " ");

    expect(normalizedSource).toContain("Registration is Currently Closed");
    expect(normalizedSource).toContain(
      "Official registration dates for our inaugural season will be announced soon.",
    );
  });

  it("rejects direct quote requests before processing input", async () => {
    const response = await POST(
      new Request("http://localhost/api/registrations/quote", {
        method: "POST",
        body: "{}",
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Registration is currently closed.",
    });
  });

  it("guards the durable persistence boundary", () => {
    const source = readFileSync("lib/durable-registration.ts", "utf8");

    expect(source).toContain("SOFT_LAUNCH_REGISTRATION_CLOSED");
    expect(source).toContain("Registration is currently closed.");
  });
});
