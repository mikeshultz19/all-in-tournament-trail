import { REGISTRATION_OPTION_CONFIG, TOURNAMENT_REGISTRATION_CONFIG } from "@/data/registration";
import { getTournamentBySlug, type Tournament } from "@/data/tournaments";
import { getRegistrationPricing, type MemberPot, type Membership, type RegistrationType } from "@/lib/registration";
import { getRegistrationAvailability } from "@/lib/tournament-operations";

export const REGISTRATION_STATES = [
  "draft",
  "payment_pending",
  "payment_processing",
  "paid",
  "confirmed",
  "payment_failed",
  "cancelled",
  "refunded",
  "partially_refunded",
  "manual_review",
] as const;

export type OnlineRegistrationState = (typeof REGISTRATION_STATES)[number];
export type RegistrationPolicyKey = "rules" | "liability_waiver" | "refund_policy" | "payment_terms";

export const REGISTRATION_POLICY_VERSIONS: Record<RegistrationPolicyKey, string> = {
  rules: "1.1",
  liability_waiver: "1.0",
  refund_policy: "pending-approval-2026-07-22",
  payment_terms: "2026-07-22",
};

export type RegistrationAcknowledgment = {
  rulesVersion: string;
  waiverVersion: string;
  acknowledgedAt: string | null;
  acknowledgmentAccepted: boolean;
};

export type OnlineRegistrationAngler = {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  membership: Membership;
};

export type OnlineRegistrationRequest = {
  tournamentSlug: string;
  registrationType: RegistrationType;
  anglers: OnlineRegistrationAngler[];
  options: {
    bigBass: boolean;
    insurance: boolean;
    memberPot: MemberPot | null;
  };
  acknowledgment: RegistrationAcknowledgment;
};

export type RegistrationPriceSnapshot = {
  currency: "USD";
  lineItems: ReadonlyArray<{ code: string; name: string; priceCents: number }>;
  subtotalCents: number;
  cardProcessingFeeRateBasisPoints: 300;
  cardProcessingFeeCents: number;
  totalCents: number;
  calculatedAt: string;
};

export type RegistrationRecordDesign = {
  id: string;
  confirmationNumber: string | null;
  tournamentId: string;
  registrationType: RegistrationType;
  state: OnlineRegistrationState;
  anglers: OnlineRegistrationAngler[];
  membershipClassificationSnapshot: Membership[];
  priceSnapshot: RegistrationPriceSnapshot;
  policyAcceptances: Array<{
    registrationId: string;
    rulesVersion: string;
    waiverVersion: string;
    acknowledgedAt: string;
    acknowledgmentAccepted: true;
    policyVersions: Record<RegistrationPolicyKey, string>;
  }>;
  squarePaymentId: string | null;
  squareOrderReference: string | null;
  idempotencyKey: string;
  createdAt: string;
  confirmedAt: string | null;
  refundMetadata: { status: string; amountCents: number; updatedAt: string } | null;
};

export type RegistrationPolicyAcceptance = RegistrationRecordDesign["policyAcceptances"][number];

export function createRegistrationPolicyAcceptance(
  registrationId: string,
  acceptedAt: Date = new Date(),
): RegistrationPolicyAcceptance {
  if (!registrationId.trim()) throw new Error("A registration or draft ID is required for policy acceptance.");
  return {
    registrationId,
    rulesVersion: REGISTRATION_POLICY_VERSIONS.rules,
    waiverVersion: REGISTRATION_POLICY_VERSIONS.liability_waiver,
    acknowledgedAt: acceptedAt.toISOString(),
    acknowledgmentAccepted: true,
    policyVersions: { ...REGISTRATION_POLICY_VERSIONS },
  };
}

export type RegistrationEligibility = {
  state: "open" | "opens_soon" | "closed" | "sold_out" | "completed" | "unavailable";
  canRegister: boolean;
  label: string;
  reason: string;
};

type EligibilityOptions = {
  confirmedCount?: number;
  capacity?: number | null;
  registrationOpensAt?: Date | null;
  onlineRegistrationEnabled?: boolean;
};

