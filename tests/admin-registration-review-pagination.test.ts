import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  filterTournamentRegistrationRosterRows,
  paginateTournamentRegistrationRosterRows,
  type TournamentRegistrationRosterRow,
} from "@/lib/tournament-registration-roster";

function row(id: number, overrides: Partial<TournamentRegistrationRosterRow> = {}): TournamentRegistrationRosterRow {
  return {
    id: `row-${id}`,
    registrationKey: `reg-${id}`,
    registeredAt: `2026-08-23T00:${String(id).padStart(2, "0")}:00.000Z`,
    registrationPeriod: "Early Online",
    registrationSource: "online",
    boatNumber: id,
    paymentMethod: "cash",
    participantContactSnapshot: [],
    registrationType: "solo",
    angler1: {
      firstName: "Alex",
      lastName: `Row${id}`,
      displayName: `Alex Row${id}`,
      membership: "Current Member",
      memberStatus: "Member",
      eligibleForTournament: true,
      email: `alex${id}@example.com`,
      phone: "555-0000",
    },
    angler2: null,
    entryType: "Base Entry",
    bigBass: false,
    memberPot: null,
    insurance: false,
    entryAmountCents: 0,
    membershipAmountCents: 0,
    bigBassAmountCents: 0,
    memberPotAmountCents: 0,
    insuranceAmountCents: 0,
    processingFeeCents: 0,
    totalPaidCents: 0,
    paymentStatus: "Paid",
    needsReview: false,
    identityReviewStatus: "cleared",
    checkedInAt: null,
    checkedInByAdminId: null,
    boater: `Alex Row${id}`,
    partner: null,
    membershipStatus: "Member",
    membershipDetails: ["Angler 1: Current Member"],
    entryStatus: "Confirmed",
    sidePots: [],
    registrationTotalCents: 0,
    ...overrides,
  };
}

describe("registration review pagination", () => {
  it("shows one page at 25 when the roster has 21 records", () => {
    const rows = Array.from({ length: 21 }, (_, index) => row(index + 1));
    const view = paginateTournamentRegistrationRosterRows(rows, 1, 25);

    expect(view.totalPages).toBe(1);
    expect(view.pageRows).toHaveLength(21);
    expect(view.rangeStart).toBe(1);
    expect(view.rangeEnd).toBe(21);
  });

  it("shows page 2 when more than 25 records exist", () => {
    const rows = Array.from({ length: 26 }, (_, index) => row(index + 1));
    const firstPage = paginateTournamentRegistrationRosterRows(rows, 1, 25);
    const secondPage = paginateTournamentRegistrationRosterRows(rows, 2, 25);

    expect(firstPage.pageRows).toHaveLength(25);
    expect(secondPage.currentPage).toBe(2);
    expect(secondPage.pageRows).toHaveLength(1);
    expect(secondPage.pageRows[0]?.id).toBe("row-26");
    expect(secondPage.rangeStart).toBe(26);
    expect(secondPage.rangeEnd).toBe(26);
  });

  it("filters and searches across the full roster before paginating", () => {
    const rows = Array.from({ length: 30 }, (_, index) =>
      row(index + 1, index === 26 ? { angler1: { ...row(index + 1).angler1, displayName: "Target Angler" } } : {}),
    );
    const filtered = filterTournamentRegistrationRosterRows(rows, "all", "Target");
    const view = paginateTournamentRegistrationRosterRows(filtered, 1, 25);

    expect(filtered).toHaveLength(1);
    expect(view.pageRows).toHaveLength(1);
    expect(view.pageRows[0]?.angler1.displayName).toBe("Target Angler");
  });

  it("resets to page 1 when page size changes in the toolbar wiring", () => {
    const toolbar = readFileSync(
      "components/admin/RegistrationRosterToolbar.tsx",
      "utf8",
    );

    expect(toolbar).toContain("nextPage: 1");
    expect(toolbar).toContain("nextPageSize");
    expect(toolbar).toContain('router.replace(href({ nextSearch: searchText, nextPage: 1 })');
    expect(toolbar).toContain('router.replace(href({ nextFilter, nextPage: 1 })');
    expect(toolbar).toContain('router.replace(href({ nextPageSize, nextPage: 1 })');
  });

  it("keeps print and CSV on the full filtered roster instead of the visible page", () => {
    const exportRoute = readFileSync(
      "app/admin/registration-review/export/route.ts",
      "utf8",
    );
    const printPage = readFileSync(
      "app/admin/registration-review/print/page.tsx",
      "utf8",
    );

    expect(exportRoute).toContain("filterTournamentRegistrationRosterRows");
    expect(printPage).toContain("filterTournamentRegistrationRosterRows");
    expect(exportRoute).not.toContain("paginateTournamentRegistrationRosterRows");
    expect(printPage).not.toContain("paginateTournamentRegistrationRosterRows");
    expect(exportRoute).not.toContain("pageSize");
    expect(printPage).not.toContain("pageSize");
  });

  it("renames Remaining Check-Ins to Check-Ins and filters unchecked rows", () => {
    const toolbar = readFileSync(
      "components/admin/RegistrationRosterToolbar.tsx",
      "utf8",
    );
    const rows = [
      row(1, { checkedInAt: null }),
      row(2, { checkedInAt: "2026-08-23T00:10:00.000Z" }),
    ];

    expect(toolbar).toContain("Walk-Ups");
    expect(toolbar).toContain("Check-Ins");
    expect(toolbar.indexOf("Walk-Ups")).toBeLessThan(toolbar.indexOf("Check-Ins"));
    expect(toolbar).toContain('selectFilter("check_ins")');
    expect(filterTournamentRegistrationRosterRows(rows, "check_ins", "")).toHaveLength(1);
    expect(filterTournamentRegistrationRosterRows(rows, "check_ins", "")[0]?.id).toBe("row-1");
  });
});
