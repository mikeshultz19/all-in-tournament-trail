import { beforeEach, describe, expect, it, vi } from "vitest";

const { getOnSiteCloseout, createSupabaseServerClient } = vi.hoisted(() => ({
  getOnSiteCloseout: vi.fn(),
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/on-site-closeout", () => ({
  getOnSiteCloseout,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient,
}));

import {
  buildTournamentPublishReadinessPlan,
  syncTournamentPublishReadiness,
  type RegistrationRow,
  type WorkingResultRow,
} from "@/lib/tournament-publish-readiness";

function makeResultRow(overrides: Partial<WorkingResultRow>): WorkingResultRow {
  return {
    id: "result-1",
    place: 1,
    team_name: "Fresh SoloGold",
    registration_id: null,
    competitive_record_id: null,
    record_type: null,
    participation_status: "participated",
    aoy_eligible: null,
    aoy_eligibility_snapshot: null,
    eligibility_reviewed_at: null,
    eligibility_reviewed_by_admin_id: null,
    ...overrides,
  };
}

function makeRegistration(overrides: Partial<RegistrationRow>): RegistrationRow {
  return {
    id: "reg-1",
    registration_type: "solo",
    angler1_name: "Fresh SoloGold",
    angler2_name: null,
    competitive_record_id: "record-1",
    identity_review_status: "verified",
    membership_snapshot: [{ eligibleForTournament: true }],
    ...overrides,
  };
}

function mockSupabase(input: {
  tournament: Record<string, unknown>;
  updatedTournament?: Record<string, unknown>;
  resultRows: Record<string, unknown>[];
  registrations: Record<string, unknown>[];
}) {
  const tournamentMaybeSingle = vi.fn().mockResolvedValue({
    data: input.tournament,
    error: null,
  });
  const tournamentUpdateSingle = vi.fn().mockResolvedValue({
    data: input.updatedTournament ?? input.tournament,
    error: null,
  });
  const tournamentUpdate = vi.fn(() => ({
    eq: vi.fn(() => ({
      select: vi.fn(() => ({
        single: tournamentUpdateSingle,
      })),
    })),
  }));

  const from = vi.fn((table: string) => {
    if (table === "tournaments") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: tournamentMaybeSingle,
          })),
        })),
        update: tournamentUpdate,
      };
    }
    if (table === "tournament_result_entries") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: input.resultRows,
              error: null,
            }),
          })),
        })),
      };
    }
    if (table === "tournament_registrations") {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: input.registrations,
              error: null,
            }),
          })),
        })),
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  });

  createSupabaseServerClient.mockReturnValue({ from });

  return { tournamentUpdate, tournamentUpdateSingle };
}

