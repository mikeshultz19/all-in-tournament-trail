import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Supabase tournament results migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607240003_create_tournament_results.sql",
    "utf8",
  );

  it("stores ordered entries against the authoritative tournament", () => {
    expect(migration).toContain("create table if not exists public.tournament_results");
    expect(migration).toContain("references public.tournaments(id)");
    expect(migration).toContain("entries jsonb not null");
    expect(migration).toContain("published_at timestamptz not null");
  });

  it("enables RLS and marks anonymous writes temporary", () => {
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("Published tournament results are publicly readable");
    expect(migration).toContain("TEMPORARY DEVELOPMENT POLICIES");
  });
});

describe("Supabase tournament payout migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607240004_add_total_payout_to_tournament_results.sql",
    "utf8",
  );

  it("adds a dedicated non-negative numeric payout while preserving records", () => {
    expect(migration).toContain("total_payout numeric(12, 2) not null default 0");
    expect(migration).toContain("check (total_payout >= 0)");
  });
});

describe("Supabase Insurance Pot payout migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607240005_add_insurance_pot_payout.sql",
    "utf8",
  );

  it("adds a dedicated manual Insurance Pot payout while preserving records", () => {
    expect(migration).toContain(
      "insurance_pot_payout numeric(12, 2) not null default 0",
    );
    expect(migration).toContain("check (insurance_pot_payout >= 0)");
  });
});

describe("Supabase Weighfish side-pot payout migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607240006_add_weighfish_side_pot_payouts.sql",
    "utf8",
  );

  it("adds separate non-negative Bronze, Silver, and Gold payouts", () => {
    expect(migration).toContain(
      "bronze_payout numeric(12, 2) not null default 0",
    );
    expect(migration).toContain(
      "silver_payout numeric(12, 2) not null default 0",
    );
    expect(migration).toContain(
      "gold_payout numeric(12, 2) not null default 0",
    );
    expect(migration).toContain("check (bronze_payout >= 0)");
    expect(migration).toContain("check (silver_payout >= 0)");
    expect(migration).toContain("check (gold_payout >= 0)");
  });
});

describe("demo seed source", () => {
  const seed = readFileSync("lib/demo-seed.ts", "utf8");

  it("provides idempotent realistic published demo results", () => {
    expect(seed).toContain("Eagle Mountain");
    expect(seed).toContain("eagle-mountain-2026");
    expect(seed).toContain("Carter / Reynolds");
    expect(seed).toContain("24.87");
    expect(seed).toContain("16500");
    expect(seed).toContain("1350");
    expect(seed).toContain("2250");
    expect(seed).toContain("3000");
    expect(seed).toContain("1250");
    expect(seed).toContain("650");
    expect(seed).toContain('morning_registration: "05:00"');
  });
});
