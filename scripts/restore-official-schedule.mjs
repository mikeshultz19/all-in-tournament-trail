import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

/*
|--------------------------------------------------------------------------
| Resolve project folders
|--------------------------------------------------------------------------
*/

const currentFile = fileURLToPath(import.meta.url);
const scriptsDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(scriptsDirectory, "..");

const envFile = path.join(projectRoot, ".env.local");
const lakeImagesDirectory = path.join(
  projectRoot,
  "public",
  "images",
  "lakes",
);

/*
|--------------------------------------------------------------------------
| Load .env.local
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(envFile)) {
  throw new Error(`Could not find .env.local at:\n${envFile}`);
}

const envContents = fs.readFileSync(envFile, "utf8");

for (const rawLine of envContents.split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) {
    continue;
  }

  const equalsIndex = line.indexOf("=");

  if (equalsIndex === -1) {
    continue;
  }

  const key = line.slice(0, equalsIndex).trim();
  let value = line.slice(equalsIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  process.env[key] = value;
}

/*
|--------------------------------------------------------------------------
| Supabase admin connection
|--------------------------------------------------------------------------
*/

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is missing from .env.local.",
  );
}

if (!supabaseKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.",
  );
}

if (!supabaseKey.startsWith("sb_secret_")) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY does not appear to be a Supabase secret key.",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

console.log("Private Supabase admin key loaded: true");

/*
|--------------------------------------------------------------------------
| Locate existing lake pictures
|--------------------------------------------------------------------------
*/

if (!fs.existsSync(lakeImagesDirectory)) {
  throw new Error(
    `Could not find the lake-images folder:\n${lakeImagesDirectory}`,
  );
}

const imageFiles = fs
  .readdirSync(lakeImagesDirectory)
  .filter((filename) =>
    /\.(jpg|jpeg|jfif|png|webp)$/i.test(filename),
  );

if (imageFiles.length === 0) {
  throw new Error(
    `No supported images were found in:\n${lakeImagesDirectory}`,
  );
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]/g, "");
}

function findLakeImage(lakeName) {
  const normalizedLake = normalizeName(lakeName);

  const exactMatch = imageFiles.find(
    (filename) => normalizeName(filename) === normalizedLake,
  );

  if (exactMatch) {
    return `/images/lakes/${exactMatch}`;
  }

  const partialMatch = imageFiles.find((filename) => {
    const normalizedFile = normalizeName(filename);

    return (
      normalizedFile.includes(normalizedLake) ||
      normalizedLake.includes(normalizedFile)
    );
  });

  if (partialMatch) {
    return `/images/lakes/${partialMatch}`;
  }

  throw new Error(
    [
      `No matching image was found for "${lakeName}".`,
      "",
      "Available lake images:",
      ...imageFiles.map((filename) => `- ${filename}`),
    ].join("\n"),
  );
}

/*
|--------------------------------------------------------------------------
| Official All In Tournament Trail Schedule V2
|--------------------------------------------------------------------------
*/

const officialSchedule = [
  {
    name: "Eagle Mountain",
    lake: "Eagle Mountain",
    slug: "eagle-mountain-november-2026",
    tournament_date: "2026-11-01T06:00:00-06:00",
    status: "Registration Open",
    is_featured: true,
    show_on_homepage: true,
  },
  {
    name: "Squaw Creek",
    lake: "Squaw Creek",
    slug: "squaw-creek-november-2026",
    tournament_date: "2026-11-22T06:00:00-06:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Ray Hubbard",
    lake: "Ray Hubbard",
    slug: "ray-hubbard-december-2026",
    tournament_date: "2026-12-13T06:00:00-06:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Granbury",
    lake: "Granbury",
    slug: "granbury-january-2027",
    tournament_date: "2027-01-17T06:00:00-06:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Squaw Creek",
    lake: "Squaw Creek",
    slug: "squaw-creek-february-2027",
    tournament_date: "2027-02-14T06:00:00-06:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Eagle Mountain",
    lake: "Eagle Mountain",
    slug: "eagle-mountain-march-2027",
    tournament_date: "2027-03-14T06:00:00-05:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Ray Roberts",
    lake: "Ray Roberts",
    slug: "ray-roberts-april-2027",
    tournament_date: "2027-04-25T06:00:00-05:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Tawakoni",
    lake: "Tawakoni",
    slug: "tawakoni-may-2027",
    tournament_date: "2027-05-16T06:00:00-05:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Lewisville",
    lake: "Lewisville",
    slug: "lewisville-june-2027",
    tournament_date: "2027-06-13T06:00:00-05:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
  {
    name: "Ray Roberts",
    lake: "Ray Roberts",
    slug: "ray-roberts-july-2027",
    tournament_date: "2027-07-11T06:00:00-05:00",
    status: "Registration Open",
    is_featured: false,
    show_on_homepage: false,
  },
].map((tournament) => ({
  ...tournament,
  hero_image_url: findLakeImage(tournament.lake),
  updated_by: "AITT Staff",
}));

/*
|--------------------------------------------------------------------------
| Backup helper
|--------------------------------------------------------------------------
*/

function createBackup(tournaments, results) {
  const backupDirectory = path.join(
    scriptsDirectory,
    "backups",
  );

  fs.mkdirSync(backupDirectory, {
    recursive: true,
  });

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backupFile = path.join(
    backupDirectory,
    `before-schedule-restore-${timestamp}.json`,
  );

  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        tournaments,
        tournamentResults: results,
      },
      null,
      2,
    ),
    "utf8",
  );

  return backupFile;
}

