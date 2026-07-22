import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LiabilityWaiverPage from "@/app/liability-waiver/page";
import RulesPage from "@/app/rules/page";
import { REGISTRATION_POLICY_VERSIONS } from "@/lib/online-registration";

function documentVersion(filename: string): string {
  const source = readFileSync(path.join(process.cwd(), "docs", filename), "utf8");
  const match = source.match(/\*\*Version:\*\*\s*([^\r\n]+)/);
  if (!match?.[1]) throw new Error(`${filename} is missing its version.`);
  return match[1].trim();
}

describe("public registration policy pages", () => {
  it("renders the current Official Tournament Rules document", async () => {
    const html = renderToStaticMarkup(await RulesPage());
    expect(html).toContain("Official Tournament Rules");
    expect(html).toContain("Tournament Eligibility");
    expect(html).toContain('id="boat-safety"');
    expect(html).toContain('href="#fishing-rules"');
    expect(html).toContain('href="/register"');
    expect(html).not.toMatch(/Co-Angler|\d{3}[-.) ]\d{3}[-. ]\d{4}/i);
  });

  it("renders the waiver and visibly preserves its legal-review status", async () => {
    const html = renderToStaticMarkup(await LiabilityWaiverPage());
    expect(html).toContain("Participant Liability Waiver and Assumption of Risk");
    expect(html).toContain("Draft – Pending Legal Review");
    expect(html).toContain("qualified legal counsel");
    expect(html).toContain('href="/register"');
  });

  it("uses document versions in the registration contract", () => {
    expect(REGISTRATION_POLICY_VERSIONS.rules).toBe(documentVersion("TOURNAMENT_RULES.md"));
    expect(REGISTRATION_POLICY_VERSIONS.liability_waiver).toBe(documentVersion("LIABILITY_WAIVER.md"));
  });

  it("uses only local policy documents and icons", async () => {
    const html = `${renderToStaticMarkup(await RulesPage())}${renderToStaticMarkup(await LiabilityWaiverPage())}`;
    expect(html).not.toMatch(/https?:\/\//);
  });
});
