import { REGISTRATION_PRICING } from "@/data/registration";

export type RegistrationType = "solo" | "team";
export type Membership = "current" | "joining" | "non-member";
export type MemberPot = "bronze" | "silver" | "gold";

export type RegistrationSelections = {
  registrationType: RegistrationType;
  baseEntry: true;
  memberships: Membership[];
  memberPot: MemberPot | null;
  bigBass: boolean;
  insurance: boolean;
};

export type RegistrationLineItem = { name: string; price: number };

export function hasFullMembershipEligibility(selections: Pick<RegistrationSelections, "registrationType" | "memberships">) {
  const requiredAnglers = selections.registrationType === "team" ? 2 : 1;
  return selections.memberships.length === requiredAnglers && selections.memberships.every((membership) => membership === "current" || membership === "joining");
}

export function validateRegistrationSelections(input: unknown): string[] {
  if (!input || typeof input !== "object") return ["Registration selections are required."];
  const selections = input as Partial<RegistrationSelections> & { entryType?: unknown };
  const errors: string[] = [];

  if (selections.entryType === "free") errors.push("Free Entry is not a valid registration option.");
  if (selections.baseEntry !== true) {
    if (selections.bigBass) errors.push("Big Bass can only be added with Tournament Entry.");
    if (selections.memberPot === "bronze") errors.push("Bronze can only be added with Tournament Entry.");
    if (selections.memberPot === "silver") errors.push("Silver can only be added with Tournament Entry.");
    if (selections.memberPot === "gold") errors.push("Gold can only be added with Tournament Entry.");
    if (selections.insurance) errors.push("Insurance Pot can only be added with Tournament Entry.");
    errors.push("Tournament Entry is required to register.");
  }
  if (selections.registrationType !== "solo" && selections.registrationType !== "team") errors.push("Select a valid registration type.");

  const validPot = selections.memberPot === null || selections.memberPot === "bronze" || selections.memberPot === "silver" || selections.memberPot === "gold";
  if (!validPot) errors.push("Choose only one member bonus pot: Bronze, Silver, or Gold.");

  const memberships = Array.isArray(selections.memberships) ? selections.memberships : [];
  const eligibilityInput = {
    registrationType: selections.registrationType === "team" ? "team" as const : "solo" as const,
    memberships,
  };
  if ((selections.memberPot || selections.insurance) && !hasFullMembershipEligibility(eligibilityInput)) {
    errors.push("Both anglers must be current members to enter Bronze, Silver, Gold, or the Insurance Pot.");
  }

  return errors;
}

export function getRegistrationPricing(selections: RegistrationSelections) {
  const validationErrors = validateRegistrationSelections(selections);
  if (validationErrors.length) throw new Error(validationErrors.join(" "));

  const lineItems: RegistrationLineItem[] = [];
  selections.memberships.forEach((membership, index) => {
    if (membership === "joining") lineItems.push({ name: `Angler ${index + 1} Membership`, price: REGISTRATION_PRICING.annualMembership });
  });
  lineItems.push({ name: "Tournament Entry", price: REGISTRATION_PRICING.baseEntry });
  if (selections.memberPot) lineItems.push({ name: `${selections.memberPot[0].toUpperCase()}${selections.memberPot.slice(1)} Pot`, price: REGISTRATION_PRICING[selections.memberPot] });
  if (selections.bigBass) lineItems.push({ name: "Big Bass", price: REGISTRATION_PRICING.bigBass });
  if (selections.insurance) lineItems.push({ name: "Insurance Pot", price: REGISTRATION_PRICING.insurance });

  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const processingFee = Number((subtotal * REGISTRATION_PRICING.processingRate).toFixed(2));
  return { lineItems, subtotal, processingFee, total: subtotal + processingFee };
}
