import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import LiabilityWaiverPage from "@/app/liability-waiver/page";
import RulesPage from "@/app/rules/page";
import { REGISTRATION_POLICY_VERSIONS } from "@/lib/online-registration";

describe("public registration policy pages", () => {
  it("renders the current Official Tournament Rules document", async () => {
    const html = renderToStaticMarkup(await RulesPage());
    expect(html).toContain("Official Tournament Rules");
    expect(html).toContain("Tournament Eligibility");
    expect(html).toContain('id="boat-safety"');
    expect(html).toContain('href="#fishing-rules"');
    expect(html).toContain('href="/register"');
    expect(html).not.toContain("Version History");
    expect(html).not.toContain("version-history");
    expect(html).not.toMatch(/Co-Angler|\d{3}[-.) ]\d{3}[-. ]\d{4}/i);
  });

  it("renders the public waiver without internal drafting metadata", async () => {
    const html = renderToStaticMarkup(await LiabilityWaiverPage());
    expect(html).toContain("Participant Liability Waiver and Assumption of Risk");
    expect(html).toContain("All-In Tournament Trail");
    expect(html).not.toMatch(/Draft|Pending Legal Review|qualified legal counsel|LEGAL REVIEW REQUIRED:|attorney-approved|Effective Date|Version History/i);
    expect(html).toContain('href="/register"');
  });

  it("covers participant responsibility, vessel operation, weather, and third-party risks", async () => {
    const html = renderToStaticMarkup(await LiabilityWaiverPage());
    expect(html).toContain("Acknowledgment of Inherent Risks");
    expect(html).toContain("Participant Responsibility and Independent Judgment");
    expect(html).toContain("Safe and lawful vessel operation");
    expect(html).toContain("Weather and Water Conditions");
    expect(html).toContain("Tournament Officials cannot observe, supervise, direct, or control every participant");
    expect(html).toContain("No tournament schedule, check-in deadline, prize opportunity");
    expect(html).toMatch(/boating accidents[\s\S]*equipment failure[\s\S]*navigation[\s\S]*third parties/i);
  });

  it("preserves applicable-law limits and hides attorney drafting comments", async () => {
    const html = renderToStaticMarkup(await LiabilityWaiverPage());
    expect(html).toContain("to the fullest extent permitted by applicable law");
    expect(html).toContain("cannot legally be waived under applicable law");
    expect(html).toContain("gross negligence");
    expect(html).toContain("intentional misconduct");
    expect(html).not.toContain("LEGAL REVIEW REQUIRED:");
    expect(html).not.toMatch(/(?:is|has been) attorney[- ]approved/i);
    expect(html).not.toMatch(/Co-Angler|\d{3}[-.) ]\d{3}[-. ]\d{4}/i);
  });

  it("keeps internal policy versions in the registration contract", () => {
    expect(REGISTRATION_POLICY_VERSIONS.rules).toBe("1.10");
    expect(REGISTRATION_POLICY_VERSIONS.liability_waiver).toBe("1.1");
  });

  it("uses only local policy documents and icons", async () => {
    const source = `${readFileSync(path.join(process.cwd(), "docs", "TOURNAMENT_RULES.md"), "utf8")}${readFileSync(path.join(process.cwd(), "docs", "LIABILITY_WAIVER.md"), "utf8")}`;
    expect(source).not.toMatch(/https?:\/\//);
  });
});
