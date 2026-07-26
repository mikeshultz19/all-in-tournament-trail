import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Supabase news migration", () => {
  const migration = readFileSync(
    "supabase/migrations/202607240001_create_news.sql",
    "utf8",
  );
  const simplificationMigration = readFileSync(
    "supabase/migrations/202607240002_simplify_news_announcements.sql",
    "utf8",
  );

  it("creates the constrained news table and indexes", () => {
    expect(migration).toContain("create table if not exists public.news");
    expect(migration).toContain(
      "tournament_id uuid references public.tournaments(id) on delete set null",
    );
    expect(migration).not.toContain("news_status_check");
    expect(migration).toContain("news_title_not_blank");
    expect(migration).toContain("news_slug_not_blank");
    expect(migration).toContain("news_content_not_blank");
    expect(migration).toContain("char_length(title) <= 100");
    expect(migration).toContain("news_content_length_check");
    expect(migration).toContain("char_length(content) <= 500");
    expect(migration).not.toContain("topics jsonb");
    expect(migration).toContain("news_admin_order_idx");
    expect(migration).not.toContain("news_public_order_idx");
    expect(migration).toContain("news_tournament_id_idx");
  });

  it("reuses the shared updated-at trigger function", () => {
    expect(migration).toContain("news_set_updated_at");
    expect(migration).toContain(
      "for each row execute function public.set_updated_at()",
    );
    expect(migration).not.toContain(
      "create or replace function public.set_updated_at",
    );
  });

  it("labels temporary anonymous Admin policies as insecure", () => {
    expect(migration).toContain(
      "TEMPORARY DEVELOPMENT POLICIES: INSECURE FOR PRODUCTION",
    );
    expect(migration).toContain("Temporary anonymous news reads");
    expect(migration).toContain("Temporary anonymous news creates");
    expect(migration).toContain("Temporary anonymous news updates");
    expect(migration).toContain("Temporary anonymous news deletes");
    expect(migration).not.toContain("service_role");
  });

  it("preserves content while removing publish and topic storage", () => {
    expect(simplificationMigration).toContain("drop column if exists topics");
    expect(simplificationMigration).toContain("drop column if exists status");
    expect(simplificationMigration).toContain(
      "drop column if exists published_at",
    );
    expect(simplificationMigration).not.toContain("drop column if exists content");
  });
});
