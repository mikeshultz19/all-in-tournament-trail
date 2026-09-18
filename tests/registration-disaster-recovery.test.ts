import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/202609180001_add_registration_disaster_recovery_outbox.sql", "utf8");
const versionedRebuildMigration = readFileSync("supabase/migrations/202609180002_add_versioned_disaster_recovery_rebuild.sql", "utf8");

describe("registration disaster recovery safety", () => {
  it("uses a private idempotent outbox and never performs external work in SQL", () => {
    expect(migration).toContain("registration_disaster_recovery_events");
    expect(migration).toContain("unique (registration_id, event_version)");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.registration_disaster_recovery_events from public, anon, authenticated");
    expect(migration).toContain("for update skip locked");
    expect(migration).not.toMatch(/https?:\/\//);
  });

  it("queues only after durable registration/review rows and excludes read-only actions", () => {
    expect(migration).toContain("after insert or update of registration_status");
    expect(migration).toContain("after insert or update of review_status");
    expect(migration).not.toContain("page_load");
    expect(migration).not.toContain("export");
  });

  it("defines an explicit validated and idempotent rebuild version without rewriting events", () => {
    expect(versionedRebuildMigration).toContain("admin_enqueue_tournament_disaster_recovery_rebuild_versioned");
    expect(versionedRebuildMigration).toContain("on conflict (idempotency_key) do nothing");
    expect(versionedRebuildMigration).toContain("length(v_version) > 64");
    expect(versionedRebuildMigration).toContain("revoke all on function");
    expect(versionedRebuildMigration).not.toMatch(/delete\s+from/i);
    expect(versionedRebuildMigration).not.toMatch(/update\s+public\.registration_disaster_recovery_events/i);
  });
});
