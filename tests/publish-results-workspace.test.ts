import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Publish Results workspace wiring", () => {
  it("returns every dedicated publishing page to Step 4", () => {
    for (const path of [
      "app/admin/results/page.tsx",
      "app/admin/tournament-manager/photos/page.tsx",
      "app/admin/tournament-manager/publish/page.tsx",
    ]) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("Back to Publish Results");
      expect(source).toContain("step=5");
    }
  });

  it("redirects the retired manual Insurance Pot winner route to Insurance Pot", () => {
    const source = readFileSync(
      "app/admin/tournament-manager/insurance/results/page.tsx",
      "utf8",
    );
    expect(source).toContain("redirect(");
    expect(source).toContain("step=3");
  });

  it("keeps independent Overall Winner and Big Bass photo controls", () => {
    const source = readFileSync("components/admin/WinnerPhotosForm.tsx", "utf8");
    expect(source).toContain('title="Overall Winner Photo"');
    expect(source).toContain('title="Big Bass Winner Photo"');
    expect(source).toContain('photoType === "champion" ? "champion.jpg" : "big-bass.jpg"');
    expect(source).toContain("tournament.champion_photo_url ?? \"\"");
    expect(source).toContain("tournament.big_bass_photo_url ?? \"\"");
  });

  it("keeps the canonical CSV uploader in Import Results", () => {
    const importPage = readFileSync("app/admin/tournament-manager/import/page.tsx", "utf8");
    const editorPage = readFileSync("app/admin/results/page.tsx", "utf8");
    expect(importPage).toContain("WeighfishCsvUploader");
    expect(editorPage).not.toContain("WeighfishCsvUploader");
  });
});
