export type PolicyDocumentName = "rules" | "liability-waiver";

export interface PolicyDocument {
  source: string;
  version: string;
  status: string;
  effectiveDate: string;
}

function readMetadata(source: string, label: string): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(
    new RegExp(`\\*\\*${escapedLabel}:\\*\\*\\s*([^\\r\\n]+)`),
  );

  if (!match?.[1]) {
    throw new Error(`Policy document is missing ${label} metadata.`);
  }

  return match[1].trim();
}

async function readPolicySource(filename: string): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });

    if (env?.ASSETS) {
      const response = await env.ASSETS.fetch(
        new Request(`https://assets.local/docs/${filename}`),
      );

      if (response.ok) {
        return await response.text();
      }
    }
  } catch {
    // Cloudflare bindings are unavailable during the normal Next.js build.
  }

  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");

  return readFile(
    path.join(process.cwd(), "docs", filename),
    "utf8",
  );
}

export async function loadPolicyDocument(
  name: PolicyDocumentName,
): Promise<PolicyDocument> {
  const filename =
    name === "rules"
      ? "TOURNAMENT_RULES.md"
      : "LIABILITY_WAIVER.md";

  const source = await readPolicySource(filename);

  return {
    source,
    version: readMetadata(source, "Version"),
    status: readMetadata(source, "Status"),
    effectiveDate: readMetadata(source, "Effective Date"),
  };
}