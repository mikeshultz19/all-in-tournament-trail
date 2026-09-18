import { describe, expect, it } from "vitest";
import JSZip from "jszip";

import { buildRegistrationWorkbook, REGISTRATION_SPREADSHEET_COLUMNS, registrationSpreadsheetRows } from "@/lib/registration-spreadsheet";
import type { TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";

const row = (overrides: Partial<TournamentRegistrationRosterRow> = {}): TournamentRegistrationRosterRow => ({
  id: "registration-1", registrationKey: "AITT-1", registeredAt: "2026-09-18T12:00:00Z", lastUpdated: "2026-09-18T12:05:00Z",
  registrationPeriod: "Early Online", registrationSource: "online", boatNumber: 7, paymentMethod: "online", paymentReference: "square-reference",
  participantContactSnapshot: [{ firstName: "One", lastName: "Angler", streetAddress: "1 Main", city: "Dallas", state: "TX", zipCode: "75001", email: "one@example.test", phone: "555-1111", membership: "current" }],
  registrationType: "solo", angler1: { firstName: "One", lastName: "Angler", displayName: "One Angler", membership: "Current Member", memberStatus: "Member", eligibleForTournament: true, email: "one@example.test", phone: "555-1111" }, angler2: null,
  entryType: "Base Entry", bigBass: false, memberPot: null, insurance: false, entryAmountCents: 6000, membershipAmountCents: 0, membershipPurchaseCount: 0,
  bigBassAmountCents: 0, memberPotAmountCents: 0, insuranceAmountCents: 0, processingFeeCents: 210, totalPaidCents: 6210, paymentStatus: "Paid", needsReview: false, identityReviewStatus: "verified", checkedInAt: null, checkedInByAdminId: null,
  boater: "One Angler", partner: null, membershipStatus: "Current Member", membershipDetails: [], entryStatus: "Confirmed", sidePots: [], registrationTotalCents: 6210,
  ...overrides,
});

describe("registration disaster-recovery spreadsheet", () => {
  it("exports all supplied rows and keeps individual statuses distinct", () => {
    const team = row({ registrationType: "team", angler2: { firstName: "Two", lastName: "Angler", displayName: "Two Angler", membership: "Non-Member", memberStatus: "Needs Review", eligibleForTournament: false, email: "two@example.test", phone: "555-2222" }, participantContactSnapshot: [{ firstName: "One", lastName: "Angler", streetAddress: "1 Main", city: "Dallas", state: "TX", zipCode: "75001", email: "one@example.test", phone: "555-1111", membership: "current" }, { firstName: "Two", lastName: "Angler", streetAddress: "2 Main", city: "Dallas", state: "TX", zipCode: "75001", email: "two@example.test", phone: "555-2222", membership: "non-member" }] });
    const rows = registrationSpreadsheetRows([row(), team], { tournamentName: "Test Tournament", tournamentDate: "2026-09-20", exportedAt: new Date("2026-09-18T12:00:00Z") });
    expect(rows).toHaveLength(2);
    expect(rows[1]["Angler 1 Membership Status"]).toBe("Current Member");
    expect(rows[1]["Angler 2 Membership Status"]).toBe("Needs Review");
    expect(rows[0]["Payment Reference"]).toBe("square-reference");
    expect(JSON.stringify(rows)).not.toMatch(/card|cvv|token/i);
  });

  it("writes a readable xlsx workbook with headers, filters, and freeze metadata", async () => {
    const workbook = await buildRegistrationWorkbook([row()], { tournamentName: "Test Tournament", tournamentDate: "2026-09-20", exportedAt: new Date("2026-09-18T12:00:00Z") });
    const zip = await JSZip.loadAsync(workbook);
    const sheet = await zip.file("xl/worksheets/sheet1.xml")?.async("string");
    const table = await zip.file("xl/tables/table1.xml")?.async("string");
    const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
    expect(sheet).toContain('state="frozen"');
    expect(sheet).toContain('autoFilter ref="A1:AB2"');
    expect(sheet).toContain('customWidth="1"');
    expect(sheet).toContain('t="inlineStr"');
    expect(REGISTRATION_SPREADSHEET_COLUMNS.every((column) => sheet?.includes(`<t xml:space="preserve">${column}</t>`))).toBe(true);
    expect(table).toContain('name="CurrentRegistrations"');
    expect(table).toContain('displayName="CurrentRegistrations"');
    expect(table).toContain('ref="A1:AB2"');
    expect(workbookXml).toContain('name="Current Registrations"');
    expect(await zip.file("xl/styles.xml")?.async("string")).toContain('cellXfs count="2"');
  });
});
