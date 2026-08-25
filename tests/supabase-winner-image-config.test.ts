import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = readFileSync("next.config.ts", "utf8");

describe("Supabase winner photo image configuration", () => {
  it("derives remote image hosts from both supported Supabase URL settings", () => {
    expect(config).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
    expect(config).toContain("process.env.SUPABASE_URL");
    expect(config).toContain("configuredSupabaseImagePatterns()");
    expect(config).toContain("/storage/v1/object/public/**");
    expect(config).toContain('protocol: "https"');
    expect(config).toContain("hostname: url.hostname");
    expect(config).not.toMatch(/pathname: "\/storage\/v1\/object\/public\/\*\*",\s*search:/);
  });

  it("allows cache-busting queries on staging winner photos", async () => {
    const { hasRemoteMatch } = await import("next/dist/shared/lib/match-remote-pattern");
    const patterns = [{
      protocol: "https" as const,
      hostname: "vcjhufuklqwvnqmarpqi.supabase.co",
      pathname: "/storage/v1/object/public/**",
    }];

    for (const photo of ["champion.jpg?v=1787543502482", "big-bass.jpg?v=1787543509558"]) {
      expect(hasRemoteMatch([], patterns, new URL(
        `https://vcjhufuklqwvnqmarpqi.supabase.co/storage/v1/object/public/tournament-photos/tournaments/tournament-id/${photo}`,
      ))).toBe(true);
    }
  });

  it("keeps Next Image in desktop and mobile winner components", () => {
    for (const file of [
      "components/WinnersCircle.tsx",
      "components/MobileWinnerCircle.tsx",
    ]) {
      const source = readFileSync(file, "utf8");
      expect(source).toContain('import Image from "next/image"');
      expect(source).toContain("<Image");
    }
  });
});
