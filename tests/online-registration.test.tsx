import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RegistrationConfirmation, { type RegistrationConfirmationView } from "@/components/RegistrationConfirmation";
import PaymentOptions from "@/components/PaymentOptions";
import RegistrationForm, { clearRegistrationQuote, createRegistrationQuoteFingerprint, resetMembershipSelectionsForTournamentChange, type RegistrationQuoteClientState } from "@/components/RegistrationForm";
import { tournaments, type Tournament } from "@/data/tournaments";
import {
  applyFailedSquarePayment,
  applyVerifiedSquarePayment,
  countCapacityReservations,
  createRegistrationPolicyAcceptance,
  createAuthoritativeRegistrationQuote,
  getOnlineRegistrationEligibility,
  isFirstRegularSeasonTournament,
  REGISTRATION_POLICY_VERSIONS,
  selectCompetitiveRecordAnglers,
  validateOnlineRegistrationRequest,
  type OnlineRegistrationRequest,
} from "@/lib/online-registration";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";
import { selectInitialRegistrationSlug } from "@/lib/registration-entry-selection";

const NOW = new Date("2026-07-22T12:00:00.000Z");
const POLICY_VERSIONS = {
  rulesVersion: REGISTRATION_POLICY_VERSIONS.rules,
  waiverVersion: REGISTRATION_POLICY_VERSIONS.liability_waiver,
};
const registrationFormSource = fs.readFileSync(path.join(process.cwd(), "components/RegistrationForm.tsx"), "utf8");
const quoteRouteSource = fs.readFileSync(path.join(process.cwd(), "app/api/registrations/quote/route.ts"), "utf8");

function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return { ...tournaments[0], registrationStatus: "open", tournamentStatus: "scheduled", status: "upcoming", ...overrides };
}

const firstTournament = tournament({ regularSeasonNumber: 1 });
const laterTournament = tournament({ regularSeasonNumber: 2 });

function validRequest(overrides: Partial<OnlineRegistrationRequest> = {}): OnlineRegistrationRequest {
  return {
    tournamentSlug: tournaments[1].slug,
    registrationType: "solo",
    anglers: [{ firstName: "Taylor", lastName: "Angler", email: "taylor@example.com", mobilePhone: "817-555-0100", streetAddress: "100 Lake Road", city: "Azle", state: "TX", zipCode: "76020", membership: "current" }],
    options: { bigBass: false, insurance: false, memberPot: null },
    acknowledgment: { ...POLICY_VERSIONS, acknowledgedAt: NOW.toISOString(), acknowledgmentAccepted: true },
    ...overrides,
  };
}

describe("online tournament eligibility", () => {
  it("allows only eligible tournaments", () => expect(getOnlineRegistrationEligibility(tournament(), NOW).canRegister).toBe(true));
  it("does not close registration because an old cutoff has passed", () => expect(getOnlineRegistrationEligibility(tournament(), new Date("2026-11-01T12:00:00Z")).canRegister).toBe(true));
  it("allows registration on tournament morning", () => expect(getOnlineRegistrationEligibility(tournament(), new Date("2026-11-01T13:00:00Z")).canRegister).toBe(true));
  it("blocks cancelled tournaments", () => expect(getOnlineRegistrationEligibility(tournament({ tournamentStatus: "cancelled" }), NOW).canRegister).toBe(false));
  it("blocks completed tournaments", () => {
    const completed = getOnlineRegistrationEligibility(tournament({ status: "official", registrationStatus: "closed" }), NOW);
    expect(completed.state).toBe("completed");
    expect(completed.reason).toBe("Registration is no longer available for this tournament.");
  });
  it("blocks sold-out tournaments", () => expect(getOnlineRegistrationEligibility(tournament(), NOW, { capacity: 25, confirmedCount: 25 }).state).toBe("sold_out"));
  it("blocks tournaments with online registration disabled", () => expect(getOnlineRegistrationEligibility(tournament(), NOW, { onlineRegistrationEnabled: false }).state).toBe("unavailable"));
});

describe("registration entry tournament selection", () => {
  const schedule = [{ slug: "closed-first" }, { slug: "open-second" }, { slug: "open-third" }];
  const operations = {
    "closed-first": { registrationCanSubmit: false },
    "open-second": { registrationCanSubmit: true },
    "open-third": { registrationCanSubmit: true },
  };

  it("selects the first available tournament when the first schedule entry is closed", () => {
    expect(selectInitialRegistrationSlug(schedule, undefined, operations)).toBe("open-second");
  });
  it("keeps deterministic active-season ordering when multiple tournaments are open", () => {
    expect(selectInitialRegistrationSlug(schedule, undefined, operations)).toBe("open-second");
  });
  it("preserves an explicit valid tournament even when it is closed", () => {
    expect(selectInitialRegistrationSlug(schedule, "closed-first", operations)).toBe("closed-first");
  });
  it("keeps the existing unavailable fallback when no tournament is open", () => {
    const closed = Object.fromEntries(schedule.map((item) => [item.slug, { registrationCanSubmit: false }]));
    expect(selectInitialRegistrationSlug(schedule, undefined, closed)).toBe("closed-first");
  });
  it("uses only the supplied active-season schedule, excluding inactive-season candidates", () => {
    expect(selectInitialRegistrationSlug([{ slug: "active-season-open" }], undefined, { "active-season-open": { registrationCanSubmit: true } })).toBe("active-season-open");
  });
});

