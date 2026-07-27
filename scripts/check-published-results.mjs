import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(
  path.dirname(currentFile),
  "..",
);

const envFile = path.join(projectRoot, ".env.local");
const envContents = fs.readFileSync(envFile, "utf8");

for (const rawLine of envContents.split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) continue;

  const equalsIndex = line.indexOf("=");

  if (equalsIndex === -1) continue;

  const key = line.slice(0, equalsIndex).trim();
  let value = line.slice(equalsIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.env[key] ??= value;
}

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabaseKey =
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_ANON_KEY is missing.",
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);

const { data: tournaments, error } = await supabase
  .from("tournaments")
  .select("*")
  .order("tournament_date", {
    ascending: true,
  });

if (error) {
  throw new Error(error.message);
}

console.log("\nTOURNAMENT DATABASE INVENTORY\n");

if (!tournaments || tournaments.length === 0) {
  console.log("No tournaments were found.");
  process.exit(0);
}

for (const tournament of tournaments) {
  console.log("----------------------------------------");
  console.log(`Name: ${tournament.name}`);
  console.log(`Lake: ${tournament.lake}`);
  console.log(`Date: ${tournament.tournament_date}`);
  console.log(`Slug: ${tournament.slug}`);
  console.log(`Status: ${tournament.status}`);

  if ("is_featured" in tournament) {
    console.log(
      `Featured: ${tournament.is_featured}`,
    );
  }

  if ("show_on_homepage" in tournament) {
    console.log(
      `Show on homepage: ${tournament.show_on_homepage}`,
    );
  }

  const { data: result, error: resultError } =
    await supabase
      .from("tournament_results")
      .select("entries, published_at")
      .eq("tournament_id", tournament.id)
      .maybeSingle();

  if (resultError) {
    console.log(
      `Results lookup error: ${resultError.message}`,
    );
    continue;
  }

  const entries = Array.isArray(result?.entries)
    ? result.entries
    : [];

  console.log(`Results record: ${result ? "Yes" : "No"}`);
  console.log(`Entries stored: ${entries.length}`);
  console.log(
    `Results published at: ${
      result?.published_at ?? "None"
    }`,
  );
}

console.log("----------------------------------------");
console.log(
  `\nTotal tournaments found: ${tournaments.length}\n`,
);