describe("tournament publish readiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns every pre-existing duplicate registration owner to manual review", () => {
    const registration = makeRegistration({ id: "reg-duplicate", boat_number: 4 });
    const complete = {
      registration_id: registration.id,
      competitive_record_id: registration.competitive_record_id,
      record_type: "solo",
      aoy_eligible: true,
      aoy_eligibility_snapshot: { eligible: true },
      eligibility_reviewed_at: "2026-08-24T12:00:00Z",
      eligibility_reviewed_by_admin_id: "admin-1",
    };
    const plan = buildTournamentPublishReadinessPlan({
      reviewerAdminId: "admin-1",
      registrations: [registration],
      resultRows: [
        makeResultRow({ ...complete, id: "result-4", place: 4, team_name: "Joe Johnson / Solo PhoneMatch" }),
        makeResultRow({ ...complete, id: "result-21", place: 21, team_name: "Stress Unverified41873390" }),
      ],
    });

    expect(plan.autoResolvedRows).toHaveLength(0);
    expect(plan.manualReviewRows.map((row) => row.resultId)).toEqual(["result-4", "result-21"]);
    for (const row of plan.manualReviewRows) {
      expect(row.reason).toContain("Registration reg-duplicate (Boat #4)");
      expect(row.reason).toContain("Place 4 — Joe Johnson / Solo PhoneMatch");
      expect(row.reason).toContain("Place 21 — Stress Unverified41873390");
    }
  });

  it("keeps distinct complete registration mappings ready", () => {
    const plan = buildTournamentPublishReadinessPlan({
      reviewerAdminId: "admin-1",
      registrations: [],
      resultRows: [
        makeResultRow({ id: "result-1", registration_id: "reg-1", competitive_record_id: "record-1", record_type: "solo", aoy_eligible: true, aoy_eligibility_snapshot: {}, eligibility_reviewed_at: "now", eligibility_reviewed_by_admin_id: "admin-1" }),
        makeResultRow({ id: "result-2", registration_id: "reg-2", competitive_record_id: "record-2", record_type: "solo", aoy_eligible: true, aoy_eligibility_snapshot: {}, eligibility_reviewed_at: "now", eligibility_reviewed_by_admin_id: "admin-1" }),
      ],
    });

    expect(plan.manualReviewRows).toEqual([]);
  });

  it("auto-resolves exact registration matches and leaves ambiguous rows for manual review", () => {
    const plan = buildTournamentPublishReadinessPlan({
      reviewerAdminId: "admin-1",
      resultRows: [
        makeResultRow({ id: "r1", team_name: "Fresh SoloGold" }),
        makeResultRow({
          id: "r2",
          place: 13,
          team_name: "Fresh MemberOne / Fresh NonMemberTwo",
        }),
        makeResultRow({
          id: "r3",
          place: 4,
          team_name: "Joe Johnson / Solo PhoneMatch",
        }),
      ],
      registrations: [
        makeRegistration({
          id: "reg-1",
          registration_type: "solo",
          angler1_name: "Fresh SoloGold",
          competitive_record_id: "record-1",
          membership_snapshot: [{ eligibleForTournament: true }],
        }),
        makeRegistration({
          id: "reg-2",
          registration_type: "team",
          angler1_name: "Fresh MemberOne",
          angler2_name: "Fresh NonMemberTwo",
          competitive_record_id: "record-2",
          membership_snapshot: [
            { eligibleForTournament: true },
            { eligibleForTournament: false },
          ],
        }),
      ],
    });

    expect(plan.autoResolvedRows).toHaveLength(2);
    expect(plan.autoResolvedRows.map((entry) => entry.row.id)).toEqual(["r1", "r2"]);
    expect(plan.autoResolvedRows[0].aoyEligible).toBe(true);
    expect(plan.autoResolvedRows[1].aoyEligible).toBe(false);
    expect(plan.manualReviewRows).toHaveLength(1);
    expect(plan.manualReviewRows[0].teamName).toBe("Joe Johnson / Solo PhoneMatch");
  });

  it("does not auto-resolve or promote before import verification exists", async () => {
    mockSupabase({
      tournament: {
        id: "tour-1",
        weighfish_imported_at: null,
        results_verified_at: null,
        results_verified_by: null,
        result_status: "imported",
        photos_reviewed: true,
        champion_photo_url: "https://example.com/champ.jpg",
        big_bass_photo_url: "https://example.com/bass.jpg",
        updated_by: "admin-1",
      },
      resultRows: [makeResultRow({ id: "r1", team_name: "Fresh SoloGold" })],
      registrations: [makeRegistration({})],
    });
    getOnSiteCloseout.mockResolvedValue({
      status: "complete",
      difference_cents: 0,
    });

    const result = await syncTournamentPublishReadiness("tour-1");

    expect(result.autoResolvedCount).toBe(0);
    expect(result.promoted).toBe(false);
    expect(result.manualReviewRows).toHaveLength(0);
  });

  it("promotes result_status to ready_to_publish once all prerequisites and snapshots are complete", async () => {
    const { tournamentUpdate } = mockSupabase({
      tournament: {
        id: "tour-1",
        weighfish_imported: true,
        weighfish_imported_at: "2026-08-24T02:07:24.28091+00:00",
        results_verified_at: "2026-08-24T02:21:14.98896+00:00",
        results_verified_by: "admin-1",
        result_status: "imported",
        photos_reviewed: true,
        champion_photo_url: "https://example.com/champ.jpg",
        big_bass_photo_url: "https://example.com/bass.jpg",
        updated_by: "admin-1",
      },
      updatedTournament: {
        id: "tour-1",
        weighfish_imported: true,
        weighfish_imported_at: "2026-08-24T02:07:24.28091+00:00",
        results_verified_at: "2026-08-24T02:21:14.98896+00:00",
        results_verified_by: "admin-1",
        result_status: "ready_to_publish",
        photos_reviewed: true,
        champion_photo_url: "https://example.com/champ.jpg",
        big_bass_photo_url: "https://example.com/bass.jpg",
        updated_by: "admin-1",
      },
      resultRows: [
        {
          ...makeResultRow({ id: "r1", team_name: "Fresh SoloGold" }),
          registration_id: "reg-1",
          competitive_record_id: "record-1",
          record_type: "solo",
          aoy_eligible: true,
          aoy_eligibility_snapshot: { eligible: true },
          eligibility_reviewed_at: "2026-08-24T02:30:00Z",
          eligibility_reviewed_by_admin_id: "admin-1",
        },
      ],
      registrations: [makeRegistration({})],
    });
    getOnSiteCloseout.mockResolvedValue({
      status: "complete",
      difference_cents: 0,
    });

    const result = await syncTournamentPublishReadiness("tour-1");

    expect(tournamentUpdate).toHaveBeenCalledWith({
      result_status: "ready_to_publish",
    });
    expect(result.autoResolvedCount).toBe(0);
    expect(result.manualReviewRows).toHaveLength(0);
    expect(result.promoted).toBe(true);
    expect(result.tournament?.result_status).toBe("ready_to_publish");
  });
});
