export interface WeighfishTournamentInfo {
  tournament: string;
  location: string;
  date: string;
  format: string;
  days: string;
}

export interface WeighfishStatistics {
  [label: string]: string;
}

export interface WeighfishResultRow {
  place: number | null;
  sourcePlacement: string;
  participationStatus:
    | "participated"
    | "withdrew_after_start"
    | "no_show"
    | "disqualified";
  entryName: string;
  fishCount: number;
  totalWeight: number;
  bigFishWeight: number;

  basePayout: number;
  bronzePayout: number;
  silverPayout: number;
  goldPayout: number;

  bigBassPlace: number | null;
  bigBassPayout: number;

  cashPayout: number;
  payoutBreakdown: string;
  prizeDescription: string;
  validationMessages?: string[];
}

export interface WeighfishPayoutTotals {
  base: number;
  bronze: number;
  silver: number;
  gold: number;
  bigBass: number;
  total: number;
}

export interface WeighfishParseResult {
  valid: boolean;
  headers: string[];
  rows: WeighfishResultRow[];
  errors: string[];
  warnings: string[];

  tournamentInfo: WeighfishTournamentInfo;
  statistics: WeighfishStatistics;
  payoutTotals: WeighfishPayoutTotals;
}

export interface WeighfishParserOptions {
  requiredHeaders?: readonly string[];
}

export function getWeighfishTieWarning(
  row: WeighfishResultRow,
  rows: readonly WeighfishResultRow[],
): string | null {
  if (row.place === null) return null;
  const tiedRows = rows.filter((candidate) => candidate.place === row.place);
  if (tiedRows.length < 2) return null;

  const allZeroWeight = tiedRows.every((candidate) => candidate.totalWeight === 0);
  const affectsPayout = tiedRows.some((candidate) =>
    candidate.cashPayout > 0 ||
    candidate.basePayout > 0 ||
    candidate.bronzePayout > 0 ||
    candidate.silverPayout > 0 ||
    candidate.goldPayout > 0 ||
    candidate.bigBassPayout > 0
  );
  const affectsBigBass = tiedRows.some((candidate) =>
    candidate.bigFishWeight > 0 || candidate.bigBassPlace !== null
  );
  const occursAtEnd = !rows.some((candidate) =>
    candidate.place !== null && candidate.place > row.place!
  );

  if (allZeroWeight && occursAtEnd && !affectsPayout && !affectsBigBass) {
    return null;
  }

  return `More than one entry is listed in place ${row.place}. This may represent an official tie.`;
}

const DEFAULT_REQUIRED_HEADERS = [
  "Place",
  "Angler",
  "# Fish",
  "Total Weight (lbs)",
  "Big Fish (lbs)",
  "Cash Payout",
  "Payout Breakdown",
  "Prize Description",
] as const;

function normalizeText(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeHeader(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9#]+/g, " ").trim();
}

function parseCsvCells(csv: string): {
  records: string[][];
  errors: string[];
} {
  const records: string[][] = [];
  const errors: string[] = [];

  let record: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];

    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (quoted || cell.length === 0) {
        quoted = !quoted;
      } else {
        cell += character;
      }

      continue;
    }

    if (character === "," && !quoted) {
      record.push(cell);
      cell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") {
        index += 1;
      }

      record.push(cell);

      if (record.some((value) => value.trim().length > 0)) {
        records.push(record);
      }

      record = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (quoted) {
    errors.push("The CSV contains an unclosed quoted value.");
  }

  record.push(cell);

  if (record.some((value) => value.trim().length > 0)) {
    records.push(record);
  }

  return {
    records,
    errors,
  };
}

