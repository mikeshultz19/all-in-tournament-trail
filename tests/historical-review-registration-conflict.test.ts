import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminUser, reviewWorkingResultHistory, getWorkingResultRegistrationConflict } = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
  reviewWorkingResultHistory: vi.fn(),
  getWorkingResultRegistrationConflict: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/admin-auth", () => ({ requireAdminUser }));
vi.mock("@/lib/official-results", () => ({ reviewWorkingResultHistory }));
vi.mock("@/lib/working-result-registration-conflict", () => ({ getWorkingResultRegistrationConflict }));
vi.mock("@/lib/championship-qualification", () => ({ rebuildChampionshipQualificationForOfficialResult: vi.fn() }));

import { reviewWorkingResultHistoryAction } from "@/app/admin/results/correction-actions";

const input = {
  resultEntryId: "result-4",
  registrationId: "reg-4",
  participationStatus: "participated" as const,
  aoyEligible: true,
  eligibilityReason: "Historical review",
};

describe("historical review registration ownership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({ id: "admin-1" });
  });

  it("blocks a registration already owned by another result and identifies both rows", async () => {
    getWorkingResultRegistrationConflict.mockResolvedValue(
      "Registration reg-4 (Boat #4) is already assigned to Place 21 — Stress Unverified and cannot also be assigned to Place 4 — Joe Johnson.",
    );

    const result = await reviewWorkingResultHistoryAction(input);

    expect(result.status).toBe("error");
    expect(result.message).toContain("Boat #4");
    expect(result.message).toContain("Place 21 — Stress Unverified");
    expect(result.message).toContain("Place 4 — Joe Johnson");
    expect(reviewWorkingResultHistory).not.toHaveBeenCalled();
  });

  it("saves a legitimate unique registration mapping", async () => {
    getWorkingResultRegistrationConflict.mockResolvedValue(null);
    reviewWorkingResultHistory.mockResolvedValue(undefined);

    const result = await reviewWorkingResultHistoryAction(input);

    expect(result.status).toBe("success");
    expect(reviewWorkingResultHistory).toHaveBeenCalledWith({ ...input, adminUserId: "admin-1" });
  });
});