describe("server-authoritative registration validation and pricing", () => {
  it("validates required angler fields", () => expect(validateOnlineRegistrationRequest(validRequest({ anglers: [{ ...validRequest().anglers[0], mobilePhone: "" }] }), NOW)).toContain("Angler 1 mobile phone is invalid."));
  it("allows a valid Solo current member to register without purchasing membership", () => {
    expect(validateOnlineRegistrationRequest(validRequest(), NOW)).toEqual([]);
    const quote = createAuthoritativeRegistrationQuote(validRequest(), NOW);
    expect(quote.lineItems.map((item) => item.name)).toEqual(["Tournament Entry"]);
    expect(quote.subtotalCents).toBe(6000);
    expect(quote.cardProcessingFeeCents).toBe(210);
    expect(quote.totalCents).toBe(6210);
  });
  it("requires a new membership for a first-tournament solo", () => {
    const request = validRequest({ tournamentSlug: firstTournament.slug });
    expect(validateOnlineRegistrationRequest(request, NOW, {}, firstTournament)).toContain("All anglers must purchase their season membership for the first tournament.");
    expect(() => createAuthoritativeRegistrationQuote(request, NOW, firstTournament)).toThrow("first tournament");
  });
  it("uses the authoritative database tournament-order field", () => {
    expect(isFirstRegularSeasonTournament({ event_type: "regular_season", regular_season_number: 1 })).toBe(true);
    expect(isFirstRegularSeasonTournament({ event_type: "regular_season", regular_season_number: 2 })).toBe(false);
    expect(isFirstRegularSeasonTournament({ event_type: "championship", regular_season_number: null })).toBe(false);
  });
  it("requires both new memberships for a first-tournament team and prices both", () => {
    const first = validRequest().anglers[0];
    const request = validRequest({
      tournamentSlug: firstTournament.slug,
      registrationType: "team",
      anglers: [first, { ...first, firstName: "Jordan", email: "jordan@example.com", membership: "current" }],
    });
    expect(validateOnlineRegistrationRequest(request, NOW, {}, firstTournament)).toContain("All anglers must purchase their season membership for the first tournament.");
    const joiningRequest = { ...request, anglers: request.anglers.map((angler) => ({ ...angler, membership: "joining" as const })) };
    const quote = createAuthoritativeRegistrationQuote(joiningRequest, NOW, firstTournament);
    expect(quote.subtotalCents).toBe(14000);
    expect(quote.cardProcessingFeeCents).toBe(450);
    expect(quote.totalCents).toBe(14450);
  });
  it("keeps Current Member available for tournament two and later", () => {
    const request = validRequest({ tournamentSlug: laterTournament.slug });
    expect(validateOnlineRegistrationRequest(request, NOW, {}, laterTournament)).toEqual([]);
    expect(createAuthoritativeRegistrationQuote(request, NOW, laterTournament).subtotalCents).toBe(6000);
  });
  it("prices only explicit New Member selections", () => {
    const currentMember = createAuthoritativeRegistrationQuote(validRequest({ anglers: [{ ...validRequest().anglers[0], membership: "current" }] }), NOW);
    const newMember = createAuthoritativeRegistrationQuote(validRequest({ anglers: [{ ...validRequest().anglers[0], membership: "joining" }] }), NOW);
    expect(currentMember.subtotalCents).toBe(6000);
    expect(newMember.subtotalCents).toBe(10000);
  });
  it("rejects stale tournament-one membership claims before creating a payment attempt", () => {
    expect(quoteRouteSource.indexOf("validateOnlineRegistrationRequest")).toBeLessThan(quoteRouteSource.indexOf("createOnlinePaymentAttempt"));
    expect(quoteRouteSource).toContain('return NextResponse.json({ error: "Registration needs attention.", errors }, { status: 400 })');
  });
  it("allows a valid Team with current and new members", () => {
    const first = validRequest().anglers[0];
    const team = validRequest({
      registrationType: "team",
      anglers: [first, { ...first, firstName: "Jordan", email: "jordan@example.com" }],
    });
    expect(validateOnlineRegistrationRequest(team, NOW)).toEqual([]);
    const quote = createAuthoritativeRegistrationQuote({ ...team, anglers: [first, { ...first, firstName: "Jordan", email: "jordan@example.com", membership: "joining" }] }, NOW);
    expect(quote.lineItems.map((item) => item.name)).toEqual(["Angler 2 Membership", "Tournament Entry"]);
    expect(quote.subtotalCents).toBe(10000);
  });
  it("rejects a bypassed non-member classification at the server boundary", () => {
    const request = validRequest({ anglers: [{ ...validRequest().anglers[0], membership: "non-member" }] });
    expect(validateOnlineRegistrationRequest(request, NOW)).toContain("Angler 1 seasonal membership is required.");
    expect(() => createAuthoritativeRegistrationQuote(request, NOW)).toThrow("seasonal membership");
  });
  it("allows every side pot for a newly joined member", () => {
    const request = validRequest({ anglers: [{ ...validRequest().anglers[0], membership: "joining" }], options: { bigBass: true, insurance: true, memberPot: "gold" } });
    const quote = createAuthoritativeRegistrationQuote(request, NOW);
    expect(quote.lineItems.map((item) => item.name)).toEqual(["Angler 1 Membership", "Tournament Entry", "Gold Pot", "Big Bass", "Insurance Pot"]);
  });
  it("requires Angler 2 for a team competitive record", () => expect(validateOnlineRegistrationRequest(validRequest({ registrationType: "team" }), NOW)).toContain("Angler 2 is required for Team registration."));
  it("accepts exactly one angler for a solo competitive record", () => expect(validateOnlineRegistrationRequest(validRequest(), NOW)).toEqual([]));
  it("does not allow a client or environment override to bypass tournament suspension", () => {
    const closedTournament = tournament({ registrationStatus: "closed" });

    expect(validateOnlineRegistrationRequest(validRequest(), NOW, {}, closedTournament)).toContain("Registration is temporarily unavailable.");
  });
  it("uses the historical lockout message for a published tournament", () => {
    const publishedTournament = tournament({ status: "official", registrationStatus: "closed" });

    expect(validateOnlineRegistrationRequest(validRequest(), NOW, {}, publishedTournament)).toContain("Registration is no longer available for this tournament.");
  });
  it("prohibits Angler 2 for a solo competitive record", () => {
    const angler = validRequest().anglers[0];
    expect(validateOnlineRegistrationRequest(validRequest({ anglers: [angler, { ...angler, email: "partner@example.com" }] }), NOW)).toContain("Angler 2 is not allowed for Solo registration.");
  });
  it("builds a solo payload without Angler 2", () => {
    const angler = validRequest().anglers[0];
    expect(selectCompetitiveRecordAnglers("solo", angler, { ...angler, firstName: "Stale" })).toEqual([angler]);
  });
  it("builds a team payload with both anglers", () => {
    const angler1 = validRequest().anglers[0];
    const angler2 = { ...angler1, firstName: "Partner", email: "partner@example.com" };
    expect(selectCompetitiveRecordAnglers("team", angler1, angler2)).toEqual([angler1, angler2]);
  });
  it("rejects unconfigured option fields", () => {
    const request = validRequest();
    (request.options as unknown as Record<string, unknown>).championship = true;
    expect(validateOnlineRegistrationRequest(request, NOW)).toContain("Only configured tournament options may be selected.");
  });
  it("ignores client-submitted prices and totals", () => {
    const request = validRequest() as OnlineRegistrationRequest & { totalCents: number; optionPrices: Record<string, number> };
    request.totalCents = 1;
    request.optionPrices = { tournament_entry: 1 };
    const quote = createAuthoritativeRegistrationQuote(request, NOW);
    expect(quote.subtotalCents).toBe(6000);
    expect(quote.totalCents).toBe(6210);
  });
  it("uses current configuration for selected options", () => expect(createAuthoritativeRegistrationQuote(validRequest({ options: { bigBass: true, insurance: false, memberPot: null } }), NOW).subtotalCents).toBe(8000));
  it("calculates the 3% plus fixed Square service fee deterministically", () => {
    const quote = createAuthoritativeRegistrationQuote(validRequest(), NOW);
    expect(quote.cardProcessingFeeCents).toBe(210);
    expect(quote.totalCents).toBe(6210);
  });
  it("requires the combined acknowledgment", () => expect(validateOnlineRegistrationRequest(validRequest({ acknowledgment: { ...POLICY_VERSIONS, acknowledgedAt: null, acknowledgmentAccepted: false } }), NOW)).toContain("Accept the Official Tournament Rules and Participant Liability Waiver."));
  it("creates one acceptance event with registration ID, timestamp, and policy versions", () => {
    const acceptance = createRegistrationPolicyAcceptance("draft-123", NOW);
    expect(acceptance.registrationId).toBe("draft-123");
    expect(acceptance.acknowledgedAt).toBe(NOW.toISOString());
    expect(acceptance.acknowledgmentAccepted).toBe(true);
    expect(acceptance.rulesVersion).toBe("1.9");
    expect(acceptance.waiverVersion).toBe("1.0");
    expect(Object.keys(acceptance.policyVersions)).toEqual(["rules", "liability_waiver", "refund_policy", "payment_terms"]);
  });
  it("rejects malformed angler input safely", () => expect(validateOnlineRegistrationRequest(validRequest({ anglers: [null] as unknown as OnlineRegistrationRequest["anglers"] }), NOW)).toContain("Angler 1 information is required."));
  it("does not persist raw card data in the quote", () => {
    const serialized = JSON.stringify(createAuthoritativeRegistrationQuote(validRequest(), NOW)).toLowerCase();
    expect(serialized).not.toContain("cardnumber");
    expect(serialized).not.toContain("cvv");
    expect(serialized).not.toContain("paymenttoken");
  });
});

