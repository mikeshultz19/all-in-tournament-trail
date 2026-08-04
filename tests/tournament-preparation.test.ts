import { describe, expect, it } from "vitest";

import { getTournamentPreparationStatus } from "@/lib/tournament-preparation";

describe("tournament preparation status", () => {
  const tournament = {
    prepare_registration_review_complete: false,
    paper_membership_reminder_checked: false,
  };

  it("stays Not Started before either confirmation is checked", () => {
    expect(getTournamentPreparationStatus(tournament, { needReview: 0 })).toBe(
      "Not Started",
    );
  });

  it("moves to In Progress when one confirmation is complete", () => {
    expect(
      getTournamentPreparationStatus(
        {
          ...tournament,
          prepare_registration_review_complete: true,
        },
        { needReview: 0 },
      ),
    ).toBe("In Progress");
  });

  it("moves to Needs Attention when unresolved reviews remain", () => {
    expect(
      getTournamentPreparationStatus(
        {
          ...tournament,
          prepare_registration_review_complete: true,
          paper_membership_reminder_checked: true,
        },
        { needReview: 2 },
      ),
    ).toBe("Needs Attention");
  });

  it("becomes Complete when both confirmations are saved and reviews are resolved", () => {
    expect(
      getTournamentPreparationStatus(
        {
          ...tournament,
          prepare_registration_review_complete: true,
          paper_membership_reminder_checked: true,
        },
        { needReview: 0 },
      ),
    ).toBe("Complete");
  });
});
