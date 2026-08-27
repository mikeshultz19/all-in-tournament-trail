export type WeighfishRosterEntry = {
  id: string;
  boatNumber: number | null;
  registrationType: "team" | "solo";
  angler1Name: string;
  angler2Name: string | null;
};

export type WeighfishImportedEntry = {
  id: string;
  place: number | null;
  teamName: string;
  registrationId: string | null;
};

export type WeighfishMatchCandidate = WeighfishRosterEntry & {
  displayName: string;
};

export type WeighfishReconciliationRow = {
  resultId: string;
  place: number | null;
  importedName: string;
  outcome: "auto" | "manual" | "unmatched";
  registrationId: string | null;
  fuzzy: boolean;
  reason: string;
  candidates: WeighfishMatchCandidate[];
};

export type WeighfishReconciliation = {
  activeEntryCount: number;
  importedResultCount: number;
  autoMatchedCount: number;
  manuallyMatchedCount: number;
  missingResults: WeighfishMatchCandidate[];
  unmatchedImports: WeighfishReconciliationRow[];
  unresolvedRows: WeighfishReconciliationRow[];
  duplicateRows: WeighfishReconciliationRow[];
  rows: WeighfishReconciliationRow[];
  ready: boolean;
};

export function normalizeWeighfishName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function displayName(entry: WeighfishRosterEntry): string {
  return entry.registrationType === "team" && entry.angler2Name
    ? `${entry.angler1Name} / ${entry.angler2Name}`
    : entry.angler1Name;
}

function asCandidate(entry: WeighfishRosterEntry): WeighfishMatchCandidate {
  return { ...entry, displayName: displayName(entry) };
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = previous[0];
    previous[0] = leftIndex;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const above = previous[rightIndex];
      previous[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + 1,
        diagonal + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return previous[right.length];
}

function splitImportedTeam(value: string): string[] {
  return value
    .split(/\s*(?:\/|&|\+|\band\b)\s*/i)
    .map(normalizeWeighfishName)
    .filter(Boolean);
}

type Score = { entry: WeighfishRosterEntry; exact: boolean; strong: boolean; plausible: boolean; distance: number };

function scoreCandidate(importedName: string, entry: WeighfishRosterEntry): Score {
  const importedParts = splitImportedTeam(importedName);
  const rosterParts = [normalizeWeighfishName(entry.angler1Name)];
  if (entry.registrationType === "team" && entry.angler2Name) rosterParts.push(normalizeWeighfishName(entry.angler2Name));

  if (entry.registrationType === "solo") {
    if (importedParts.length !== 1) return { entry, exact: false, strong: false, plausible: false, distance: 99 };
    const distance = editDistance(importedParts[0], rosterParts[0]);
    const longest = Math.max(importedParts[0].length, rosterParts[0].length);
    return {
      entry,
      distance,
      exact: distance === 0,
      strong: distance === 0 || (longest >= 5 && distance === 1),
      plausible: distance <= Math.max(2, Math.floor(longest * 0.22)),
    };
  }

  if (importedParts.length !== 2 || rosterParts.length !== 2) {
    const hasExactPart = importedParts.some((part) => rosterParts.includes(part));
    return { entry, exact: false, strong: false, plausible: hasExactPart, distance: hasExactPart ? 4 : 99 };
  }
  const distances = importedParts.map((part, index) => editDistance(part, rosterParts[index]));
  const exact = distances.every((distance) => distance === 0);
  const strong = distances.every((distance, index) => {
    const longest = Math.max(importedParts[index].length, rosterParts[index].length);
    return distance === 0 || (longest >= 5 && distance === 1);
  });
  const plausible = distances.every((distance, index) => {
    const longest = Math.max(importedParts[index].length, rosterParts[index].length);
    return distance <= Math.max(2, Math.floor(longest * 0.22));
  }) || distances.some((distance) => distance === 0);
  return { entry, exact, strong, plausible, distance: distances.reduce((sum, value) => sum + value, 0) };
}

export function reconcileWeighfishResults(input: {
  roster: readonly WeighfishRosterEntry[];
  results: readonly WeighfishImportedEntry[];
}): WeighfishReconciliation {
  const rosterById = new Map(input.roster.map((entry) => [entry.id, entry]));
  const rows: WeighfishReconciliationRow[] = input.results.map((result) => {
    if (result.registrationId && rosterById.has(result.registrationId)) {
      return { resultId: result.id, place: result.place, importedName: result.teamName, outcome: "auto", registrationId: result.registrationId, fuzzy: false, reason: "Roster registration confirmed.", candidates: [asCandidate(rosterById.get(result.registrationId)!)] };
    }
    const scores = input.roster.map((entry) => scoreCandidate(result.teamName, entry));
    const exact = scores.filter((score) => score.exact);
    const strong = scores.filter((score) => score.strong).sort((a, b) => a.distance - b.distance);
    const plausible = scores.filter((score) => score.plausible).sort((a, b) => a.distance - b.distance);
    const uniqueStrong = strong.length === 1 && (plausible[1]?.distance ?? 99) > strong[0].distance + 1;
    if (exact.length === 1 || uniqueStrong) {
      const winner = exact[0] ?? strong[0];
      return { resultId: result.id, place: result.place, importedName: result.teamName, outcome: "auto", registrationId: winner.entry.id, fuzzy: !winner.exact, reason: winner.exact ? "Exact normalized roster match." : "Unique high-confidence roster match.", candidates: [asCandidate(winner.entry)] };
    }
    if (plausible.length) {
      return { resultId: result.id, place: result.place, importedName: result.teamName, outcome: "manual", registrationId: null, fuzzy: false, reason: exact.length > 1 || strong.length > 1 ? "Multiple roster entries are similarly plausible." : "The imported identity needs Tournament Director confirmation.", candidates: plausible.slice(0, 5).map(({ entry }) => asCandidate(entry)) };
    }
    return { resultId: result.id, place: result.place, importedName: result.teamName, outcome: "unmatched", registrationId: null, fuzzy: false, reason: "No viable active AITT roster registration was found.", candidates: [] };
  });

  const byOwner = new Map<string, WeighfishReconciliationRow[]>();
  for (const row of rows) if (row.registrationId) byOwner.set(row.registrationId, [...(byOwner.get(row.registrationId) ?? []), row]);
  const duplicateRows: WeighfishReconciliationRow[] = [];
  for (const ownedRows of byOwner.values()) {
    if (ownedRows.length < 2) continue;
    for (const row of ownedRows) {
      row.outcome = "manual";
      row.reason = "This registration is assigned to more than one imported result.";
      duplicateRows.push(row);
    }
  }
  const ownedIds = new Set(rows.filter((row) => row.registrationId && !duplicateRows.includes(row)).map((row) => row.registrationId!));
  const missingResults = input.roster.filter((entry) => !ownedIds.has(entry.id)).map(asCandidate);
  const unresolvedRows = rows.filter((row) => row.outcome !== "auto");
  const unmatchedImports = rows.filter((row) => row.outcome === "unmatched");
  const manuallyMatchedCount = input.results.filter((result) => result.registrationId && rosterById.has(result.registrationId)).length;
  const autoMatchedCount = rows.filter((row) => row.outcome === "auto").length - manuallyMatchedCount;
  return { activeEntryCount: input.roster.length, importedResultCount: input.results.length, autoMatchedCount, manuallyMatchedCount, missingResults, unmatchedImports, unresolvedRows, duplicateRows, rows, ready: !missingResults.length && !unresolvedRows.length && !duplicateRows.length };
}
