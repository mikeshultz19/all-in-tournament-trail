import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RegistrationForm from "@/components/RegistrationForm";
import { REGISTRATION_PRICING } from "@/data/registration";
import { tournaments } from "@/data/tournaments";
import {
  getRegistrationPricing,
  hasFullMembershipEligibility,
  validateRegistrationSelections,
  type MemberPot,
  type RegistrationSelections,
} from "@/lib/registration";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

const baseSelections: RegistrationSelections = {
  registrationType: "solo",
  baseEntry: true,
  memberships: ["non-member"],
  memberPot: null,
  bigBass: false,
  insurance: false,
};

describe("required Tournament Entry", () => {
  it.each(["solo", "team"] as const)("requires Tournament Entry for %s registrations", (registrationType) => {
    const memberships = registrationType === "team" ? ["non-member", "non-member"] : ["non-member"];
    expect(validateRegistrationSelections({ ...baseSelections, registrationType, memberships, baseEntry: false })).toContain("Tournament Entry is required to register.");
  });

  it("rejects a registration without Tournament Entry", () => {
    expect(validateRegistrationSelections({ ...baseSelections, baseEntry: undefined })).toContain("Tournament Entry is required to register.");
  });

  it("rejects Big Bass as a standalone entry", () => {
    expect(validateRegistrationSelections({ ...baseSelections, baseEntry: false, bigBass: true })).toContain("Big Bass can only be added with Tournament Entry.");
  });

  it.each(["bronze", "silver", "gold"] as const)("rejects %s without Tournament Entry", (memberPot: MemberPot) => {
    const errors = validateRegistrationSelections({ ...baseSelections, memberships: ["current"], memberPot, baseEntry: false });
    expect(errors.some((error) => error.includes("can only be added with Tournament Entry"))).toBe(true);
  });

  it("rejects Insurance Pot without Tournament Entry", () => {
    expect(validateRegistrationSelections({ ...baseSelections, memberships: ["current"], insurance: true, baseEntry: false })).toContain("Insurance Pot can only be added with Tournament Entry.");
  });

  it("always includes Tournament Entry in registration totals", () => {
    const pricing = getRegistrationPricing({ ...baseSelections, bigBass: true });
    expect(pricing.lineItems[0]).toEqual({ name: "Tournament Entry", priceCents: REGISTRATION_PRICING.baseEntry * 100 });
    expect(pricing.subtotalCents).toBe((REGISTRATION_PRICING.baseEntry + REGISTRATION_PRICING.bigBass) * 100);
    expect(pricing.totalCents).toBeGreaterThanOrEqual(REGISTRATION_PRICING.baseEntry * 100);
  });

  it("does not accept Free Entry as an entry type", () => {
    expect(validateRegistrationSelections({ ...baseSelections, entryType: "free" })).toContain("Free Entry is not a valid registration option.");
  });

  it("allows only one member bonus pot", () => {
    expect(validateRegistrationSelections({ ...baseSelections, memberships: ["current"], memberPot: ["bronze", "silver"] })).toContain("Choose only one member bonus pot: Bronze, Silver, or Gold.");
  });

  it("keeps member-only eligibility rules for solo and team entries", () => {
    expect(hasFullMembershipEligibility({ registrationType: "solo", memberships: ["current"] })).toBe(true);
    expect(hasFullMembershipEligibility({ registrationType: "team", memberships: ["current", "joining"] })).toBe(true);
    expect(hasFullMembershipEligibility({ registrationType: "team", memberships: ["current", "non-member"] })).toBe(false);
    expect(validateRegistrationSelections({ ...baseSelections, memberPot: "bronze" })).toContain("Both anglers must be current members to enter Bronze, Silver, Gold, or the Insurance Pot.");
  });

  it("renders the public terminology and intended registration groups", () => {
    const operationsBySlug = Object.fromEntries(tournaments.map((tournament) => [tournament.slug, getTournamentOperationsViewModel(tournament, new Date("2026-07-21T12:00:00Z"))]));
    const html = renderToStaticMarkup(<RegistrationForm operationsBySlug={operationsBySlug} policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }} />);
    expect(html).toContain("Tournament Registration");
    expect(html).toContain("Tournament Entry");
    expect(html).toContain("Optional Side Pots");
    expect(html).toContain("Member Bonus Pots");
    expect(html).toContain("Required");
    expect(html).not.toContain("Free Entry");
    expect(html).not.toContain("Base Entry");
  });
});
