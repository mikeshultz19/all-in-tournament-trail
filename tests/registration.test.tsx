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
import {
  calculateCardProcessingFeeCents,
  calculateCardTotalCents,
} from "@/config/payment-policy";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

const baseSelections: RegistrationSelections = {
  registrationType: "solo",
  baseEntry: true,
  memberships: ["current"],
  memberPot: null,
  bigBass: false,
  insurance: false,
};

describe("required Tournament Entry", () => {
  it.each(["solo", "team"] as const)("requires Tournament Entry for %s registrations", (registrationType) => {
    const memberships = registrationType === "team" ? ["current", "current"] : ["current"];
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

  it("uses the authoritative $60 Base Entry and Square total for a current member", () => {
    expect(REGISTRATION_PRICING.baseEntry).toBe(60);

    const pricing = getRegistrationPricing(baseSelections);
    expect(pricing.subtotalCents).toBe(6000);
    expect(pricing.cardProcessingFeeCents).toBe(210);
    expect(pricing.totalCents).toBe(6210);
    expect(calculateCardProcessingFeeCents(6000)).toBe(210);
    expect(calculateCardTotalCents(6000)).toBe(6210);
  });

  it("charges $40 for a new solo member while using $60 Base Entry", () => {
    expect(REGISTRATION_PRICING.annualMembership).toBe(40);
    expect(REGISTRATION_PRICING.bronze).toBe(40);

    const pricing = getRegistrationPricing({
      ...baseSelections,
      memberships: ["joining"],
      memberPot: "bronze",
    });
    expect(pricing.subtotalCents).toBe(14000);
    expect(pricing.lineItems).toEqual([
      { name: "Angler 1 Membership", priceCents: 4000 },
      { name: "Tournament Entry", priceCents: 6000 },
      { name: "Bronze Pot", priceCents: 4000 },
    ]);
  });

  it("applies mandatory membership pricing for solo and team entries", () => {
    const price = (registrationType: "solo" | "team", memberships: RegistrationSelections["memberships"]) =>
      getRegistrationPricing({ registrationType, baseEntry: true, memberships, memberPot: null, bigBass: false, insurance: false }).subtotalCents;
    expect(price("solo", ["current"])).toBe(6000);
    expect(price("solo", ["joining"])).toBe(10000);
    expect(price("team", ["current", "current"])).toBe(6000);
    expect(price("team", ["current", "joining"])).toBe(10000);
    expect(price("team", ["joining", "joining"])).toBe(14000);
  });

  it("does not accept Free Entry as an entry type", () => {
    expect(validateRegistrationSelections({ ...baseSelections, entryType: "free" })).toContain("Free Entry is not a valid registration option.");
  });

  it("allows only one payout pot", () => {
    expect(validateRegistrationSelections({ ...baseSelections, memberships: ["current"], memberPot: ["bronze", "silver"] })).toContain("Choose only one payout pot: Bronze, Silver, or Gold.");
  });

  it("allows every registered angler to select any side pot", () => {
    expect(hasFullMembershipEligibility({ registrationType: "solo", memberships: ["current"] })).toBe(true);
    expect(hasFullMembershipEligibility({ registrationType: "team", memberships: ["current", "joining"] })).toBe(true);
    expect(hasFullMembershipEligibility({ registrationType: "team", memberships: ["current", "non-member"] })).toBe(false);
    for (const memberPot of ["bronze", "silver", "gold"] as const) {
      expect(validateRegistrationSelections({ ...baseSelections, memberPot })).toEqual([]);
    }
    expect(validateRegistrationSelections({ ...baseSelections, insurance: true })).toEqual([]);
  });

  it("rejects newly submitted non-member classifications", () => {
    expect(validateRegistrationSelections({ ...baseSelections, memberships: ["non-member"] }).some((error) => error.includes("Every angler must have an active seasonal membership"))).toBe(true);
  });

  it("renders the public terminology and intended registration groups", () => {
    const operationsBySlug = Object.fromEntries(tournaments.map((tournament) => [tournament.slug, getTournamentOperationsViewModel(tournament, new Date("2026-07-21T12:00:00Z"))]));
    const html = renderToStaticMarkup(<RegistrationForm tournaments={tournaments} operationsBySlug={operationsBySlug} policyVersions={{ rulesVersion: "1.0", waiverVersion: "1.0" }} />);
    expect(html).toContain("Tournament Registration");
    expect(html).toContain("Tournament Entry");
    expect(html).toContain("Optional Side Pots");
    expect(html).toContain("Optional Payout Pots");
    expect(html).toContain("purchase the $40 seasonal membership");
    expect(html).not.toContain("continue as a non-member");
    expect(html).toContain("Required");
    expect(html).not.toContain("Free Entry");
    expect(html).not.toContain("Base Entry");
  });
});