describe("payment idempotency and capacity recovery", () => {
  it("does not confirm a failed payment", () => expect(applyFailedSquarePayment("payment_processing")).toBe("payment_failed"));
  it("creates one confirmation after a verified payment", () => expect(applyVerifiedSquarePayment("payment_processing", new Set(), "square-1")).toEqual({ state: "confirmed", createdConfirmation: true }));
  it("ignores a repeated Square notification", () => expect(applyVerifiedSquarePayment("confirmed", new Set(["square-1"]), "square-1").createdConfirmation).toBe(false));
  it("counts active holds but releases expired drafts and holds", () => {
    const entries = [
      { state: "draft" as const, holdExpiresAt: null },
      { state: "payment_pending" as const, holdExpiresAt: "2026-07-22T11:00:00Z" },
      { state: "payment_processing" as const, holdExpiresAt: "2026-07-22T13:00:00Z" },
      { state: "confirmed" as const, holdExpiresAt: null },
    ];
    expect(countCapacityReservations(entries, NOW)).toBe(2);
  });
});

describe("confirmation experience", () => {
  const confirmation: RegistrationConfirmationView = { boatNumber: 17, tournamentName: "Eagle Mountain Tournament", tournamentDate: "2026-11-01T12:00:00+00:00", lake: "Eagle Mountain", ramp: "Twin Points Park", launchType: "Numbered Start", morningRegistration: "4:30 AM", launchTime: "6:45 AM", officialSunrise: "7:01 AM", scalesClose: "3:00 PM", anglers: ["Taylor Angler"], selectedOptions: ["Tournament Entry"], subtotalCents: 6000, totalCents: 6210, paymentStatus: "paid" };
  const html = renderToStaticMarkup(<RegistrationConfirmation confirmation={confirmation} />);
  it("uses one compact success heading", () => {
    expect(html).toContain("You’re Registered");
    expect(html).not.toContain("Registration confirmed");
    expect(html).toContain("text-3xl");
    expect(html).not.toContain("text-4xl");
  });
  it("shows the tournament and anglers", () => { expect(html).toContain("Eagle Mountain"); expect(html).toContain("Taylor Angler"); });
  it("shows a date-only tournament date without exposing the stored timestamp", () => {
    expect(html).toContain("November 1, 2026");
    expect(html).not.toContain("2026-11-01T12:00:00+00:00");
    expect(html).not.toMatch(/12:00|\+00:00/);
  });
  it("replaces registration-specific navigation controls with tournament logistics", () => {
    expect(html).not.toContain("Tournament Details");
    expect(html).not.toContain("Rules and Policies");
    expect(html).not.toContain('href="/schedule"');
    expect(html).not.toContain('href="/how-it-works"');
    for (const value of ["Eagle Mountain Tournament · Eagle Mountain", "Twin Points Park", "Numbered Start", "4:30 AM", "6:45 AM", "7:01 AM", "3:00 PM"]) expect(html).toContain(value);
    expect(html).toContain("Estimated Launch / Safe Light");
    expect(html).toContain("Sunrise");
    expect(html).toContain("Have your boat in the water and ready to launch before this time.");
    expect(html).toContain("All tournament times are subject to change by the Tournament Director.");
  });
  it("uses TBA for unavailable logistics and omits sunrise readiness copy", () => {
    const unavailable = renderToStaticMarkup(<RegistrationConfirmation confirmation={{ ...confirmation, ramp: null, launchType: null, morningRegistration: null, launchTime: null, officialSunrise: null, scalesClose: null }} />);
    expect(unavailable.match(/>TBA</g)).toHaveLength(6);
    expect(unavailable).not.toContain("Have your boat in the water and ready to launch before this time.");
  });
  it("shows one customer-facing registration number without obsolete launch-order guidance", () => {
    expect(html).not.toContain("Confirmation Number");
    expect(html).not.toContain("AITT-EM-0001");
    expect(html).toContain("Registration Number");
    expect(html).toContain("#17");
    expect(html).toContain("Your registration is confirmed. Your registration number is #17. You are required to complete check-in before the tournament to receive your boat number, launch time, and stop-fishing time. Check the Announcements section of the AITT website for early check-in times and location. If you do not attend early check-in, you must check in on tournament morning.");
    expect(html).not.toContain("Your boat number is your launch-order number");
    expect(html).not.toContain("This is your boat number and will also be your launch-order number");
    expect(html).not.toContain("Registration / Boat Number");
    expect(html).not.toContain("text-5xl");
  });
  it("shows an unassigned boat number honestly", () => {
    const unassigned = renderToStaticMarkup(<RegistrationConfirmation confirmation={{ ...confirmation, boatNumber: null }} />);
    expect(unassigned).toContain("Registration Number");
    expect(unassigned).toContain(">TBA<");
    expect(unassigned).not.toContain("assigned boat number");
  });
  it("shows the authoritative final amount without a processing-fee breakdown", () => {
    expect(html).toContain("$62.10");
    expect(html).not.toContain("Card Processing Fee");
    expect(html).not.toContain("$1.80");
  });
  it("shows the informational tournament-status notice and homepage link", () => {
    expect(html).toContain("Tournament Status");
    expect(html).toContain("Check the AITT homepage before the tournament for weather-related postponements, cancellations, or schedule changes. Updates will also be posted on AITT social media.");
    expect(html).toContain('href="/"');
    expect(html).toContain("Check AITT Homepage →");
  });
  it("preserves a recovery message after browser interruption", () => expect(renderToStaticMarkup(<RegistrationConfirmation confirmation={null} />)).toContain("do not pay again"));
});

