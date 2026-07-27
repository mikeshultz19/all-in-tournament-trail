import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

/*
|--------------------------------------------------------------------------
| Load .env.local
|--------------------------------------------------------------------------
*/

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(currentDirectory, "..");
const envFile = path.join(projectRoot, ".env.local");

if (!fs.existsSync(envFile)) {
  throw new Error(
    `Could not find .env.local at:\n${envFile}`,
  );
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

  if (!process.env[key]) {
    process.env[key] = value;
  }
}

/*
|--------------------------------------------------------------------------
| Supabase connection
|--------------------------------------------------------------------------
*/

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const supabaseKey =
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL is missing from .env.local.",
  );
}

if (!supabaseKey) {
  throw new Error(
    "SUPABASE_ANON_KEY is missing from .env.local.",
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  },
);

/*
|--------------------------------------------------------------------------
| Separate completed demo tournament
|--------------------------------------------------------------------------
*/

const demoTournament = {
  name: "Preseason Demo Tournament",
  slug: "preseason-demo-results",
  lake: "Lake Worth",
  tournament_date: "2026-06-28T05:00:00-05:00",
  ramp: "Lake Worth Boat Ramp",
  status: "Results Published",
  registration_opens: "2026-05-01T08:00:00-05:00",
  registration_closes: "2026-06-27T21:00:00-05:00",
  morning_registration: "05:00",
  capacity: 60,
  description:
    "Completed demo tournament used to test dynamic Winners Circle data.",
  hero_image_url:
    "/images/results/overall-winner.jpg",
  is_featured: false,
  show_on_homepage: false,
  updated_by: "WINNERS CIRCLE DEMO",
};

/*
|--------------------------------------------------------------------------
| Twenty final standings
|--------------------------------------------------------------------------
*/

const finalStandings = [
  {
    kind: "final",
    place: 1,
    team: "Carter / Reynolds",
    weight: 24.87,
    baseWinnings: 5000,
  },
  {
    kind: "final",
    place: 2,
    team: "Bennett / Hayes",
    weight: 23.94,
    baseWinnings: 2500,
  },
  {
    kind: "final",
    place: 3,
    team: "Walker / Collins",
    weight: 23.41,
    baseWinnings: 1750,
  },
  {
    kind: "final",
    place: 4,
    team: "Turner / Brooks",
    weight: 22.88,
    baseWinnings: 1250,
  },
  {
    kind: "final",
    place: 5,
    team: "Davis / Morgan",
    weight: 22.36,
    baseWinnings: 1000,
  },
  {
    kind: "final",
    place: 6,
    team: "Parker / Reed",
    weight: 21.97,
    baseWinnings: 850,
  },
  {
    kind: "final",
    place: 7,
    team: "Mitchell / Foster",
    weight: 21.61,
    baseWinnings: 750,
  },
  {
    kind: "final",
    place: 8,
    team: "Harris / Cooper",
    weight: 21.22,
    baseWinnings: 650,
  },
  {
    kind: "final",
    place: 9,
    team: "Sullivan / Price",
    weight: 20.89,
    baseWinnings: 550,
  },
  {
    kind: "final",
    place: 10,
    team: "Edwards / Griffin",
    weight: 20.47,
    baseWinnings: 500,
  },
  {
    kind: "final",
    place: 11,
    team: "Roberts / Bailey",
    weight: 20.14,
    baseWinnings: 450,
  },
  {
    kind: "final",
    place: 12,
    team: "Phillips / Ward",
    weight: 19.86,
    baseWinnings: 400,
  },
  {
    kind: "final",
    place: 13,
    team: "Thompson / Russell",
    weight: 19.55,
    baseWinnings: 350,
  },
  {
    kind: "final",
    place: 14,
    team: "Anderson / Perry",
    weight: 19.21,
    baseWinnings: 300,
  },
  {
    kind: "final",
    place: 15,
    team: "Campbell / Long",
    weight: 18.96,
    baseWinnings: 250,
  },
  {
    kind: "final",
    place: 16,
    team: "Murphy / Powell",
    weight: 18.63,
    baseWinnings: 0,
  },
  {
    kind: "final",
    place: 17,
    team: "Richardson / Hughes",
    weight: 18.27,
    baseWinnings: 0,
  },
  {
    kind: "final",
    place: 18,
    team: "Peterson / Bryant",
    weight: 17.91,
    baseWinnings: 0,
  },
  {
    kind: "final",
    place: 19,
    team: "Simmons / Jenkins",
    weight: 17.54,
    baseWinnings: 0,
  },
  {
    kind: "final",
    place: 20,
    team: "Coleman / Fisher",
    weight: 17.18,
    baseWinnings: 0,
  },

  {
    kind: "sidePot",
    sidePot: "bronze",
    sidePotPlacement: 1,
    place: 1,
    team: "Walker / Collins",
    weight: 23.41,
    sidePotWeight: 23.41,
    sidePotPayout: 900,
  },
  {
    kind: "sidePot",
    sidePot: "bronze",
    sidePotPlacement: 2,
    place: 2,
    team: "Turner / Brooks",
    weight: 22.88,
    sidePotWeight: 22.88,
    sidePotPayout: 450,
  },
  {
    kind: "sidePot",
    sidePot: "silver",
    sidePotPlacement: 1,
    place: 1,
    team: "Carter / Reynolds",
    weight: 24.87,
    sidePotWeight: 24.87,
    sidePotPayout: 1500,
  },
  {
    kind: "sidePot",
    sidePot: "silver",
    sidePotPlacement: 2,
    place: 2,
    team: "Bennett / Hayes",
    weight: 23.94,
    sidePotWeight: 23.94,
    sidePotPayout: 750,
  },
  {
    kind: "sidePot",
    sidePot: "gold",
    sidePotPlacement: 1,
    place: 1,
    team: "Carter / Reynolds",
    weight: 24.87,
    sidePotWeight: 24.87,
    sidePotPayout: 2000,
  },
  {
    kind: "sidePot",
    sidePot: "gold",
    sidePotPlacement: 2,
    place: 2,
    team: "Parker / Reed",
    weight: 21.97,
    sidePotWeight: 21.97,
    sidePotPayout: 1000,
  },
];