export function getOnlineRegistrationEligibility(
  tournament: Tournament,
  now: Date = new Date(),
  options: EligibilityOptions = {},
): RegistrationEligibility {
  if (tournament.status === "official" || tournament.status === "unofficial") {
    return { state: "completed", canRegister: false, label: "Tournament Completed", reason: "Online registration is unavailable because this tournament is completed." };
  }
  if (tournament.tournamentStatus === "cancelled") {
    return { state: "closed", canRegister: false, label: "Registration Closed", reason: "Online registration is unavailable because this tournament is cancelled." };
  }
  if (options.onlineRegistrationEnabled === false) {
    return { state: "unavailable", canRegister: false, label: "Registration Unavailable", reason: "Online registration is disabled for this tournament." };
  }
  if (options.registrationOpensAt && now < options.registrationOpensAt) {
    return { state: "opens_soon", canRegister: false, label: "Registration Opens Soon", reason: `Online registration opens ${options.registrationOpensAt.toISOString()}.` };
  }
  const capacity = options.capacity;
  if (capacity !== null && capacity !== undefined && (options.confirmedCount ?? 0) >= capacity) {
    return { state: "sold_out", canRegister: false, label: "Sold Out", reason: "This tournament has reached its registration limit." };
  }
  const availability = getRegistrationAvailability(tournament, now);
  if (!availability.canSubmit) {
    return { state: tournament.registrationStatus === "unavailable" ? "unavailable" : "closed", canRegister: false, label: tournament.registrationStatus === "unavailable" ? "Registration Unavailable" : "Registration Closed", reason: availability.reason };
  }
  return { state: "open", canRegister: true, label: "Register Online", reason: availability.reason };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{10,20}$/;
const STATE_PATTERN = /^[A-Za-z]{2}$/;
const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;

function validateAngler(angler: OnlineRegistrationAngler, position: number): string[] {
  const prefix = `Angler ${position}`;
  const errors: string[] = [];
  if (!angler || typeof angler !== "object") return [`${prefix} information is required.`];
  if (angler.firstName?.trim().length < 2) errors.push(`${prefix} first name is required.`);
  if (angler.lastName?.trim().length < 2) errors.push(`${prefix} last name is required.`);
  if (!EMAIL_PATTERN.test(angler.email?.trim() ?? "")) errors.push(`${prefix} email is invalid.`);
  if (!PHONE_PATTERN.test(angler.mobilePhone?.trim() ?? "")) errors.push(`${prefix} mobile phone is invalid.`);
  if (angler.streetAddress?.trim().length < 3) errors.push(`${prefix} street address is required.`);
  if (angler.city?.trim().length < 2) errors.push(`${prefix} city is required.`);
  if (!STATE_PATTERN.test(angler.state?.trim() ?? "")) errors.push(`${prefix} state must be a 2-letter code.`);
  if (!ZIP_PATTERN.test(angler.zipCode?.trim() ?? "")) errors.push(`${prefix} ZIP Code is invalid.`);
  if (!(["current", "joining", "non-member"] as const).includes(angler.membership)) errors.push(`${prefix} membership classification is invalid.`);
  return errors;
}

export function validateOnlineRegistrationRequest(
  input: OnlineRegistrationRequest,
  now: Date = new Date(),
  eligibilityOptions: EligibilityOptions = {},
  tournamentOverride?: Tournament,
): string[] {
  if (!input || typeof input !== "object") return ["Enter valid registration information."];
  const tournament =
    tournamentOverride ?? getTournamentBySlug(input.tournamentSlug);
  if (!tournament) return ["Select a valid tournament."];
  const eligibility = getOnlineRegistrationEligibility(tournament, now, {
    capacity: TOURNAMENT_REGISTRATION_CONFIG.capacity,
    onlineRegistrationEnabled: TOURNAMENT_REGISTRATION_CONFIG.onlineRegistrationEnabled,
    ...eligibilityOptions,
  });
  const errors = eligibility.canRegister ? [] : [eligibility.reason];
  if (!(TOURNAMENT_REGISTRATION_CONFIG.allowedTypes as readonly unknown[]).includes(input.registrationType)) errors.push("Select a registration type offered by this tournament.");
  const requiredAnglers = input.registrationType === "team" ? 2 : 1;
  if (!Array.isArray(input.anglers) || input.anglers.length !== requiredAnglers) errors.push(`${input.registrationType === "team" ? "Team" : "Solo"} registration requires ${requiredAnglers} angler${requiredAnglers === 1 ? "" : "s"}.`);
  else input.anglers.forEach((angler, index) => errors.push(...validateAngler(angler, index + 1)));
  const memberships = Array.isArray(input.anglers)
    ? input.anglers.flatMap((angler) => angler && typeof angler === "object" ? [angler.membership] : [])
    : [];
  if (!input.options || typeof input.options !== "object") {
    errors.push("Select valid registration options.");
  } else {
    const optionKeys = Object.keys(input.options);
    if (optionKeys.some((key) => !["bigBass", "insurance", "memberPot"].includes(key))) errors.push("Only configured tournament options may be selected.");
    if (typeof input.options.bigBass !== "boolean" || typeof input.options.insurance !== "boolean") errors.push("Select valid registration options.");
    else errors.push(...getSelectionErrors(input.registrationType, memberships, input.options));
  }
  if (input.acknowledgment?.acknowledgmentAccepted !== true) {
    errors.push("Accept the Official Tournament Rules and Participant Liability Waiver.");
  } else {
    if (input.acknowledgment.rulesVersion !== REGISTRATION_POLICY_VERSIONS.rules) errors.push("Review and accept the current Official Tournament Rules.");
    if (input.acknowledgment.waiverVersion !== REGISTRATION_POLICY_VERSIONS.liability_waiver) errors.push("Review and accept the current Participant Liability Waiver.");
    if (!input.acknowledgment.acknowledgedAt || Number.isNaN(Date.parse(input.acknowledgment.acknowledgedAt))) errors.push("A valid policy acknowledgment time is required.");
  }
  return [...new Set(errors)];
}

function getSelectionErrors(registrationType: RegistrationType, memberships: Membership[], options: OnlineRegistrationRequest["options"]): string[] {
  return importSelections(registrationType, memberships, options);
}

function importSelections(registrationType: RegistrationType, memberships: Membership[], options: OnlineRegistrationRequest["options"]): string[] {
  const validPot = options.memberPot === null || ["bronze", "silver", "gold"].includes(options.memberPot);
  if (!validPot) return ["Choose only a configured member bonus pot."];
  const selection = { registrationType, baseEntry: true as const, memberships, memberPot: options.memberPot, bigBass: options.bigBass, insurance: options.insurance };
  return getSafeSelectionErrors(selection);
}

function getSafeSelectionErrors(selection: Parameters<typeof getRegistrationPricing>[0]): string[] {
  try {
    getRegistrationPricing(selection);
    return [];
  } catch (error) {
    return [error instanceof Error ? error.message : "Registration options are invalid."];
  }
}

export function createAuthoritativeRegistrationQuote(
  input: OnlineRegistrationRequest,
  now: Date = new Date(),
  tournamentOverride?: Tournament,
): RegistrationPriceSnapshot {
  const errors = validateOnlineRegistrationRequest(
    input,
    now,
    {},
    tournamentOverride,
  );
  if (errors.length) throw new Error(errors.join(" "));
  const pricing = getRegistrationPricing({
    registrationType: input.registrationType,
    baseEntry: true,
    memberships: input.anglers.map((angler) => angler.membership),
    memberPot: input.options.memberPot,
    bigBass: input.options.bigBass,
    insurance: input.options.insurance,
  });
  return {
    currency: "USD",
    lineItems: pricing.lineItems.map((item, index) => {
      const configuredOption = Object.entries(REGISTRATION_OPTION_CONFIG).find(([, option]) => option.name === item.name);
      return { code: configuredOption?.[0] ?? (item.name.includes("Membership") ? "annual_membership" : `item_${index + 1}`), ...item };
    }),
    subtotalCents: pricing.subtotalCents,
    cardProcessingFeeRateBasisPoints: 300,
    cardProcessingFeeCents: pricing.cardProcessingFeeCents,
    totalCents: pricing.totalCents,
    calculatedAt: now.toISOString(),
  };
}

export function applyVerifiedSquarePayment(currentState: OnlineRegistrationState, processedPaymentIds: ReadonlySet<string>, paymentId: string) {
  if (processedPaymentIds.has(paymentId)) return { state: currentState, createdConfirmation: false };
  if (currentState !== "payment_pending" && currentState !== "payment_processing") return { state: "manual_review" as const, createdConfirmation: false };
  return { state: "confirmed" as const, createdConfirmation: true };
}

export function applyFailedSquarePayment(currentState: OnlineRegistrationState): OnlineRegistrationState {
  return currentState === "payment_pending" || currentState === "payment_processing" ? "payment_failed" : currentState;
}

export type CapacityReservation = {
  state: OnlineRegistrationState;
  holdExpiresAt: string | null;
};

export function countCapacityReservations(entries: readonly CapacityReservation[], now: Date = new Date()): number {
  return entries.filter((entry) => {
    if (["paid", "confirmed", "manual_review"].includes(entry.state)) return true;
    if (!["payment_pending", "payment_processing"].includes(entry.state)) return false;
    return entry.holdExpiresAt !== null && new Date(entry.holdExpiresAt) > now;
  }).length;
}