describe("online payment presentation", () => {
  const operationsBySlug = Object.fromEntries(tournaments.map((item) => [item.slug, getTournamentOperationsViewModel(item, NOW)]));
  const html = renderToStaticMarkup(<RegistrationForm tournaments={tournaments} operationsBySlug={operationsBySlug} policyVersions={POLICY_VERSIONS} />);
  it("does not offer cash as an online payment control", () => expect(html).not.toMatch(/value="cash"|name="paymentMethod"/i));
  it("disables Current Member and requires New Member on tournament one", () => {
    const firstOperations = { [firstTournament.slug]: getTournamentOperationsViewModel(firstTournament, NOW) };
    const firstHtml = renderToStaticMarkup(<RegistrationForm tournaments={[firstTournament]} operationsBySlug={firstOperations} policyVersions={POLICY_VERSIONS} initialRegistrationType="solo" />);
    expect(firstHtml).toMatch(/id="angler1-membership-current"[^>]*disabled=""/);
    expect(firstHtml).toContain("All anglers must purchase their season membership for the first tournament.");
    expect(firstHtml).toContain('aria-describedby="angler1-membership-first-tournament"');
    expect(firstHtml).not.toMatch(/id="angler1-membership-joining"[^>]*checked=""/);
    expect(firstHtml).toMatch(/type="submit"[^>]*disabled=""[^>]*>Continue to Payment/);
  });
  it("disables Current Member independently for both tournament-one team anglers", () => {
    const firstOperations = { [firstTournament.slug]: getTournamentOperationsViewModel(firstTournament, NOW) };
    const firstHtml = renderToStaticMarkup(<RegistrationForm tournaments={[firstTournament]} operationsBySlug={firstOperations} policyVersions={POLICY_VERSIONS} />);
    expect(firstHtml).toContain('id="angler1-membership-current"');
    expect(firstHtml.match(/id="angler[12]-membership-current"[^>]*disabled=""/g) ?? []).toHaveLength(2);
    expect(firstHtml.match(/membership-first-tournament/g)).toHaveLength(6);
  });
  it("leaves both membership choices enabled but unselected for tournament two", () => {
    const laterOperations = { [laterTournament.slug]: getTournamentOperationsViewModel(laterTournament, NOW) };
    const laterHtml = renderToStaticMarkup(<RegistrationForm tournaments={[laterTournament]} operationsBySlug={laterOperations} policyVersions={POLICY_VERSIONS} initialRegistrationType="team" />);
    expect(laterHtml).not.toMatch(/id="angler[12]-membership-current"[^>]*disabled=""/);
    expect(laterHtml).not.toMatch(/id="angler[12]-membership-(current|joining)"[^>]*checked=""/);
    expect(laterHtml).toMatch(/type="submit"[^>]*disabled=""[^>]*>Continue to Payment/);
  });
  it("requires an explicit membership selection for every active solo or team participant", () => {
    const laterOperations = { [laterTournament.slug]: getTournamentOperationsViewModel(laterTournament, NOW) };
    const teamHtml = renderToStaticMarkup(<RegistrationForm tournaments={[laterTournament]} operationsBySlug={laterOperations} policyVersions={POLICY_VERSIONS} />);
    const soloHtml = renderToStaticMarkup(<RegistrationForm tournaments={[laterTournament]} operationsBySlug={laterOperations} policyVersions={POLICY_VERSIONS} initialRegistrationType="solo" />);
    expect(teamHtml).toContain('name="angler2.membership"');
    expect(soloHtml).not.toContain('name="angler2.membership"');
    expect(teamHtml).toMatch(/type="submit"[^>]*disabled=""[^>]*>Continue to Payment/);
    expect(soloHtml).toMatch(/type="submit"[^>]*disabled=""[^>]*>Continue to Payment/);
  });
  it("clears membership selections when tournament membership rules change", () => {
    const angler = { firstName: "Taylor", lastName: "Angler", email: "taylor@example.com", mobilePhone: "817-555-0100", streetAddress: "100 Lake Road", city: "Azle", state: "TX", zipCode: "76020", membership: "joining" as const };
    const current = { angler1: angler, angler2: { ...angler, membership: "current" as const } };
    expect(resetMembershipSelectionsForTournamentChange(current, true).angler1.membership).toBeNull();
    expect(resetMembershipSelectionsForTournamentChange(current, true).angler2.membership).toBeNull();
    expect(resetMembershipSelectionsForTournamentChange(current, false)).toBe(current);
  });
  it("does not advertise Venmo or Stripe", () => expect(html).not.toMatch(/Venmo|Stripe/i));
  it("provides the approved four-stage progress and clean payment boundary", () => {
    expect(html).toContain("Registration progress");
    expect(html).toContain("Team Info");
    expect(html).toContain("Continue to Payment");
    expect(html).toContain("Secure payment through Square");
    expect(html).not.toContain("Square and Apple Pay accepted at the ramp");
    expect(html).not.toMatch(/Visa|Mastercard|American Express|Discover/i);
  });
  it("moves tournament data into one condensed header", () => {
    const operations = operationsBySlug[tournaments[0].slug];
    expect(html).not.toContain("Early Registration Deadline");
    expect(html).toContain("Estimated Safe Light");
    expect(html).toContain(operations.safeLight.time);
    expect(html).toContain(operations.safeLight.officialSunrise);
    expect(html).toContain('data-icon-src="/icons/sun-safe-light.svg"');
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(1);
  });
  it("removes verbose registration-page information blocks", () => {
    expect(html).not.toContain("Tournament-morning registration");
    expect(html).not.toContain("Updated ");
    expect(html).not.toContain(tournaments[0].statusMessage);
    expect(html).not.toContain("Early Registration Deadline");
    expect(html.match(/Estimated Safe Light/g)).toHaveLength(1);
  });
  it("renders one required combined acknowledgment with policy links", () => {
    expect(html.match(/name="acknowledgment"/g)).toHaveLength(1);
    expect(html).toContain("id=\"acknowledgment-combined\"");
    expect(html).toContain("required=\"\"");
    expect(html).toContain('href="/rules"');
    expect(html).toContain(">Official Tournament Rules");
    expect(html).toContain('href="/liability-waiver"');
    expect(html).toContain(">Participant Liability Waiver");
    expect(html).not.toContain('id="acknowledgment-combined" type="checkbox" required="" checked=""');
    expect(html).toContain('aria-describedby="acknowledgment-requirement"');
    expect(html).toContain("Required before continuing to payment");
    expect(html).toContain("Rules version 1.9; waiver version 1.0");
    expect(html).not.toContain("accurate information");
    expect(html).not.toContain("acknowledgment-rules");
  });
  it("keeps tournament selection next to registration type and uses current participation names", () => {
    expect(html.indexOf("Tournament Selection")).toBeLessThan(html.indexOf("Registration Type"));
    expect(html).toContain("Team");
    expect(html).toContain("Individual / Solo");
    expect(html).not.toMatch(/Co-Angler/i);
  });
  it("defaults to Team and shows Solo fields only after Solo is explicitly selected", () => {
    const soloHtml = renderToStaticMarkup(<RegistrationForm tournaments={tournaments} operationsBySlug={operationsBySlug} policyVersions={POLICY_VERSIONS} initialRegistrationType="solo" />);
    expect(html).toMatch(/<input(?=[^>]*value="team")(?=[^>]*checked="")[^>]*>/);
    expect(html).toContain("Team Details — Angler 2");
    expect(html).toContain('name="angler2.firstName"');
    expect(html).toContain("Fish this tournament as a Team.");
    expect(html).toContain("Enter your established season partner even if they are unable to fish this tournament.");
    expect(html).toContain('class="mt-4 font-black leading-6 text-red-500"');
    expect(soloHtml).not.toContain("Team Details — Angler 2");
    expect(soloHtml).toMatch(/<input(?=[^>]*value="solo")(?=[^>]*checked="")[^>]*>/);
    expect(soloHtml).toContain("Fish this tournament as a Solo competitor.");
    expect(soloHtml).toContain("Your tournament finish and eligible season points belong to your separate Individual / Solo Competitive Record and are not applied to any Team Competitive Record you also participate on.");
    expect(soloHtml).toContain('class="mt-4 font-black leading-6 text-red-500"');
  });
  it("keeps the registration selector compact without the confirmation logistics panel", () => {
    const selected = tournaments[0];
    const visibleText = html.replace(/<[^>]+>/g, "");

    expect(html).not.toContain('aria-label="Tournament information"');
    expect(visibleText).toContain(selected.lake);
    expect(visibleText).toContain(operationsBySlug[selected.slug].formattedEffectiveDate);
    expect(visibleText).not.toContain("Lake / Tournament");
    expect(visibleText).not.toContain("Tournament Hours");
    expect(visibleText).not.toContain("Morning Registration / Check-In");
    expect(visibleText).not.toContain("Scales Close / Weigh-In");
    expect(visibleText).not.toContain("Ramp / Launch Location");
    expect(visibleText).not.toContain("Have your boat in the water and ready to launch before this time.");
    expect(visibleText).not.toContain("All tournament times are subject to change by the Tournament Director.");
    const registrationStatus = "Registration is open for this tournament.";
    expect(visibleText).toContain(registrationStatus);
    expect(visibleText.indexOf(registrationStatus)).toBeLessThan(visibleText.indexOf("Registration Type"));
    expect(html).not.toContain("Tournament Details");
    expect(html).not.toContain("Rules &amp; Policies");
    expect(html).not.toContain("How AITT Works");
  });
  it("shows the membership-benefits notice once beneath the first angler membership choices", () => {
    const notice = "Membership is required for every angler.";
    const noticeMarker = "Membership is required";
    const firstMembership = html.indexOf('id="angler1-membership-label"');
    const noticePosition = html.indexOf(noticeMarker);
    const secondAngler = html.indexOf("Team Details — Angler 2");
    const soloHtml = renderToStaticMarkup(<RegistrationForm tournaments={tournaments} operationsBySlug={operationsBySlug} policyVersions={POLICY_VERSIONS} initialRegistrationType="solo" />);
    const visibleText = (markup: string) => markup.replace(/<[^>]+>/g, "");

    expect(html.match(new RegExp(noticeMarker, "g"))).toHaveLength(1);
    expect(visibleText(html)).toContain(notice);
    expect(visibleText(html)).toContain("All registered anglers may select the optional");
    expect(noticePosition).toBeGreaterThan(firstMembership);
    expect(noticePosition).toBeLessThan(secondAngler);
    expect(soloHtml.match(new RegExp(noticeMarker, "g"))).toHaveLength(1);
    expect(visibleText(soloHtml)).toContain(notice);
    expect(visibleText(soloHtml)).toContain("All registered anglers may select the optional");
    expect(soloHtml.indexOf(noticeMarker)).toBeGreaterThan(soloHtml.indexOf('id="angler1-membership-label"'));
  });
  it("blocks invalid registration and stale policy versions before payment review", () => {
    expect(validateOnlineRegistrationRequest(validRequest({ anglers: [] }), NOW)).toContain("Angler 1 is required for Solo registration.");
    expect(validateOnlineRegistrationRequest(validRequest({ acknowledgment: { ...validRequest().acknowledgment, rulesVersion: "0.9" } }), NOW)).toContain("Review and accept the current Official Tournament Rules.");
  });
  it("keeps the review button actionable so submit can expose validation errors before creating a quote", () => {
    expect(registrationFormSource).toContain("const canAttemptReview = operations.registrationCanSubmit;");
    expect(registrationFormSource).toContain("if (Object.keys(nextErrors).length || !formIsValid)");
    expect(registrationFormSource).toContain("Complete all required angler information before payment.");
  });
  it("shows the compact authoritative-price summary without cash", () => {
    expect(html).toContain("Subtotal");
    expect(html).toContain("SQUARE SERVICE FEE");
    expect(html).not.toContain("+ $0.30");
    expect(html).not.toContain("+ $0.30");
    expect(html).toContain("Final Total");
    expect(html).not.toMatch(/cash/i);
  });
});

