import { beforeEach, describe, expect, it, vi } from "vitest";

const { createSupabaseServerClient, getTournamentInsurancePotResult, publishOfficialResults, publishTournamentInsurancePotResult, revalidatePath, redirect, requireAdminUser, select, eq, maybeSingle, from, validateInsurancePotResult, syncTournamentPublishReadiness } = vi.hoisted(() => {
  const maybeSingle = vi.fn();
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    createSupabaseServerClient: vi.fn(() => ({ from })),
    getTournamentInsurancePotResult: vi.fn(),
    publishOfficialResults: vi.fn(),
    publishTournamentInsurancePotResult: vi.fn(),
    revalidatePath: vi.fn(),
    redirect: vi.fn(),
    requireAdminUser: vi.fn(),
    select,
    eq,
    maybeSingle,
    from,
    validateInsurancePotResult: vi.fn(),
    syncTournamentPublishReadiness: vi.fn(),
  };
});

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/admin-auth", () => ({
  requireAdminUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

vi.mock("@/lib/official-results", () => ({
  publishOfficialResults,
  OfficialResultsError: class OfficialResultsError extends Error {},
}));

vi.mock("@/lib/insurance-pot", () => ({
  validateInsurancePotResult,
}));

vi.mock("@/lib/insurance-pot-results", () => ({
  getTournamentInsurancePotResult,
  publishTournamentInsurancePotResult,
}));

vi.mock("@/lib/tournament-publish-readiness", () => ({
  syncTournamentPublishReadiness,
}));

describe("publish results verification gate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAdminUser.mockResolvedValue({ id: "admin-1" });
    getTournamentInsurancePotResult.mockResolvedValue(null);
    publishOfficialResults.mockResolvedValue(undefined);
    publishTournamentInsurancePotResult.mockResolvedValue(undefined);
    validateInsurancePotResult.mockReturnValue([]);
  });

  it("blocks publishing when the import was not verified, even if a transient confirmation is supplied", async () => {
    syncTournamentPublishReadiness.mockResolvedValue({
      autoResolvedCount: 0,
      manualReviewRows: [],
      promoted: false,
      tournament: {
        id: "tour-1",
        weighfish_imported_at: null,
        results_verified_at: null,
        results_verified_by: null,
        result_status: "imported",
      },
    });

    const { publishTournamentAction } = await import(
      "@/app/admin/tournament-manager/publish/actions"
    );

    const formData = new FormData();
    formData.set("tournamentId", "tour-1");
    formData.set("identifier", "eagle-mountain");
    formData.set("confirmed", "on");

    const result = await publishTournamentAction(
      { status: "idle", message: "" },
      formData,
    );

    expect(result).toEqual({
      status: "error",
      message: "The imported results must be verified before publishing.",
    });
    expect(publishOfficialResults).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("allows publishing once the persisted import verification exists, without any second checkbox", async () => {
    syncTournamentPublishReadiness.mockResolvedValue({
      autoResolvedCount: 0,
      manualReviewRows: [],
      promoted: true,
      tournament: {
        id: "tour-1",
        weighfish_imported_at: "2026-08-24T18:00:00Z",
        results_verified_at: "2026-08-24T18:01:00Z",
        results_verified_by: "admin-1",
        result_status: "ready_to_publish",
      },
    });

    const { publishTournamentAction } = await import(
      "@/app/admin/tournament-manager/publish/actions"
    );

    const formData = new FormData();
    formData.set("tournamentId", "tour-1");
    formData.set("identifier", "eagle-mountain");

    await publishTournamentAction(
      { status: "idle", message: "" },
      formData,
    );

    expect(publishOfficialResults).toHaveBeenCalledWith("tour-1", "admin-1");
    expect(redirect).toHaveBeenCalledWith(
      "/admin/tournament-manager?tournament=eagle-mountain&step=5",
    );
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/results");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/tournament-manager/publish");
  });
});
