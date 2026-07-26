import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceRoleKey) {
  throw new Error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running seed:demo.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const tournament = {
  name: "Eagle Mountain",
  slug: "eagle-mountain-2026",
  lake: "Eagle Mountain",
  tournament_date: "2026-10-31T05:00:00-05:00",
  ramp: "Twin Points Park",
  status: "Registration Open",
  registration_opens: "2026-07-01T05:00:00-05:00",
  registration_closes: "2026-10-30T21:00:00-05:00",
  morning_registration: "05:00",
  capacity: 50,
  description: "The featured All-In Tournament Trail stop at Eagle Mountain Lake.",
  hero_image_url: "/images/lakes/eagle-mountain.jfif",
  is_featured: true,
  show_on_homepage: true,
  updated_by: "DEMO SEED",
};

const registrationTeams = [
  ["Carter", "Reynolds"],
  ["Bennett", "Hayes"],
  ["Walker", "Collins"],
  ["Turner", "Brooks"],
  ["Davis", "Morgan"],
  ["Parker", "Reed"],
  ["Mitchell", "Foster"],
  ["Harris", "Cooper"],
  ["Sullivan", "Price"],
  ["Edwards", "Griffin"],
  ["Roberts", "Bailey"],
  ["Phillips", "Ward"],
  ["Thompson", "Russell"],
  ["Anderson", "Perry"],
  ["Campbell", "Long"],
  ["Murphy", "Powell"],
  ["Richardson", "Hughes"],
  ["Peterson", "Bryant"],
  ["Simmons", "Jenkins"],
  ["Coleman", "Fisher"],
  ["Holland", "Pierce"],
  ["Mason", "Fletcher"],
  ["Hudson", "Blake"],
  ["Baker", "Lindsey"],
  ["Nelson", "Cross"],
  ["Bishop", "Carver"],
  ["Sloan", "Warren"],
  ["Fleming", "Drake"],
  ["Miller", "Avery"],
  ["Grant", "Morris"],
  ["Keller", "Bright"],
  ["Rivers", "Stone"],
  ["Hayden", "Baker"],
  ["Vance", "Walker"],
  ["Quinn", "Taylor"],
  ["Preston", "Cole"],
  ["Graham", "Fields"],
  ["Cameron", "Bennett"],
];

const finalStandings = [
  { kind: "final", place: 1, team: "Carter / Reynolds", weight: 24.87, baseWinnings: 5000 },
  { kind: "final", place: 2, team: "Bennett / Hayes", weight: 23.94, baseWinnings: 2500 },
  { kind: "final", place: 3, team: "Walker / Collins", weight: 23.41, baseWinnings: 1750 },
  { kind: "final", place: 4, team: "Turner / Brooks", weight: 22.88, baseWinnings: 1250 },
  { kind: "final", place: 5, team: "Davis / Morgan", weight: 22.36, baseWinnings: 1000 },
  { kind: "final", place: 6, team: "Parker / Reed", weight: 21.97, baseWinnings: 850 },
  { kind: "final", place: 7, team: "Mitchell / Foster", weight: 21.61, baseWinnings: 750 },
  { kind: "final", place: 8, team: "Harris / Cooper", weight: 21.22, baseWinnings: 650 },
  { kind: "final", place: 9, team: "Sullivan / Price", weight: 20.89, baseWinnings: 550 },
  { kind: "final", place: 10, team: "Edwards / Griffin", weight: 20.47, baseWinnings: 500 },
  { kind: "final", place: 11, team: "Roberts / Bailey", weight: 20.14, baseWinnings: 450 },
  { kind: "final", place: 12, team: "Phillips / Ward", weight: 19.86, baseWinnings: 400 },
  { kind: "final", place: 13, team: "Thompson / Russell", weight: 19.55, baseWinnings: 350 },
  { kind: "final", place: 14, team: "Anderson / Perry", weight: 19.21, baseWinnings: 300 },
  { kind: "final", place: 15, team: "Campbell / Long", weight: 18.96, baseWinnings: 250 },
  { kind: "final", place: 16, team: "Murphy / Powell", weight: 18.63, baseWinnings: 0 },
  { kind: "final", place: 17, team: "Richardson / Hughes", weight: 18.27, baseWinnings: 0 },
  { kind: "final", place: 18, team: "Peterson / Bryant", weight: 17.91, baseWinnings: 0 },
  { kind: "final", place: 19, team: "Simmons / Jenkins", weight: 17.54, baseWinnings: 0 },
  { kind: "final", place: 20, team: "Coleman / Fisher", weight: 17.18, baseWinnings: 0 },
  { kind: "sidePot", sidePot: "bronze", sidePotPlacement: 1, place: 1, team: "Walker / Collins", weight: 23.41, sidePotWeight: 23.41, sidePotPayout: 900 },
  { kind: "sidePot", sidePot: "bronze", sidePotPlacement: 2, place: 2, team: "Turner / Brooks", weight: 22.88, sidePotWeight: 22.88, sidePotPayout: 450 },
  { kind: "sidePot", sidePot: "silver", sidePotPlacement: 1, place: 1, team: "Carter / Reynolds", weight: 24.87, sidePotWeight: 24.87, sidePotPayout: 1500 },
  { kind: "sidePot", sidePot: "silver", sidePotPlacement: 2, place: 2, team: "Bennett / Hayes", weight: 23.94, sidePotWeight: 23.94, sidePotPayout: 750 },
  { kind: "sidePot", sidePot: "gold", sidePotPlacement: 1, place: 1, team: "Carter / Reynolds", weight: 24.87, sidePotWeight: 24.87, sidePotPayout: 2000 },
  { kind: "sidePot", sidePot: "gold", sidePotPlacement: 2, place: 2, team: "Parker / Reed", weight: 21.97, sidePotWeight: 21.97, sidePotPayout: 1000 },
];

const resultsSummary = {
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

function buildRegistrations(tournamentId) {
  return registrationTeams.map(([angler1, angler2], index) => ({
    registration_key: `eagle-mountain-2026-${String(index + 1).padStart(3, "0")}`,
    tournament_id: tournamentId,
    registered_at: new Date(
      Date.UTC(2026, 6, 1, 10, index % 60, 0) + index * 60_000,
    ).toISOString(),
    registration_type: "team",
    angler1_name: `${angler1} ${index % 2 === 0 ? "Jr." : "Sr."}`,
    angler2_name: `${angler2} ${index % 3 === 0 ? "Jr." : "Sr."}`,
    big_bass: index % 4 === 0 || index === 6,
    member_pot:
      index % 6 === 0
        ? "gold"
        : index % 4 === 0
          ? "silver"
          : index % 2 === 0
            ? "bronze"
            : null,
    insurance: index % 3 !== 1,
    payment_reference: null,
    admin_notes: null,
  }));
}

function buildAoyPoints() {
  return finalStandings.map((entry) => ({
    tournament_id: null,
    place: entry.place,
    team: entry.team,
    anglers: entry.team.split(" / "),
    points: Number((120 - entry.place * 4).toFixed(2)),
  }));
}

async function upsertTournament(record) {
  const { error } = await supabase
    .from("tournaments")
    .upsert(record, { onConflict: "slug" });

  if (error) {
    throw new Error(`Failed to save tournament ${record.slug}: ${error.message}`);
  }
}

async function main() {
  const [{ data: featuredBefore }] = await Promise.all([
    supabase.from("tournaments").select("id").eq("slug", tournament.slug),
  ]);

  await upsertTournament(tournament);

  const { data: featuredTournamentRow, error: featuredLoadError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("slug", tournament.slug)
    .maybeSingle();
  if (featuredLoadError || !featuredTournamentRow) {
    throw new Error("Failed to resolve featured tournament id.");
  }

  const registrations = buildRegistrations(featuredTournamentRow.id);
  const { error: registrationsError } = await supabase
    .from("tournament_registrations")
    .upsert(registrations, { onConflict: "registration_key" });
  if (registrationsError) {
    throw new Error(`Failed to seed registrations: ${registrationsError.message}`);
  }

  const { error: resultsError } = await supabase
    .from("tournament_results")
    .upsert(
      {
        tournament_id: featuredTournamentRow.id,
        entries: finalStandings,
        ...resultsSummary,
        published_at: "2026-10-31T18:00:00Z",
      },
      { onConflict: "tournament_id" },
    );
  if (resultsError) {
    throw new Error(`Failed to seed results: ${resultsError.message}`);
  }

  const aoyPoints = buildAoyPoints().map((row) => ({
    ...row,
    tournament_id: featuredTournamentRow.id,
  }));
  const { error: aoyError } = await supabase
    .from("tournament_aoy_points")
    .upsert(aoyPoints, { onConflict: "tournament_id,place" });
  if (aoyError) {
    throw new Error(`Failed to seed AOY points: ${aoyError.message}`);
  }

  console.log(
    JSON.stringify(
      {
        tournaments: {
          featured: tournament.slug,
          results: tournament.slug,
          overwroteFeaturedRecords: Boolean(featuredBefore?.length),
          overwroteResultsRecords: Boolean(featuredBefore?.length),
        },
        registrations: registrations.length,
        standings: finalStandings.filter((entry) => entry.kind === "final").length,
        sidePotRows: finalStandings.filter((entry) => entry.kind === "sidePot").length,
        payoutTotals: {
          tournamentEntryPayout: resultsSummary.total_payout,
          bronzeSidePotPayout: resultsSummary.bronze_payout,
          silverSidePotPayout: resultsSummary.silver_payout,
          goldSidePotPayout: resultsSummary.gold_payout,
          insurancePot: resultsSummary.insurance_pot_payout,
          bigBassPot: resultsSummary.big_bass_payout,
          totalPaidOutToAnglers:
            resultsSummary.total_payout +
            resultsSummary.bronze_payout +
            resultsSummary.silver_payout +
            resultsSummary.gold_payout +
            resultsSummary.insurance_pot_payout +
            resultsSummary.big_bass_payout,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
