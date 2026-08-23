import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const desktopFeaturedTournament = readFileSync(
  "components/FeaturedTournament.tsx",
  "utf8",
);
const mobileFeaturedTournament = readFileSync(
  "components/MobileFeaturedTournament.tsx",
  "utf8",
);

describe("homepage registration launch mode", () => {
  it.each([
    ["desktop", desktopFeaturedTournament],
    ["mobile", mobileFeaturedTournament],
  ])("uses persisted tournament availability on %s", (_variant, source) => {
    expect(source).toContain("const registrationOpen = operations?.registrationCanSubmit ?? false");
    expect(source).toContain(
      'href={`/register?tournament=${tournament.slug}`}',
    );
    expect(source).toContain("Register");
    expect(source).not.toContain("Register Now");
  });
});
