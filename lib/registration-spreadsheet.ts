import "server-only";

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number) {
  let value = "";
  for (let current = index + 1; current > 0; current = Math.floor((current - 1) / 26)) {
    value = String.fromCharCode(65 + ((current - 1) % 26)) + value;
  }
  return value;
}

function cellXml(reference: string, value: string, style = 0) {
  return `<c r="${reference}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function workbookXml(rowCount: number, columnCount: number) {
  const lastCell = `${columnName(columnCount - 1)}${rowCount + 1}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetPr><outlinePr summaryBelow="1" summaryRight="1"/><pageSetUpPr/></sheetPr>
  <dimension ref="A1:${lastCell}"/>
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>${REGISTRATION_SPREADSHEET_COLUMNS.map((column, index) => `<col min="${index + 1}" max="${index + 1}" width="${Math.min(32, Math.max(14, column.length + 2))}" customWidth="1"/>`).join("")}</cols>
  <sheetData>{{ROWS}}</sheetData>
  <autoFilter ref="A1:${lastCell}"/>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
  <tableParts count="1"><tablePart xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/></tableParts>
</worksheet>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="0"/><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleMedium9"/>
</styleSheet>`;
}

export async function buildRegistrationWorkbook(
  rows: readonly TournamentRegistrationRosterRow[],
  options: SpreadsheetOptions,
) {
  const data = registrationSpreadsheetRows(rows, options);
  const rowsXml = [
    `<row r="1">${REGISTRATION_SPREADSHEET_COLUMNS.map((column, index) => cellXml(`${columnName(index)}1`, column, 1)).join("")}</row>`,
    ...data.map((item, rowIndex) => `<row r="${rowIndex + 2}">${REGISTRATION_SPREADSHEET_COLUMNS.map((column, columnIndex) => cellXml(`${columnName(columnIndex)}${rowIndex + 2}`, String(item[column] ?? ""))).join("")}</row>`),
  ].join("");
  const sheetXml = workbookXml(data.length, REGISTRATION_SPREADSHEET_COLUMNS.length).replace("{{ROWS}}", rowsXml);
  const lastRow = data.length + 1;
  const lastColumn = columnName(REGISTRATION_SPREADSHEET_COLUMNS.length - 1);
  const exportedAt = (options.exportedAt ?? new Date()).toISOString();
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/tables/table1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  zip.file("xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><fileVersion appName="xl"/><bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews><sheets><sheet name="Current Registrations" sheetId="1" r:id="rId1"/></sheets></workbook>`);
  zip.file("xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file("xl/worksheets/sheet1.xml", sheetXml);
  zip.file("xl/worksheets/_rels/sheet1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target="../tables/table1.xml"/></Relationships>`);
  zip.file("xl/tables/table1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="CurrentRegistrations" displayName="CurrentRegistrations" ref="A1:${lastColumn}${lastRow}" totalsRowShown="0"><autoFilter ref="A1:${lastColumn}${lastRow}"/><tableColumns count="${REGISTRATION_SPREADSHEET_COLUMNS.length}">${REGISTRATION_SPREADSHEET_COLUMNS.map((column, index) => `<tableColumn id="${index + 1}" name="${escapeXml(column)}"/>`).join("")}</tableColumns><tableStyleInfo name="TableStyleMedium2" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/></table>`);
  zip.file("xl/styles.xml", stylesXml());
  zip.file("docProps/core.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escapeXml(`${options.tournamentName} Registration Disaster-Recovery Roster`)}</dc:title><dc:subject>${escapeXml(`Active registration roster exported ${exportedAt}`)}</dc:subject><dc:creator>All-In Tournament Trail</dc:creator><cp:lastModifiedBy>All-In Tournament Trail</cp:lastModifiedBy></cp:coreProperties>`);
  zip.file("docProps/app.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>All-In Tournament Trail</Application><HeadingPairs/><TitlesOfParts><vt:vector xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes" size="1" baseType="lpstr"><vt:lpstr>Current Registrations</vt:lpstr></vt:vector></TitlesOfParts></Properties>`);
  return zip.generateAsync({ type: "nodebuffer" });
}
