import { afterEach, describe, expect, it, vi } from "vitest";

const supabaseState = vi.hoisted(() => ({
  seasonError: null as { code: string; message: string } | null,
  rpcError: null as { code: string; message: string } | null,
  rows: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: supabaseState.seasonError ? null : { id: "season-1" },
            error: supabaseState.seasonError,
          }),
        }),
      }),
    }),
    rpc: async () => ({
      data: supabaseState.rpcError ? null : supabaseState.rows,
      error: supabaseState.rpcError,
    }),
  }),
}));

import { getHomepageAoyStandings } from "@/lib/aoy-standings";

afterEach(() => {
  supabaseState.seasonError = null;
  supabaseState.rpcError = null;
  supabaseState.rows = [];
  vi.restoreAllMocks();
});

describe("public AOY data access", () => {
  it("returns a typed unavailable state for Postgres 42501", async () => {
    supabaseState.rpcError = {
      code: "42501",
      message: "permission denied for view current_aoy_standings",
    };
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(getHomepageAoyStandings()).resolves.toEqual({
      status: "unavailable",
      standings: [],
    });
    expect(errorLog).toHaveBeenCalledWith(
      "Homepage AOY standings are unavailable due to a data-access error.",
    );
    expect(errorLog.mock.calls.flat().join(" ")).not.toContain(
      "current_aoy_standings",
    );
  });

  it("maps only approved public fields when data is available", async () => {
    supabaseState.rows = [
      {
        rank: 1,
        display_name: "Public Angler",
        official_participation_count: 3,
        total_counted_points: 580,
        email: "must-not-leak@example.com",
        canonical_members: ["private-id"],
      },
    ];

    await expect(getHomepageAoyStandings()).resolves.toEqual({
      status: "available",
      standings: [
        {
          place: 1,
          angler: "Public Angler",
          events: 3,
          points: 580,
        },
      ],
    });
  });
});
