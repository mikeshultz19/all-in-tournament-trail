export type PolicyDocumentName =
  | "rules"
  | "liability-waiver";

export interface PolicyDocument {
  source: string;
  version: string;
  status: string;
  effectiveDate: string;
}

function readMetadata(
  source: string,
  label: string,
  fallback: string,
): string {
  const escapedLabel = label.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const match = source.match(
    new RegExp(
      `\\*\\*${escapedLabel}:\\*\\*\\s*([^\\r\\n]+)`,
    ),
  );

  return match?.[1]?.trim() ?? fallback;
}

async function readPolicySource(
  filename: string,
): Promise<string> {
  /*
   * Local development and Next.js builds:
   * read the source document from /docs.
   */
  try {
    const { readFile } = await import(
      "node:fs/promises"
    );
    const path = await import("node:path");

    return await readFile(
      path.join(
        process.cwd(),
        "docs",
        filename,
      ),
      "utf8",
    );
  } catch {
    /*
     * Cloudflare production runtime:
     * the /docs filesystem folder is unavailable,
     * so load the public static asset instead.
     */
  }

  const { getCloudflareContext } = await import(
    "@opennextjs/cloudflare"
  );

  const { env } = await getCloudflareContext({
    async: true,
  });

  if (!env?.ASSETS) {
    throw new Error(
      `Cloudflare ASSETS binding is unavailable for ${filename}.`,
    );
  }

  const response = await env.ASSETS.fetch(
    `https://assets.local/docs/${filename}`,
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load Cloudflare asset /docs/${filename}. Status: ${response.status}`,
    );
  }

  return response.text();
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
    version: readMetadata(source, "Version", name === "rules" ? "1.10" : "1.1"),
    status: readMetadata(source, "Status", "Official"),
    effectiveDate: readMetadata(
      source,
      "Effective Date",
      name === "rules" ? "July 26, 2026" : "September 30, 2026",
    ),
  };
}