/*
|--------------------------------------------------------------------------
| Restore official schedule
|--------------------------------------------------------------------------
*/

async function main() {
  console.log("");
  console.log("Restoring official tournament schedule...");
  console.log("");

  const {
    data: existingTournaments,
    error: tournamentReadError,
  } = await supabase
    .from("tournaments")
    .select("*")
    .order("tournament_date", {
      ascending: true,
    });

  if (tournamentReadError) {
    throw new Error(
      `Could not read tournaments: ${tournamentReadError.message}`,
    );
  }

  const {
    data: existingResults,
    error: resultsReadError,
  } = await supabase
    .from("tournament_results")
    .select("*");

  if (resultsReadError) {
    throw new Error(
      `Could not read tournament results: ${resultsReadError.message}`,
    );
  }

  const backupFile = createBackup(
    existingTournaments ?? [],
    existingResults ?? [],
  );

  console.log(`Backup created:\n${backupFile}`);
  console.log("");

  /*
   * Remove homepage and featured status from all existing records.
   */

  const { error: clearFeaturedError } = await supabase
    .from("tournaments")
    .update({
      is_featured: false,
      show_on_homepage: false,
    })
    .or(
      "is_featured.eq.true,show_on_homepage.eq.true",
    );

  if (clearFeaturedError) {
    throw new Error(
      `Could not clear old featured settings: ${clearFeaturedError.message}`,
    );
  }

  /*
   * Hide the Lake Fork demo records without deleting them.
   */

  const { error: hideLakeForkError } = await supabase
    .from("tournaments")
    .update({
      status: "Registration Closed",
      is_featured: false,
      show_on_homepage: false,
      updated_by: "AITT Staff",
    })
    .ilike("lake", "%Lake Fork%");

  if (hideLakeForkError) {
    throw new Error(
      `Could not hide Lake Fork demo tournaments: ${hideLakeForkError.message}`,
    );
  }

  /*
   * Insert or update the 10 official tournaments.
   */

  const {
    data: savedTournaments,
    error: saveError,
  } = await supabase
    .from("tournaments")
    .upsert(officialSchedule, {
      onConflict: "slug",
    })
    .select(
      [
        "id",
        "name",
        "lake",
        "slug",
        "tournament_date",
        "status",
        "is_featured",
        "show_on_homepage",
        "hero_image_url",
        "updated_by",
      ].join(","),
    );

  if (saveError) {
    throw new Error(
      `Could not restore the official schedule: ${saveError.message}`,
    );
  }

  /*
   * Verify all official records.
   */

  const {
    data: verification,
    error: verificationError,
  } = await supabase
    .from("tournaments")
    .select(
      [
        "name",
        "lake",
        "slug",
        "tournament_date",
        "status",
        "is_featured",
        "show_on_homepage",
        "hero_image_url",
        "updated_by",
      ].join(","),
    )
    .in(
      "slug",
      officialSchedule.map(
        (tournament) => tournament.slug,
      ),
    )
    .order("tournament_date", {
      ascending: true,
    });

  if (verificationError) {
    throw new Error(
      `Schedule saved, but verification failed: ${verificationError.message}`,
    );
  }

  console.log(
    `Official tournaments saved: ${savedTournaments?.length ?? 0}`,
  );
  console.log("");

  for (const tournament of verification ?? []) {
    const date = tournament.tournament_date.slice(0, 10);
    const featured = tournament.is_featured
      ? " — FEATURED"
      : "";

    console.log(
      `${date} | ${tournament.lake} | ${tournament.status}${featured}`,
    );

    console.log(
      `  Image: ${tournament.hero_image_url}`,
    );
  }

  const featuredTournaments = (verification ?? []).filter(
    (tournament) =>
      tournament.is_featured === true &&
      tournament.show_on_homepage === true,
  );

  console.log("");
  console.log("Schedule restoration complete.");
  console.log(
    `Official events found: ${verification?.length ?? 0}`,
  );
  console.log(
    `Featured events found: ${featuredTournaments.length}`,
  );
  console.log(
    `Featured tournament: ${
      featuredTournaments[0]?.lake ?? "None"
    }`,
  );
  console.log("");
  console.log(
    "Lake Fork records were hidden and preserved.",
  );
  console.log(
    "No tournament-result records were deleted.",
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("Schedule restoration failed.");
  console.error("");

  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  console.error("");
  process.exitCode = 1;
});