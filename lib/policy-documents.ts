import { readFile } from "node:fs/promises";
import path from "node:path";

export type PolicyDocumentName = "rules" | "liability-waiver";

export interface PolicyDocument {
  source: string;
  version: string;
  status: string;
  effectiveDate: string;
}

function readMetadata(source: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`\\*\\*${escapedLabel}:\\*\\*\\s*([^\\r\\n]+)`));

  if (!match?.[1]) {
    throw new Error(`Policy document is missing ${label} metadata.`);
  }

  return match[1].trim();
}

export async function loadPolicyDocument(name: PolicyDocumentName): Promise<PolicyDocument> {
  const documentPath = name === "rules"
    ? path.join(process.cwd(), "docs", "TOURNAMENT_RULES.md")
    : path.join(process.cwd(), "docs", "LIABILITY_WAIVER.md");
  const source = await readFile(documentPath, "utf8");

  return {
    source,
    version: readMetadata(source, "Version"),
    status: readMetadata(source, "Status"),
    effectiveDate: readMetadata(source, "Effective Date"),
  };
}