describe("registration quote invalidation", () => {
  const quotedAngler = { firstName: "Taylor", lastName: "Angler", email: "taylor@example.com", mobilePhone: "817-555-0100", streetAddress: "100 Lake Road", city: "Azle", state: "TX", zipCode: "76020", membership: "current" as const };
  const quotedBillingContact = { firstName: quotedAngler.firstName, lastName: quotedAngler.lastName, email: quotedAngler.email, phone: quotedAngler.mobilePhone, streetAddress: quotedAngler.streetAddress, city: quotedAngler.city, state: quotedAngler.state, zipCode: quotedAngler.zipCode };
  const quotedInput: Parameters<typeof createRegistrationQuoteFingerprint>[0] = {
    tournamentSlug: "twin-points-park",
    registrationType: "solo" as const,
    anglers: [quotedAngler],
    options: { memberPot: null, bigBass: false, insurance: false },
    acknowledgment: { rulesVersion: "1.9", waiverVersion: "1.0", acknowledgedAt: NOW.toISOString(), acknowledgmentAccepted: true },
  };
  const quotedState: RegistrationQuoteClientState = {
    serverQuote: createAuthoritativeRegistrationQuote(validRequest(), NOW),
    paymentAttemptId: "attempt-1",
    squareConfig: { applicationId: "sandbox-app", locationId: "sandbox-location", environment: "sandbox" },
    fingerprint: createRegistrationQuoteFingerprint(quotedInput),
  };

  it("clears the server quote, attempt, Square configuration, and fingerprint together", () => {
    expect(clearRegistrationQuote(quotedState)).toEqual({ serverQuote: null, paymentAttemptId: null, squareConfig: null, fingerprint: null });
  });

  it("keeps a valid quoted attempt payable until a material payload field changes", () => {
    const checkout = renderToStaticMarkup(<PaymentOptions total="$62.10" canReview reviewComplete checkoutAvailable paymentAttemptId="attempt-1" squareConfig={quotedState.squareConfig} billingContact={quotedBillingContact} />);
    expect(checkout).toContain("Pay $62.10");
    expect(clearRegistrationQuote(quotedState).paymentAttemptId).toBeNull();
  });

  it.each([
    ["Bronze", { options: { memberPot: "bronze" as const, bigBass: false, insurance: false } }],
    ["Silver", { options: { memberPot: "silver" as const, bigBass: false, insurance: false } }],
    ["Gold", { options: { memberPot: "gold" as const, bigBass: false, insurance: false } }],
    ["Big Bass", { options: { memberPot: null, bigBass: true, insurance: false } }],
    ["Insurance", { options: { memberPot: null, bigBass: false, insurance: true } }],
    ["membership selection", { anglers: [{ ...quotedAngler, membership: "joining" as const }] }],
    ["participant contact information", { anglers: [{ ...quotedAngler, email: "updated@example.com", mobilePhone: "817-555-0111", streetAddress: "200 Lake Road" }] }],
    ["solo/team structure", { registrationType: "team" as const, anglers: [quotedAngler, { ...quotedAngler, firstName: "Jordan", email: "jordan@example.com" }] }],
    ["tournament selection", { tournamentSlug: "eagle-mountain" }],
  ])("changes to %s produce a different quote fingerprint and clear the usable attempt", (_label, change) => {
    const changeRecord = change as { tournamentSlug?: string; registrationType?: typeof quotedInput.registrationType; anglers?: typeof quotedInput.anglers; options?: Partial<typeof quotedInput.options> };
    const changed = { ...quotedInput, ...changeRecord, options: { ...quotedInput.options, ...(changeRecord.options ?? {}) }, anglers: changeRecord.anglers ?? quotedInput.anglers };
    expect(createRegistrationQuoteFingerprint(changed)).not.toBe(quotedState.fingerprint);
    expect(clearRegistrationQuote(quotedState).paymentAttemptId).toBeNull();
  });

  it("covers every quoted field through one centralized invalidation path", () => {
    expect(registrationFormSource).toContain("function invalidateQuote()");
    expect(registrationFormSource.match(/invalidateQuote\(\)/g)?.length).toBeGreaterThanOrEqual(7);
    expect(registrationFormSource).toContain("quoteRequestVersionRef.current !== requestVersion");
  });

  it("recalculates the updated quote total from changed selections", () => {
    const original = createAuthoritativeRegistrationQuote(validRequest(), NOW);
    const updated = createAuthoritativeRegistrationQuote(validRequest({ options: { memberPot: "gold", bigBass: true, insurance: true } }), NOW);
    expect(updated.totalCents).toBeGreaterThan(original.totalCents);
    expect(updated.cardProcessingFeeCents).toBe(Math.ceil(updated.subtotalCents * 0.03) + 30);
  });
});
