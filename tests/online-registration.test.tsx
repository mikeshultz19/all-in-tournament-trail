import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RegistrationConfirmation, { type RegistrationConfirmationView } from "@/components/RegistrationConfirmation";
import RegistrationForm from "@/components/RegistrationForm";
import { tournaments, type Tournament } from "@/data/tournaments";
import {
  applyFailedSquarePayment,
  applyVerifiedSquarePayment,
  countCapacityReservations,
  createRegistrationPolicyAcceptance,
  createAuthoritativeRegistrationQuote,
  getOnlineRegistrationEligibility,
  REGISTRATION_POLICY_VERSIONS,
  validateOnlineRegistrationRequest,
  type OnlineRegistrationRequest,
} from "@/lib/online-registration";
import { getTournamentOperationsViewModel } from "@/lib/tournament-view-model";

const NOW = new Date("2026-07-22T12:00:00.000Z");
const POLICY_VERSIONS = {
  rulesVersion: REGISTRATION_POLICY_VERSIONS.rules,
  waiverVersion: REGISTRATION_POLICY_VERSIONS.liability_waiver,
};

function tournament(overrides: Partial<Tournament> = {}): Tournament {
  return { ...tournaments[0], registrationStatus: "open", tournamentStatus: "scheduled", status: "upcoming", ...overrides };
}

function validRequest(overrides: Partial<OnlineRegistrationRequest> = {}): OnlineRegistrationRequest {
  return {
    tournamentSlug: tournaments[0].slug,
    registrationType: "solo",
    anglers: [{ firstName: "Taylor", lastName: "Angler", email: "taylor@example.com", mobilePhone: "817-555-0100", streetAddress: "100 Lake Road", city: "Azle", state: "TX", zipCode: "76020", membership: "non-member" }],
    options: { bigBass: false, insurance: false, memberPot: null },
    acknowledgment: { ...POLICY_VERSIONS, acknowledgedAt: NOW.toISOString(), acknowledgmentAccepted: true },
    ...overrides,
  };
}

describe("online tournament eligibility", () => {
  it("allows only eligible tournaments", () => expect(getOnlineRegistrationEligibility(tournament(), NOW).canRegister).toBe(true));
  it("blocks registration before opening", () => expect(getOnlineRegistrationEligibility(tournament(), NOW, { registrationOpensAt: new Date("2026-08-01T00:00:00Z") }).state).toBe("opens_soon"));
  it("blocks registration after closing", () => expect(getOnlineRegistrationEligibility(tournament(), new Date("2026-11-01T12:00:00Z")).canRegister).toBe(false));
  it("blocks cancelled tournaments", () => expect(getOnlineRegistrationEligibility(tournament({ tournamentStatus: "cancelled" }), NOW).canRegister).toBe(false));
  it("blocks completed tournaments", () => expect(getOnlineRegistrationEligibility(tournament({ status: "official" }), NOW).state).toBe("completed"));
  it("blocks sold-out tournaments", () => expect(getOnlineRegistrationEligibility(tournament(), NOW, { capacity: 25, confirmedCount: 25 }).state).toBe("sold_out"));
  it("blocks tournaments with online registration disabled", () => expect(getOnlineRegistrationEligibility(tournament(), NOW, { onlineRegistrationEnabled: false }).state).toBe("unavailable"));
});

describe("server-authoritative registration validation and pricing", () => {
  it("validates required angler fields", () => expect(validateOnlineRegistrationRequest(validRequest({ anglers: [{ ...validRequest().anglers[0], mobilePhone: "" }] }), NOW)).toContain("Angler 1 mobile phone is invalid."));
  it("requires two anglers for a team", () => expect(validateOnlineRegistrationRequest(validRequest({ registrationType: "team" }), NOW)).toContain("Team registration requires 2 anglers."));
  it("requires only one angler for a solo entry", () => expect(validateOnlineRegistrationRequest(validRequest(), NOW)).not.toContain("Solo registration requires 1 angler."));
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
    expect(quote.totalCents).toBe(6180);
  });
  it("uses current configuration for selected options", () => expect(createAuthoritativeRegistrationQuote(validRequest({ options: { bigBass: true, insurance: false, memberPot: null } }), NOW).subtotalCents).toBe(8000));
  it("calculates and rounds the 3% Card Processing Fee deterministically", () => {
    const quote = createAuthoritativeRegistrationQuote(validRequest(), NOW);
    expect(quote.cardProcessingFeeCents).toBe(180);
    expect(quote.totalCents).toBe(6180);
  });
  it("requires the combined acknowledgment", () => expect(validateOnlineRegistrationRequest(validRequest({ acknowledgment: { ...POLICY_VERSIONS, acknowledgedAt: null, acknowledgmentAccepted: false } }), NOW)).toContain("Accept the Official Tournament Rules and Participant Liability Waiver."));
  it("creates one acceptance event with registration ID, timestamp, and policy versions", () => {
    const acceptance = createRegistrationPolicyAcceptance("draft-123", NOW);
    expect(acceptance.registrationId).toBe("draft-123");
    expect(acceptance.acknowledgedAt).toBe(NOW.toISOString());
    expect(acceptance.acknowledgmentAccepted).toBe(true);
    expect(acceptance.rulesVersion).toBe("1.1");
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
  const confirmation: RegistrationConfirmationView = { confirmationNumber: "AITT-EM-0001", tournamentName: "Eagle Mountain", tournamentDate: "November 1, 2026", venue: "Twin Points Park", anglers: ["Taylor Angler"], selectedOptions: ["Tournament Entry"], subtotalCents: 6000, cardProcessingFeeCents: 180, totalCents: 6180, paymentStatus: "paid" };
  const html = renderToStaticMarkup(<RegistrationConfirmation confirmation={confirmation} />);
  it("shows the tournament and anglers", () => { expect(html).toContain("Eagle Mountain"); expect(html).toContain("Taylor Angler"); });
  it("shows the final total and Card Processing Fee", () => { expect(html).toContain("$61.80"); expect(html).toContain("Card Processing Fee"); expect(html).toContain("$1.80"); });
  it("preserves a recovery message after browser interruption", () => expect(renderToStaticMarkup(<RegistrationConfirmation confirmation={null} />)).toContain("do not pay again"));
});

