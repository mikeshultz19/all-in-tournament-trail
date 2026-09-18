import "server-only";

import * as XLSX from "xlsx";
import JSZip from "jszip";

import type { TournamentRegistrationRosterRow } from "@/lib/tournament-registration-roster";

export const REGISTRATION_SPREADSHEET_COLUMNS = [
  "Tournament", "Registration Number", "Registration ID", "Registration Timestamp",
  "Registration Status", "Source", "Team or Solo", "Angler 1 Name", "Angler 1 Phone",
  "Angler 1 Email", "Angler 1 Membership Status", "Angler 2 Name", "Angler 2 Phone",
  "Angler 2 Email", "Angler 2 Membership Status", "Base Entry", "Bronze", "Silver",
  "Gold", "Big Bass", "Insurance", "Amount Collected", "Payment Method", "Payment Status",
  "Payment Reference", "Review Status", "Check-In Status", "Last Updated",
] as const;

type SpreadsheetOptions = {
  tournamentName: string;
  tournamentDate: string;
  exportedAt?: Date;
};

function dollars(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(2);
}

function membershipStatus(row: TournamentRegistrationRosterRow["angler1"] | null) {
  if (!row) return "";
  if (row.memberStatus === "Needs Review") return "Needs Review";
  if (row.membership === "Purchased Membership / Joining") return "New Member";
  return row.membership;
}

export function registrationSpreadsheetRows(
  rows: readonly TournamentRegistrationRosterRow[],
  options: SpreadsheetOptions,
) {
  const exportedAt = (options.exportedAt ?? new Date()).toISOString();
  return rows.map((row) => ({
    Tournament: options.tournamentName,
    "Registration Number": row.boatNumber ?? "",
    "Registration ID": row.id,
    "Registration Timestamp": row.registeredAt,
    "Registration Status": "Active",
    Source: row.registrationSource === "walk_up" ? "Walk-Up" : "Online",
    "Team or Solo": row.registrationType === "team" ? "Team" : "Solo",
    "Angler 1 Name": row.angler1.displayName,
    "Angler 1 Phone": row.angler1.phone ?? row.participantContactSnapshot[0]?.phone ?? "",
    "Angler 1 Email": row.angler1.email ?? row.participantContactSnapshot[0]?.email ?? "",
    "Angler 1 Membership Status": membershipStatus(row.angler1),
    "Angler 2 Name": row.angler2?.displayName ?? "",
    "Angler 2 Phone": row.angler2?.phone ?? row.participantContactSnapshot[1]?.phone ?? "",
    "Angler 2 Email": row.angler2?.email ?? row.participantContactSnapshot[1]?.email ?? "",
    "Angler 2 Membership Status": membershipStatus(row.angler2),
    "Base Entry": dollars(row.entryAmountCents),
    Bronze: row.memberPot === "bronze" ? dollars(row.memberPotAmountCents) : "",
    Silver: row.memberPot === "silver" ? dollars(row.memberPotAmountCents) : "",
    Gold: row.memberPot === "gold" ? dollars(row.memberPotAmountCents) : "",
    "Big Bass": row.bigBass ? dollars(row.bigBassAmountCents) : "",
    Insurance: row.insurance ? dollars(row.insuranceAmountCents) : "",
    "Amount Collected": dollars(row.totalPaidCents),
    "Payment Method": row.paymentMethod === "online" ? "Online" : row.paymentMethod ? row.paymentMethod[0].toUpperCase() + row.paymentMethod.slice(1) : "",
    "Payment Status": row.paymentStatus,
    "Payment Reference": row.paymentReference ?? "",
    "Review Status": row.needsReview ? "Needs Review" : "Resolved",
    "Check-In Status": row.checkedInAt ? "Checked In" : "Pending Check-In",
    "Last Updated": row.lastUpdated || exportedAt,
  }));
}

export async function buildRegistrationWorkbook(
  rows: readonly TournamentRegistrationRosterRow[],
  options: SpreadsheetOptions,
) {
  const workbook = XLSX.utils.book_new();
  const data = registrationSpreadsheetRows(rows, options);
  const worksheet = XLSX.utils.json_to_sheet(data, { header: [...REGISTRATION_SPREADSHEET_COLUMNS] });
  worksheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_cell({ r: data.length, c: REGISTRATION_SPREADSHEET_COLUMNS.length - 1 })}` };
  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  worksheet["!cols"] = REGISTRATION_SPREADSHEET_COLUMNS.map((column) => ({ wch: Math.min(32, Math.max(14, column.length + 2)) }));
  XLSX.utils.book_append_sheet(workbook, worksheet, "Current Registrations");
  workbook.Props = {
    Title: `${options.tournamentName} Registration Disaster-Recovery Roster`,
    Subject: `Active registration roster exported ${options.exportedAt?.toISOString() ?? new Date().toISOString()}`,
    Author: "All-In Tournament Trail",
  };
  const source = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const zip = await JSZip.loadAsync(source);
  const sheet = zip.file("xl/worksheets/sheet1.xml");
  if (sheet) {
    const xml = await sheet.async("string");
    const views = '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>';
    zip.file("xl/worksheets/sheet1.xml", xml.replace("<sheetData>", `${views}<sheetData>`));
  }
  return zip.generateAsync({ type: "nodebuffer" });
}