/*
|--------------------------------------------------------------------------
| Save demo tournament and results
|--------------------------------------------------------------------------
*/

async function main() {
  console.log(
    "\nAdding separate Winners Circle demo data...\n",
  );

  const {
    data: tournament,
    error: tournamentError,
  } = await supabase
    .from("tournaments")
    .upsert(demoTournament, {
      onConflict: "slug",
    })
    .select("id, name, slug, status")
    .single();

  if (tournamentError) {
    throw new Error(
      `Could not save the demo tournament: ${tournamentError.message}`,
    );
  }

  const { error: resultsError } = await supabase
    .from("tournament_results")
    .upsert(
      {
        tournament_id: tournament.id,
        entries: finalStandings,
        total_payout: 16500,
        bronze_payout: 1350,
        silver_payout: 2250,
        gold_payout: 3000,
        insurance_pot_payout: 1250,
        big_bass_payout: 650,
        big_bass_angler: "Dylan Carter",
        big_bass_team: "Carter / Reynolds",
        big_bass_weight: 8.91,
        champion_image_url:
          "/images/results/overall-winner.jpg",
        big_bass_image_url:
          "/images/results/big-bass.jpg",
        published_at: new Date().toISOString(),
      },
      {
        onConflict: "tournament_id",
      },
    );

  if (resultsError) {
    throw new Error(
      `Could not save the demo results: ${resultsError.message}`,
    );
  }

  const {
    data: savedResults,
    error: verificationError,
  } = await supabase
    .from("tournament_results")
    .select("entries")
    .eq("tournament_id", tournament.id)
    .single();

  if (verificationError) {
    throw new Error(
      `Results were saved, but verification failed: ${verificationError.message}`,
    );
  }

  const savedEntries = Array.isArray(
    savedResults.entries,
  )
    ? savedResults.entries
    : [];

  const finalCount = savedEntries.filter(
    (entry) => entry?.kind === "final",
  ).length;

  const sidePotCount = savedEntries.filter(
    (entry) => entry?.kind === "sidePot",
  ).length;

  console.log(
    "Winners Circle demo added successfully.\n",
  );
  console.log(`Tournament: ${tournament.name}`);
  console.log(`Status: ${tournament.status}`);
  console.log(`Final standings: ${finalCount}`);
  console.log(`Side-pot rows: ${sidePotCount}`);
  console.log("\nEagle Mountain was not modified.");
  console.log(
    "Refresh the homepage using Ctrl + Shift + R.\n",
  );
}

main().catch((error) => {
  console.error("\nWinners Circle demo failed.\n");
  console.error(
    error instanceof Error ? error.message : error,
  );
  console.error("");
  process.exitCode = 1;
});