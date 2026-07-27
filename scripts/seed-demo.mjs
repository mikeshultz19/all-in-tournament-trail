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
const envPath = path.join(projectRoot, ".env.local");

function loadEnvLocal() {
  if (!fs.existsSync(envPath)) {
    throw new Error(
      `Could not find .env.local in the project folder:\n${envPath}`,
    );
  }

  const contents = fs.readFileSync(envPath, "utf8");

  for (const rawLine of contents.split(/\r?\n/)) {
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
}

loadEnvLocal();

/*
|--------------------------------------------------------------------------
| Connect to Supabase
|--------------------------------------------------------------------------
*/

const supabaseUrl =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env.local.",
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

/*
|--------------------------------------------------------------------------
| Featured Tournament Repair
|--------------------------------------------------------------------------
|
| This restores the upcoming homepage tournament.
| It does not delete or replace other tournaments.
|
*/

const tournamentSlug = "eagle-mountain-2026";

const featuredTournament = {
  name: "Eagle Mountain",
  slug: tournamentSlug,
  lake: "Eagle Mountain",
  tournament_date: "2026-11-01T05:00:00-06:00",
  ramp: "Twin Points Park",
  status: "Registration Open",
  registration_opens: "2026-07-01T05:00:00-05:00",
  registration_closes: "2026-10-31T21:00:00-05:00",
  morning_registration: "05:00",
  capacity: 50,
  description:
    "The featured All-In Tournament Trail stop at Eagle Mountain Lake.",
  hero_image_url: "/images/lakes/eagle-mountain.jfif",
  is_featured: true,
  show_on_homepage: true,
  updated_by: "DEMO REPAIR",
};

/*
|--------------------------------------------------------------------------
| Winners Circle — 20 Final Teams
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

  /*
  |--------------------------------------------------------------------------
  | Bronze Pot
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Silver Pot
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Gold Pot
  |--------------------------------------------------------------------------
  */

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
| Winners Circle Summary
|--------------------------------------------------------------------------
*/

const resultSummary = {
  total_payout: 16500,
  bronze_payout: 1350,
  silver_payout: 2250,
  gold_payout: 3000,
  insurance_pot_payout: 1250,
  big_bass_angler: "Dylan Carter",
  big_bass_team: "Carter / Reynolds",
  big_bass_weight: 8.91,
  big_bass_payout: 650,
  champion_image_url: "/images/results/overall-winner.jpg",
  big_bass_image_url: "/images/results/big-bass.jpg",
};

/*
|--------------------------------------------------------------------------
| Repair Homepage and Winners Circle
|--------------------------------------------------------------------------
*/

async function main() {
  console.log("\nStarting safe homepage repair...\n");

  /*
  |--------------------------------------------------------------------------
  | Find existing Eagle Mountain tournament
  |--------------------------------------------------------------------------
  */

  const {
    data: existingTournament,
    error: tournamentLookupError,
  } = await supabase
    .from("tournaments")
    .select("*")
    .eq("slug", tournamentSlug)
    .maybeSingle();

  if (tournamentLookupError) {
    throw new Error(
      `Could not find the Eagle Mountain tournament: ${tournamentLookupError.message}`,
    );
  }

  let tournamentId;

  /*
  |--------------------------------------------------------------------------
  | Update existing tournament or recreate it
  |--------------------------------------------------------------------------
  */

  if (existingTournament) {
    const {
      data: updatedTournament,
      error: updateError,
    } = await supabase
      .from("tournaments")
      .update({
        name: featuredTournament.name,
        lake: featuredTournament.lake,
        tournament_date: featuredTournament.tournament_date,
        ramp: featuredTournament.ramp,
        status: featuredTournament.status,
        registration_opens:
          featuredTournament.registration_opens,
        registration_closes:
          featuredTournament.registration_closes,
        morning_registration:
          featuredTournament.morning_registration,
        capacity: featuredTournament.capacity,
        description: featuredTournament.description,
        hero_image_url: featuredTournament.hero_image_url,
        is_featured: true,
        show_on_homepage: true,
        updated_by: featuredTournament.updated_by,
      })
      .eq("id", existingTournament.id)
      .select("id, name, slug")
      .single();

    if (updateError) {
      throw new Error(
        `Could not restore the featured tournament: ${updateError.message}`,
      );
    }

    tournamentId = updatedTournament.id;

    console.log(
      `Restored existing tournament: ${updatedTournament.name}`,
    );
  } else {
    const {
      data: createdTournament,
      error: insertError,
    } = await supabase
      .from("tournaments")
      .insert(featuredTournament)
      .select("id, name, slug")
      .single();

    if (insertError) {
      throw new Error(
        `Could not recreate the featured tournament: ${insertError.message}`,
      );
    }

    tournamentId = createdTournament.id;

    console.log(
      `Recreated tournament: ${createdTournament.name}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Save the 20 Winners Circle teams
  |--------------------------------------------------------------------------
  */

  const { error: resultsError } = await supabase
    .from("tournament_results")
    .upsert(
      {
        tournament_id: tournamentId,
        entries: finalStandings,
        ...resultSummary,
        published_at: new Date().toISOString(),
      },
      {
        onConflict: "tournament_id",
      },
    );

  if (resultsError) {
    throw new Error(
      `Could not restore the Winners Circle: ${resultsError.message}`,
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Verify the saved data
  |--------------------------------------------------------------------------
  */

  const {
    data: savedResults,
    error: verificationError,
  } = await supabase
    .from("tournament_results")
    .select("entries")
    .eq("tournament_id", tournamentId)
    .maybeSingle();

  if (verificationError) {
    throw new Error(
      `The data was saved, but verification failed: ${verificationError.message}`,
    );
  }

  const savedEntries = Array.isArray(savedResults?.entries)
    ? savedResults.entries
    : [];

  const finalCount = savedEntries.filter(
    (entry) => entry?.kind === "final",
  ).length;

  const sidePotCount = savedEntries.filter(
    (entry) => entry?.kind === "sidePot",
  ).length;

  console.log("\nRepair completed successfully.\n");
  console.log("Featured tournament: Eagle Mountain");
  console.log("Tournament status: Registration Open");
  console.log("Homepage visibility: On");
  console.log(`Final standings: ${finalCount}`);
  console.log(`Side-pot rows: ${sidePotCount}`);
  console.log(
    "\nRefresh the homepage using Ctrl + Shift + R.\n",
  );
}

main().catch((error) => {
  console.error("\nRepair failed.\n");
  console.error(
    error instanceof Error ? error.message : error,
  );
  console.error("");
  process.exitCode = 1;
});