function parseNumber(value: string | undefined): number {
  if (!value) return 0;

  const cleaned = value
    .replace(/[$,%]/g, "")
    .replace(/[^\d.-]/g, "")
    .trim();

  if (!cleaned) return 0;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNullableInteger(value: string | undefined): number | null {
  if (!value) return null;

  const match = value.match(/\d+/);
  if (!match) return null;

  const parsed = Number.parseInt(match[0], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseParticipationStatus(value: string): {
  status: WeighfishResultRow["participationStatus"] | null;
  place: number | null;
} {
  const normalized = normalizeText(value).replace(/[._-]+/g, " ");
  const place = parseNullableInteger(value);

  if (/^(dq|dqd|disqualified)$/.test(normalized)) {
    return { status: "disqualified", place };
  }
  if (/^(no show|noshow|dns|did not start)$/.test(normalized)) {
    return { status: "no_show", place };
  }
  if (/^(withdrawn|withdrew|wd|withdrew after start)$/.test(normalized)) {
    return { status: "withdrew_after_start", place };
  }
  if (place !== null) {
    return { status: "participated", place };
  }
  return { status: null, place: null };
}

function getCell(
  record: string[],
  headerIndexes: Map<string, number>,
  aliases: readonly string[],
): string {
  for (const alias of aliases) {
    const index = headerIndexes.get(normalizeHeader(alias));

    if (index !== undefined) {
      return record[index]?.trim() ?? "";
    }
  }

  return "";
}

function hasHeader(headerIndexes: Map<string, number>, aliases: readonly string[]) {
  return aliases.some((alias) => headerIndexes.has(normalizeHeader(alias)));
}

function parseSidePotColumn(record: string[], headerIndexes: Map<string, number>, aliases: readonly string[], label: string, rowNumber: number, validationMessages: string[], errors: string[]): number | null {
  if (!hasHeader(headerIndexes, aliases)) return null;
  const raw = getCell(record, headerIndexes, aliases);
  if (!raw) return 0;
  if (!/^\s*\$?\s*-?[\d,]+(?:\.\d{1,2})?\s*$/.test(raw)) {
    const message = `Result row ${rowNumber} has an invalid ${label} value: "${raw}".`;
    validationMessages.push(message);
    errors.push(message);
    return 0;
  }
  const value = parseNumber(raw);
  if (value < 0) {
    const message = `Result row ${rowNumber} has a negative ${label} value: "${raw}".`;
    validationMessages.push(message);
    errors.push(message);
    return 0;
  }
  return value;
}

function extractNamedPayout(
  payoutBreakdown: string,
  labels: readonly string[],
): number {
  if (!payoutBreakdown.trim()) return 0;

  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const patterns = [
      new RegExp(
        `${escapedLabel}\\s*[:=-]?\\s*\\$?\\s*([\\d,]+(?:\\.\\d{1,2})?)`,
        "i",
      ),
      new RegExp(
        `\\$?\\s*([\\d,]+(?:\\.\\d{1,2})?)\\s*[-–—:]?\\s*${escapedLabel}`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = payoutBreakdown.match(pattern);

      if (match?.[1]) {
        return parseNumber(match[1]);
      }
    }
  }

  return 0;
}

function extractBigBassPlace(
  payoutBreakdown: string,
  prizeDescription: string,
): number | null {
  const combined = `${payoutBreakdown} ${prizeDescription}`;

  const patterns = [
    /\bbig\s*(?:fish|bass)\s*#?\s*(1|2)\b/i,
    /\b(1st|2nd)\s+big\s*(?:fish|bass)\b/i,
    /\bbig\s*(?:fish|bass)\s+(1st|2nd)\b/i,
  ];

  for (const pattern of patterns) {
    const match = combined.match(pattern);
    if (!match?.[1]) continue;

    const value = normalizeText(match[1]);

    if (value === "1" || value === "1st") return 1;
    if (value === "2" || value === "2nd") return 2;
  }

  return null;
}

function extractBigBassPayout(
  payoutBreakdown: string,
  prizeDescription: string,
): number {
  const combined = `${payoutBreakdown} ${prizeDescription}`;

  return extractNamedPayout(combined, [
    "Big Fish 1",
    "Big Fish #1",
    "Big Bass 1",
    "Big Bass #1",
    "1st Big Fish",
    "1st Big Bass",
    "Big Fish 2",
    "Big Fish #2",
    "Big Bass 2",
    "Big Bass #2",
    "2nd Big Fish",
    "2nd Big Bass",
    "Big Fish",
    "Big Bass",
  ]);
}

function findResultsHeaderIndex(
  records: string[][],
  requiredHeaders: readonly string[],
): number {
  const normalizedRequired = requiredHeaders.map(normalizeHeader);

  return records.findIndex((record) => {
    const normalizedRecord = record.map(normalizeHeader);

    return normalizedRequired.every((required) =>
      normalizedRecord.includes(required),
    );
  });
}

function readTournamentInfo(
  records: string[][],
  resultsHeaderIndex: number,
): WeighfishTournamentInfo {
  const emptyInfo: WeighfishTournamentInfo = {
    tournament: "",
    location: "",
    date: "",
    format: "",
    days: "",
  };

  for (let index = 0; index < resultsHeaderIndex - 1; index += 1) {
    const possibleHeaders = records[index].map(normalizeHeader);

    const tournamentIndex = possibleHeaders.indexOf(
      normalizeHeader("Tournament"),
    );
    const locationIndex = possibleHeaders.indexOf(normalizeHeader("Location"));
    const dateIndex = possibleHeaders.indexOf(normalizeHeader("Date"));
    const formatIndex = possibleHeaders.indexOf(normalizeHeader("Format"));
    const daysIndex = possibleHeaders.indexOf(normalizeHeader("Days"));

    if (
      tournamentIndex === -1 ||
      locationIndex === -1 ||
      dateIndex === -1
    ) {
      continue;
    }

    const values = records[index + 1] ?? [];

    return {
      tournament: values[tournamentIndex]?.trim() ?? "",
      location: values[locationIndex]?.trim() ?? "",
      date: values[dateIndex]?.trim() ?? "",
      format:
        formatIndex >= 0 ? values[formatIndex]?.trim() ?? "" : "",
      days: daysIndex >= 0 ? values[daysIndex]?.trim() ?? "" : "",
    };
  }

  return emptyInfo;
}

function readStatistics(
  records: string[][],
  resultsHeaderIndex: number,
): WeighfishStatistics {
  const statistics: WeighfishStatistics = {};

  const statisticsHeadingIndex = records.findIndex(
    (record, index) =>
      index < resultsHeaderIndex &&
      record.some(
        (cell) => normalizeText(cell) === "tournament statistics",
      ),
  );

  if (statisticsHeadingIndex === -1) {
    return statistics;
  }

  for (
    let index = statisticsHeadingIndex + 1;
    index < resultsHeaderIndex;
    index += 1
  ) {
    const nonEmptyCells = records[index]
      .map((cell) => cell.trim())
      .filter(Boolean);

    if (nonEmptyCells.length < 2) continue;

    for (
      let cellIndex = 0;
      cellIndex < nonEmptyCells.length - 1;
      cellIndex += 2
    ) {
      const label = nonEmptyCells[cellIndex];
      const value = nonEmptyCells[cellIndex + 1];

      if (label && value) {
        statistics[label] = value;
      }
    }
  }

  return statistics;
}

function createEmptyResult(
  errors: string[],
): WeighfishParseResult {
  return {
    valid: false,
    headers: [],
    rows: [],
    errors,
    warnings: [],
    tournamentInfo: {
      tournament: "",
      location: "",
      date: "",
      format: "",
      days: "",
    },
    statistics: {},
    payoutTotals: {
      base: 0,
      bronze: 0,
      silver: 0,
      gold: 0,
      bigBass: 0,
      total: 0,
    },
  };
}

export function parseWeighfishCsv(
  csv: string,
  options: WeighfishParserOptions = {},
): WeighfishParseResult {
  const source = csv.replace(/^\uFEFF/, "");
  const { records, errors } = parseCsvCells(source);
  const warnings: string[] = [];

  if (records.length === 0) {
    return createEmptyResult(["The CSV is empty."]);
  }

  const requiredHeaders =
    options.requiredHeaders ?? DEFAULT_REQUIRED_HEADERS;

  const resultsHeaderIndex = findResultsHeaderIndex(
    records,
    requiredHeaders,
  );

  if (resultsHeaderIndex === -1) {
    return createEmptyResult([
      ...errors,
      "The WeighFish results table could not be found.",
      `Expected result columns: ${requiredHeaders.join(", ")}.`,
    ]);
  }

  const headers = records[resultsHeaderIndex].map((header) =>
    header.trim(),
  );

  const normalizedHeaders = headers.map(normalizeHeader);

  if (headers.some((header) => !header)) {
    errors.push("Every result column must have a header.");
  }

  const duplicateHeaders = normalizedHeaders.filter(
    (header, index) =>
      header && normalizedHeaders.indexOf(header) !== index,
  );

  if (duplicateHeaders.length > 0) {
    errors.push("The results table contains duplicate column headers.");
  }

  const headerIndexes = new Map<string, number>();

  normalizedHeaders.forEach((header, index) => {
    headerIndexes.set(header, index);
  });

  const rows: WeighfishResultRow[] = [];

  const resultRecords = records.slice(resultsHeaderIndex + 1);

  resultRecords.forEach((record, recordIndex) => {
    const rowNumber = recordIndex + 1;
    const validationMessages: string[] = [];
    const entryName = getCell(record, headerIndexes, [
      "Angler",
      "Team",
      "Contestant",
      "Entry",
    ]);

    const placeValue = getCell(record, headerIndexes, ["Place"]);
    const participation = parseParticipationStatus(placeValue);

    // WeighFish exports may include footer or summary rows in the first
    // column. A real result entry must always have an angler/team name.
    // Skip any row without one instead of treating it as a broken result.
    if (!entryName) {
      return;
    }

    if (!participation.status) {
      errors.push(
        `Result row ${recordIndex + 1} has an unsupported placement or participation value: "${placeValue || "(blank)"}".`,
      );
      return;
    }

    if (record.length > headers.length) {
      errors.push(
        `Result row ${recordIndex + 1} has ${record.length} columns; expected ${headers.length}.`,
      );
      return;
    }

    const payoutBreakdown = getCell(record, headerIndexes, [
      "Payout Breakdown",
    ]);

    const prizeDescription = getCell(record, headerIndexes, [
      "Prize Description",
    ]);

    const cashPayout = parseNumber(
      getCell(record, headerIndexes, ["Cash Payout"]),
    );
const basePayout = extractNamedPayout(payoutBreakdown, [
  "Main Pot",
]);
const directBronzePayout = parseSidePotColumn(record, headerIndexes, ["Bronze", "Bronze Payout", "Bronze Side Pot", "Bronze Side Pot Payout", "Side Pot 1", "Side Pot 1 Payout"], "Bronze payout", rowNumber, validationMessages, errors);
const directSilverPayout = parseSidePotColumn(record, headerIndexes, ["Silver", "Silver Payout", "Silver Side Pot", "Silver Side Pot Payout", "Side Pot 2", "Side Pot 2 Payout"], "Silver payout", rowNumber, validationMessages, errors);
const directGoldPayout = parseSidePotColumn(record, headerIndexes, ["Gold", "Gold Payout", "Gold Side Pot", "Gold Side Pot Payout", "Side Pot 3", "Side Pot 3 Payout"], "Gold payout", rowNumber, validationMessages, errors);
    const bronzePayout = directBronzePayout ?? extractNamedPayout(payoutBreakdown, [
  "Bronze",
]);

const silverPayout = directSilverPayout ?? extractNamedPayout(payoutBreakdown, [
  "Silver",
]);

const goldPayout = directGoldPayout ?? extractNamedPayout(payoutBreakdown, [
  "Gold",
]);

const bigBassPlace = extractBigBassPlace(
  payoutBreakdown,
  prizeDescription,
);

const bigBassPayout = extractBigBassPayout(
  payoutBreakdown,
  prizeDescription,
);

    rows.push({
      place: participation.place,
      sourcePlacement: placeValue,
      participationStatus: participation.status,
      entryName,
      fishCount: Math.max(
        0,
        Math.trunc(
          parseNumber(
            getCell(record, headerIndexes, [
              "# Fish",
              "Fish",
              "Fish Count",
            ]),
          ),
        ),
      ),
      totalWeight: Math.max(
        0,
        parseNumber(
          getCell(record, headerIndexes, [
            "Total Weight (lbs)",
            "Total Weight",
            "Weight",
          ]),
        ),
      ),
      bigFishWeight: Math.max(
        0,
        parseNumber(
          getCell(record, headerIndexes, [
            "Big Fish (lbs)",
            "Big Fish",
            "Big Bass",
          ]),
        ),
      ),

      // Per our finalized All-In mapping:
      // WeighFish Cash Payout = Base payout.
      basePayout,
      bronzePayout,
      silverPayout,
      goldPayout,

      bigBassPlace,
      bigBassPayout,

      cashPayout,
      payoutBreakdown,
      prizeDescription,
      validationMessages,
    });
  });

  if (rows.length === 0) {
    errors.push("The CSV does not contain any tournament result entries.");
  }

  const warnedPlaces = new Set<number>();

  for (const row of rows) {
    if (row.place === null || warnedPlaces.has(row.place)) continue;
    const warning = getWeighfishTieWarning(row, rows);
    if (warning) warnings.push(warning);
    warnedPlaces.add(row.place);
  }

  const tournamentInfo = readTournamentInfo(
    records,
    resultsHeaderIndex,
  );

  const statistics = readStatistics(records, resultsHeaderIndex);

  const payoutTotals = rows.reduce<WeighfishPayoutTotals>(
    (totals, row) => {
      totals.base += row.basePayout;
      totals.bronze += row.bronzePayout;
      totals.silver += row.silverPayout;
      totals.gold += row.goldPayout;
      totals.bigBass += row.bigBassPayout;

      return totals;
    },
    {
      base: 0,
      bronze: 0,
      silver: 0,
      gold: 0,
      bigBass: 0,
      total: 0,
    },
  );

  payoutTotals.total =
    payoutTotals.base +
    payoutTotals.bronze +
    payoutTotals.silver +
    payoutTotals.gold +
    payoutTotals.bigBass;

  return {
    valid: errors.length === 0,
    headers,
    rows,
    errors,
    warnings: [...new Set(warnings)],
    tournamentInfo,
    statistics,
    payoutTotals,
  };
}
