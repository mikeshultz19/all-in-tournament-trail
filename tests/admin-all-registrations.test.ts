import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  filterRegistrationHistory,
  type AdminRegistrationHistoryRow,
} from "@/lib/admin-registration-history";

const rows: AdminRegistrationHistoryRow[] = [
  registration({
    id: "online-active",
    tournamentId: "tournament-a",
    tournamentName: "Lake Alpha",
    source: "online",
    angler1Name: "Taylor Testmember",
    angler2Name: "Morgan Nonmember",
    boatNumber: 17,
    contacts: [contact("Taylor", "Testmember", "taylor@example.com", "817-555-0101")],
  }),
  registration({
    id: "walkup-review",
    tournamentId: "tournament-b",
    tournamentName: "Lake Beta",
    source: "walk_up",
    status: "cancelled",
    angler1Name: "Casey Review",
    boatNumber: 42,
    contacts: [contact("Casey", "Review", "casey@example.com", "214-555-0199")],
    identityReviewStatus: "review_required",
  }),
];

describe("Admin All Registrations", () => {
  it("loads registrations without excluding cancelled history", () => {
    expect(filterRegistrationHistory(rows, {})).toEqual(rows);
    expect(filterRegistrationHistory(rows, {}).find((row) => row.status === "cancelled")).toBeTruthy();
  });

  it.each([
    ["Taylor", "online-active"],
    ["morgan", "online-active"],
    ["TAYLOR@EXAMPLE", "online-active"],
    ["214-555", "walkup-review"],
    ["42", "walkup-review"],
  ])("searches %s", (search, expectedId) => {
    expect(filterRegistrationHistory(rows, { search }).map((row) => row.id)).toEqual([expectedId]);
  });

  it("filters by tournament", () => {
    expect(filterRegistrationHistory(rows, { tournamentId: "tournament-b" })).toEqual([rows[1]]);
  });

  it("filters online and walk-up sources", () => {
    expect(filterRegistrationHistory(rows, { source: "online" })).toEqual([rows[0]]);
    expect(filterRegistrationHistory(rows, { source: "walk_up" })).toEqual([rows[1]]);
  });

  it("combines search, tournament, and source filters", () => {
    expect(filterRegistrationHistory(rows, { search: "casey@example", tournamentId: "tournament-b", source: "walk_up" })).toEqual([rows[1]]);
    expect(filterRegistrationHistory(rows, { search: "casey", tournamentId: "tournament-a", source: "walk_up" })).toEqual([]);
  });

  it("provides contact snapshots, review history, and responsive detail UI", () => {
    const page = readFileSync("app/admin/registrations/page.tsx", "utf8");
    expect(page).toContain("View Full Registration");
    expect(page).toContain("Submitted Participants");
    expect(page).toContain("contact.streetAddress");
    expect(page).toContain("Needs Attention / Review History");
    expect(page).toContain('className="mt-4 grid gap-5 lg:grid-cols-2"');
    expect(page).not.toContain("overflow-x-auto");
  });

  it("keeps Registration & Check-In tournament-specific and orders the sidebar correctly", () => {
    const operationalPage = readFileSync("app/admin/registration-review/page.tsx", "utf8");
    const sidebar = readFileSync("components/admin/AdminSidebar.tsx", "utf8");
    expect(operationalPage).toContain("getTournamentRegistrationRoster(selectedTournament.id)");
    expect(sidebar.indexOf('label: "Members"')).toBeLessThan(sidebar.indexOf('label: "All Registrations"'));
    expect(sidebar).not.toContain('label: "Registration & Check-In"');
  });
});

function contact(firstName: string, lastName: string, email: string, phone: string) {
  return { firstName, lastName, email, phone, streetAddress: "100 Test St", city: "Testville", state: "TX", zipCode: "75001", membership: "non-member" as const };
}

function registration(overrides: Partial<AdminRegistrationHistoryRow>): AdminRegistrationHistoryRow {
  return {
    id: "registration",
    registrationKey: "AITT-TEST",
    tournamentId: "tournament",
    tournamentName: "Tournament",
    tournamentDate: "2026-08-21T12:00:00Z",
    registeredAt: "2026-08-20T12:00:00Z",
    registrationType: "solo",
    source: "online",
    status: "active",
    angler1Name: "Test Angler",
    angler2Name: null,
    boatNumber: null,
    contacts: [],
    membershipSnapshot: [],
    bigBass: false,
    memberPot: null,
    insurance: false,
    paymentReference: null,
    paymentMethod: null,
    onlinePaymentState: null,
    squarePaymentId: null,
    checkedInAt: null,
    identityReviewStatus: "verified",
    reviews: [],
    ...overrides,
  };
}