describe("online payment presentation", () => {
  const operationsBySlug = Object.fromEntries(tournaments.map((item) => [item.slug, getTournamentOperationsViewModel(item, NOW)]));
  const html = renderToStaticMarkup(<RegistrationForm operationsBySlug={operationsBySlug} policyVersions={POLICY_VERSIONS} />);
  it("does not offer cash as an online payment control", () => expect(html).not.toMatch(/value="cash"|name="paymentMethod"/i));
  it("does not advertise Venmo or Stripe", () => expect(html).not.toMatch(/Venmo|Stripe/i));
  it("provides the approved four-stage progress and clean payment boundary", () => {
    expect(html).toContain("Registration progress");
    expect(html).toContain("Team Info");
    expect(html).toContain("Continue to Payment");
    expect(html).toContain("Secure payment through Square");
    expect(html).not.toMatch(/Visa|Mastercard|American Express|Discover|Apple Pay/i);
  });
  it("moves tournament data into one condensed header", () => {
    const operations = operationsBySlug[tournaments[0].slug];
    expect(html).toContain("Early Registration Deadline");
    expect(html).toContain(operations.earlyRegistrationDeadline);
    expect(html).toContain("Estimated Safe Light");
    expect(html).toContain(operations.safeLight.time);
    expect(html).toContain(operations.safeLight.officialSunrise);
    expect(html).toContain('data-icon-src="/icons/calendar-deadline.svg"');
    expect(html).toContain('data-icon-src="/icons/sun-safe-light.svg"');
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(2);
  });
  it("removes verbose registration-page information blocks", () => {
    expect(html).not.toContain("Tournament-morning registration");
    expect(html).not.toContain("Updated ");
    expect(html).not.toContain(tournaments[0].statusMessage);
    expect(html.match(/Early Registration Deadline/g)).toHaveLength(1);
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
    expect(html).toContain("Rules version 1.1; waiver version 1.0");
    expect(html).not.toContain("accurate information");
    expect(html).not.toContain("acknowledgment-rules");
  });
  it("keeps tournament selection next to registration type and uses current participation names", () => {
    expect(html.indexOf("Tournament Selection")).toBeLessThan(html.indexOf("Registration Type"));
    expect(html).toContain("Team");
    expect(html).toContain("Individual / Solo");
    expect(html).not.toMatch(/Co-Angler/i);
  });
  it("shows team-only fields only for team registration", () => {
    const teamHtml = renderToStaticMarkup(<RegistrationForm operationsBySlug={operationsBySlug} policyVersions={POLICY_VERSIONS} initialRegistrationType="team" />);
    expect(html).not.toContain("Team Details — Angler 2");
    expect(teamHtml).toContain("Team Details — Angler 2");
    expect(teamHtml).toContain('name="angler2.firstName"');
  });
  it("blocks invalid registration and stale policy versions before payment review", () => {
    expect(validateOnlineRegistrationRequest(validRequest({ anglers: [] }), NOW)).toContain("Solo registration requires 1 angler.");
    expect(validateOnlineRegistrationRequest(validRequest({ acknowledgment: { ...validRequest().acknowledgment, rulesVersion: "0.9" } }), NOW)).toContain("Review and accept the current Official Tournament Rules.");
  });
  it("shows the compact authoritative-price summary without cash", () => {
    expect(html).toContain("Subtotal");
    expect(html).toContain("Card Processing Fee (3%)");
    expect(html).toContain("Final Total");
    expect(html).not.toMatch(/cash/i);
  });
});
