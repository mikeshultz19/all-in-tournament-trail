export interface WeighfishCsvRow {
  [header: string]: string;
}

export interface WeighfishParseResult {
  valid: boolean;
  headers: string[];
  rows: WeighfishCsvRow[];
  errors: string[];
}

export interface WeighfishParserOptions {
  requiredHeaders?: readonly string[];
}

function normalizeHeader(value: string): string {
  return value.trim().toLocaleLowerCase();
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
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      record.push(cell);
      if (record.some((value) => value.trim().length > 0)) records.push(record);
      record = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (quoted) errors.push("The CSV contains an unclosed quoted value.");

  record.push(cell);
  if (record.some((value) => value.trim().length > 0)) records.push(record);

  return { records, errors };
}

export function parseWeighfishCsv(
  csv: string,
  options: WeighfishParserOptions = {},
): WeighfishParseResult {
  const source = csv.replace(/^\uFEFF/, "");
  const { records, errors } = parseCsvCells(source);

  if (records.length === 0) {
    return {
      valid: false,
      headers: [],
      rows: [],
      errors: ["The CSV is empty."],
    };
  }

  const headers = records[0].map((header) => header.trim());
  const normalizedHeaders = headers.map(normalizeHeader);

  if (headers.some((header) => !header)) {
    errors.push("Every CSV column must have a header.");
  }

  const duplicateHeaders = normalizedHeaders.filter(
    (header, index) => normalizedHeaders.indexOf(header) !== index,
  );
  if (duplicateHeaders.length > 0) {
    errors.push("The CSV contains duplicate column headers.");
  }

  const missingHeaders = (options.requiredHeaders ?? []).filter(
    (required) => !normalizedHeaders.includes(normalizeHeader(required)),
  );
  if (missingHeaders.length > 0) {
    errors.push(`Missing required columns: ${missingHeaders.join(", ")}.`);
  }

  const rows: WeighfishCsvRow[] = [];
  records.slice(1).forEach((values, index) => {
    if (values.length !== headers.length) {
      errors.push(
        `Row ${index + 2} has ${values.length} columns; expected ${headers.length}.`,
      );
      return;
    }

    rows.push(
      Object.fromEntries(
        headers.map((header, headerIndex) => [
          header,
          values[headerIndex].trim(),
        ]),
      ),
    );
  });

  if (rows.length === 0) {
    errors.push("The CSV does not contain any result rows.");
  }

  return {
    valid: errors.length === 0,
    headers,
    rows,
    errors,
  };
}
