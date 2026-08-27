export type WalkUpRegistrationDraft = {
  registrationType: "solo" | "team";
  paymentMethod: "cash" | "card" | "other";
  angler1FirstName: string;
  angler1LastName: string;
  angler1StreetAddress: string;
  angler1City: string;
  angler1State: string;
  angler1ZipCode: string;
  angler1Email: string;
  angler1Phone: string;
  angler1Membership: "current" | "joining" | "non-member";
  angler2FirstName: string;
  angler2LastName: string;
  angler2StreetAddress: string;
  angler2City: string;
  angler2State: string;
  angler2ZipCode: string;
  angler2Email: string;
  angler2Phone: string;
  angler2Membership: "current" | "joining" | "non-member";
  memberPot: "" | "bronze" | "silver" | "gold";
  totalPaid: string;
  bigBass: boolean;
  insurance: boolean;
};

export type WalkUpPricingSelections = {
  registrationType: RegistrationType;
  paymentMethod: WalkUpRegistrationDraft["paymentMethod"];
  memberships: readonly Membership[];
  memberPot: MemberPot | null;
  bigBass: boolean;
  insurance: boolean;
};

export function getWalkUpPricing(selections: WalkUpPricingSelections) {
  const pricing = getRegistrationPricing({
    registrationType: selections.registrationType,
    baseEntry: true,
    memberships: [...selections.memberships],
    memberPot: selections.memberPot,
    bigBass: selections.bigBass,
    insurance: selections.insurance,
  });
  return {
    ...pricing,
    totalCollectedCents:
      selections.paymentMethod === "card"
        ? pricing.totalCents
        : pricing.subtotalCents,
  };
}

export function getWalkUpDisplayPricing(selections: WalkUpPricingSelections) {
  const eligible = hasFullMembershipEligibility({
    registrationType: selections.registrationType,
    memberships: [...selections.memberships],
  });
  return getWalkUpPricing({
    ...selections,
    memberPot: eligible ? selections.memberPot : null,
    insurance: eligible && selections.insurance,
  });
}

export function createDefaultWalkUpRegistrationDraft(): WalkUpRegistrationDraft {
  return {
    registrationType: "team",
    paymentMethod: "cash",
    angler1FirstName: "",
    angler1LastName: "",
    angler1StreetAddress: "",
    angler1City: "",
    angler1State: "",
    angler1ZipCode: "",
    angler1Email: "",
    angler1Phone: "",
    angler1Membership: "non-member",
    angler2FirstName: "",
    angler2LastName: "",
    angler2StreetAddress: "",
    angler2City: "",
    angler2State: "",
    angler2ZipCode: "",
    angler2Email: "",
    angler2Phone: "",
    angler2Membership: "non-member",
    memberPot: "",
    totalPaid: "",
    bigBass: false,
    insurance: false,
  };
}

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function membership(value: string): WalkUpRegistrationDraft["angler1Membership"] {
  return value === "current" || value === "joining" || value === "non-member"
    ? value
    : "non-member";
}

function paymentMethod(value: string): WalkUpRegistrationDraft["paymentMethod"] {
  return value === "card" || value === "other" ? value : "cash";
}

function memberPot(value: string): WalkUpRegistrationDraft["memberPot"] {
  return value === "bronze" || value === "silver" || value === "gold"
    ? value
    : "";
}

function booleanField(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export function createWalkUpRegistrationDraft(
  formData: FormData,
): WalkUpRegistrationDraft {
  return {
    registrationType: text(formData, "registrationType") === "solo" ? "solo" : "team",
    paymentMethod: paymentMethod(text(formData, "paymentMethod")),
    angler1FirstName: text(formData, "angler1FirstName"),
    angler1LastName: text(formData, "angler1LastName"),
    angler1StreetAddress: text(formData, "angler1StreetAddress"),
    angler1City: text(formData, "angler1City"),
    angler1State: text(formData, "angler1State").toUpperCase(),
    angler1ZipCode: text(formData, "angler1ZipCode"),
    angler1Email: text(formData, "angler1Email"),
    angler1Phone: text(formData, "angler1Phone"),
    angler1Membership: membership(text(formData, "angler1Membership")),
    angler2FirstName: text(formData, "angler2FirstName"),
    angler2LastName: text(formData, "angler2LastName"),
    angler2StreetAddress: text(formData, "angler2StreetAddress"),
    angler2City: text(formData, "angler2City"),
    angler2State: text(formData, "angler2State").toUpperCase(),
    angler2ZipCode: text(formData, "angler2ZipCode"),
    angler2Email: text(formData, "angler2Email"),
    angler2Phone: text(formData, "angler2Phone"),
    angler2Membership: membership(text(formData, "angler2Membership")),
    memberPot: memberPot(text(formData, "memberPot")),
    totalPaid: text(formData, "totalPaid"),
    bigBass: booleanField(formData, "bigBass"),
    insurance: booleanField(formData, "insurance"),
  };
}
import {
  getRegistrationPricing,
  hasFullMembershipEligibility,
  type MemberPot,
  type Membership,
  type RegistrationType,
} from "@/lib/registration";
