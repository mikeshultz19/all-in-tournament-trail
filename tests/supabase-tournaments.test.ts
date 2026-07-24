import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Supabase tournaments migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607230001_create_tournaments.sql",
    "utf8",
  );
  const seed = readFileSync("supabase/seed.sql", "utf8");

  it("creates the constrained tournaments table and timestamps", () => {
    expect(migration).toContain("create table if not exists public.tournaments");
    expect(migration).toContain("tournaments_status_check");
    expect(migration).toContain("tournaments_set_updated_at");
    expect(migration).toContain("tournaments_registration_window_check");
  });

  it("enforces one featured tournament inside the database transaction", () => {
    expect(migration).toContain("tournaments_one_featured_idx");
    expect(migration).toContain("ensure_single_featured_tournament");
    expect(migration).toContain("before insert or update of is_featured");
  });

  it("labels the unauthenticated update policy as temporary", () => {
    expect(migration).toContain("TEMPORARY DEVELOPMENT POLICY");
    expect(migration).toContain("Temporary admin tournament updates");
    expect(migration).not.toContain("service_role");
  });

  it("seeds Lake Fork idempotently", () => {
    expect(seed).toContain("'lake-fork-open-2026'");
    expect(seed).toContain("on conflict (slug) do update");
    expect(seed).toContain("'Registration Open'");
  });
});
