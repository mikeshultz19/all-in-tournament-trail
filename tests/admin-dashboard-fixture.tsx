import { renderToStaticMarkup } from "react-dom/server";

import AdminTournamentDashboard from "@/components/admin/AdminTournamentDashboard";
import { buildWeighfishChecks, sortCloseoutChecks } from "@/lib/on-site-payout-calculator";
import type { Tournament } from "@/types/tournament";

const tournaments: Tournament[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    season_id: null,
    event_type: "regular_season",
    regular_season_number: null,
    name: "Lake Fork Open",
    slug: "lake-fork-open-2026",
    lake: "Lake Fork",
    capacity: 50,
    tournament_date: "2026-08-16T06:00:00-05:00",
    tournament_end_date: null,
    ramp: "Pope's Landing",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: "2026-08-15T18:00:00-05:00",
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
    status: "Registration Open",
    description: "Lake Fork tournament.",
    hero_image_url: null,
    is_featured: true,
    show_on_homepage: true,

    insurance_payout: 0,
    insurance_notes: null,
    insurance_reviewed: false,
    insurance_reviewed_at: null,
champion_photo_url: null,
champion_photo_path: null,
big_bass_photo_url: null,
big_bass_photo_path: null,
photos_reviewed: false,
photos_reviewed_at: null,

    weighfish_imported: false,
    weighfish_imported_at: null,
    result_status: "pending",
    official_results_published_at: null,
    official_results_published_by: null,

    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-23T09:22:00-05:00",
    updated_by: "AITT Staff",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    season_id: null,
    event_type: "regular_season",
    regular_season_number: null,
    name: "Sam Rayburn Open",
    slug: "sam-rayburn-open-2026",
    lake: "Sam Rayburn Reservoir",
    capacity: 50,
    tournament_date: "2026-09-20T06:00:00-05:00",
    tournament_end_date: null,
    ramp: "Umphrey Family Pavilion",
    launch_type: null,
    morning_registration: null,
    registration_opens: null,
    registration_closes: null,
    registration_information: null,
    non_member_practice_rule: null,
    member_practice_rule: null,
    practice_information: null,
    status: "Scheduled",
    description: null,
    hero_image_url: null,
    is_featured: false,
    show_on_homepage: true,

    insurance_payout: 0,
    insurance_notes: null,
    insurance_reviewed: false,
    insurance_reviewed_at: null,
champion_photo_path: null,
big_bass_photo_path: null,
    champion_photo_url: null,
    big_bass_photo_url: null,
    photos_reviewed: false,
    photos_reviewed_at: null,

    weighfish_imported: false,
    weighfish_imported_at: null,
    result_status: "pending",
    official_results_published_at: null,
    official_results_published_by: null,

    created_at: "2026-07-01T12:00:00Z",
    updated_at: "2026-07-01T12:00:00Z",
    updated_by: null,
  },
];

export function renderAdminDashboardFixture(): string {
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={tournaments}
      initialTournamentId={tournaments[0].id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
    />,
  );
}

export function renderPublishReadyDashboardFixture(): string {
  const readyTournament: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: "2026-08-02T12:05:00Z",
    results_verified_by: "admin-1",
    result_status: "imported",
  };
  const sourceRow = {
    place: 1,
    sourcePlacement: "1",
    participationStatus: "participated" as const,
    entryName: "Smith / Jones",
    fishCount: 5,
    totalWeight: 22.4,
    bigFishWeight: 6.1,
    basePayout: 1200,
    bronzePayout: 100,
    silverPayout: 200,
    goldPayout: 300,
    bigBassPlace: 1,
    bigBassPayout: 400,
    cashPayout: 2200,
    payoutBreakdown: "",
    prizeDescription: "",
    validationMessages: [],
  };
  const finalChecks = sortCloseoutChecks(buildWeighfishChecks([sourceRow]));
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[readyTournament]}
      initialTournamentId={readyTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={5}
      importEvidence={{ [readyTournament.id]: { tournamentId: readyTournament.id, persistedRowCount: 1 } }}
      importedRows={{ [readyTournament.id]: [{ id: "row-1", place: 1, team_name: "Smith / Jones", total_weight: 22.4, big_fish_weight: 6.1, bronze_payout: 100, silver_payout: 200, gold_payout: 300, original_import_data: sourceRow }] }}
      resultsRecords={{ [readyTournament.id]: { id: "results-1", tournament_id: readyTournament.id, entries: [{ place: 1, team: "Smith / Jones", weight: 22.4, kind: "final", baseWinnings: 1200, sidePot: "bronze", sidePotPlacement: 1, sidePotWeight: 6.1, sidePotPayout: 100 }], total_payout: 2200, bronze_payout: 100, silver_payout: 200, gold_payout: 300, insurance_pot_payout: 0, big_bass_angler: "Smith / Jones", big_bass_team: "Smith / Jones", big_bass_weight: 6.1, big_bass_payout: 400, champion_image_url: null, big_bass_image_url: null, published_at: "2026-08-02T12:15:00Z", created_at: "", updated_at: "" } }}
      insuranceResults={{ [readyTournament.id]: { id: "insurance-zero", tournament_id: readyTournament.id, entry_count: 0, total_pot_cents: 0, places_paid: 0, calculated_payouts: [], winners: [], published: false, published_at: null, created_at: "", updated_at: "" } }}
      closeouts={{ [readyTournament.id]: { id: "draft", tournament_id: readyTournament.id, source_file_name: "Final Tournament Checks", source_rows: [sourceRow], entry_count: 1, total_collected_cents: 100000, total_paid_cents: 220000, trail_retained_cents: 0, difference_cents: 0, checks: finalChecks, status: "complete", completed_at: "2026-08-02T12:10:00Z", completed_by_admin_id: null, created_at: "", updated_at: "" } }}
    />,
  );
}

export function renderImportDashboardFixture(): string {
  const preparedTournament: Tournament = {
    ...tournaments[0],
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  return renderToStaticMarkup(<AdminTournamentDashboard tournaments={[preparedTournament]} initialTournamentId={preparedTournament.id} comparisonDate="2026-07-23T12:00:00-05:00" showTournamentTools initialExpandedStage={2} />);
}

export function renderLockedImportDashboardFixture(): string {
  return renderToStaticMarkup(<AdminTournamentDashboard tournaments={[tournaments[0]]} initialTournamentId={tournaments[0].id} comparisonDate="2026-07-23T12:00:00-05:00" showTournamentTools initialExpandedStage={2} />);
}

export function renderStaleImportMetadataDashboardFixture(): string {
  const tournamentWithStaleMetadata: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: null,
    result_status: "pending",
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[tournamentWithStaleMetadata]}
      initialTournamentId={tournamentWithStaleMetadata.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={2}
      importedRows={{ [tournamentWithStaleMetadata.id]: [] }}
      importEvidence={{
        [tournamentWithStaleMetadata.id]: {
          tournamentId: tournamentWithStaleMetadata.id,
          persistedRowCount: 0,
        },
      }}
    />,
  );
}

export function renderStaleOfficialLockDashboardFixture(): string {
  const staleOfficialTournament: Tournament = {
    ...tournaments[0],
    result_status: "official",
    weighfish_imported: true,
    weighfish_imported_at: "2026-07-27T23:17:56.481Z",
    results_verified_at: null,
    official_results_published_at: null,
    official_results_published_by: null,
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[staleOfficialTournament]}
      initialTournamentId={staleOfficialTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={2}
      importedRows={{ [staleOfficialTournament.id]: [] }}
      importEvidence={{ [staleOfficialTournament.id]: { tournamentId: staleOfficialTournament.id, persistedRowCount: 0 } }}
      supplementalEvidence={{ [staleOfficialTournament.id]: { officialPublicationExists: false, aoyCalculationExists: false, aoyCurrentProjectionExists: false } }}
    />,
  );
}

export function renderImportedDashboardFixture(verified: boolean): string {
  const importedTournament: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: verified ? "2026-08-02T12:05:00Z" : null,
    results_verified_by: verified ? "admin-1" : null,
    result_status: "imported",
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[importedTournament]}
      initialTournamentId={importedTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={2}
      importedRows={{
        [importedTournament.id]: [
          { id: "result-1", place: 1, team_name: "Smith / Jones", total_weight: 18.42, big_fish_weight: 5.1, bronze_payout: 100, silver_payout: 0, gold_payout: 250 },
        ],
      }}
      importEvidence={{
        [importedTournament.id]: { tournamentId: importedTournament.id, persistedRowCount: 1 },
      }}
    />,
  );
}

export function renderLockedImportedDashboardFixture(): string {
  const importedTournament: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: "2026-08-02T12:05:00Z",
    results_verified_by: "admin-1",
    result_status: "imported",
    prepare_registration_review_complete: false,
    paper_membership_reminder_checked: false,
  };
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[importedTournament]}
      initialTournamentId={importedTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={2}
      importedRows={{
        [importedTournament.id]: [
          { id: "result-1", place: 1, team_name: "Smith / Jones", total_weight: 18.42, big_fish_weight: 5.1, bronze_payout: 100, silver_payout: 0, gold_payout: 250 },
        ],
      }}
      importEvidence={{
        [importedTournament.id]: { tournamentId: importedTournament.id, persistedRowCount: 1 },
      }}
    />,
  );
}

export function renderPayoutReadyDashboardFixture(): string {
  const readyTournament: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: "2026-08-02T12:05:00Z",
    results_verified_by: "admin-1",
    result_status: "imported",
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  const sourceRow = {
    place: 1,
    sourcePlacement: "1",
    participationStatus: "participated" as const,
    entryName: "Smith / Jones",
    fishCount: 5,
    totalWeight: 22.4,
    bigFishWeight: 6.1,
    basePayout: 1200,
    bronzePayout: 100,
    silverPayout: 200,
    goldPayout: 300,
    bigBassPlace: 1,
    bigBassPayout: 400,
    cashPayout: 2200,
    payoutBreakdown: "",
    prizeDescription: "",
    validationMessages: [],
  };
  const sourceRowTwo = {
    ...sourceRow,
    place: 2,
    entryName: "Taylor / Moore",
    bigBassPlace: 2,
    bigBassPayout: 250,
    cashPayout: 250,
  };
  const sourceRows = [sourceRow, sourceRowTwo];
  const weighfishChecks = buildWeighfishChecks(sourceRows);
  const checks = sortCloseoutChecks(weighfishChecks);
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[readyTournament]}
      initialTournamentId={readyTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={4}
      importEvidence={{ [readyTournament.id]: { tournamentId: readyTournament.id, persistedRowCount: 1 } }}
      importedRows={{
        [readyTournament.id]: [
          {
            id: "row-1",
            place: 1,
            team_name: "Smith / Jones",
            total_weight: 22.4,
            big_fish_weight: 6.1,
            bronze_payout: 100,
            silver_payout: 200,
            gold_payout: 300,
            original_import_data: sourceRow,
          },
          {
            id: "row-2",
            place: 2,
            team_name: "Taylor / Moore",
            total_weight: 18.1,
            big_fish_weight: 5.4,
            bronze_payout: 0,
            silver_payout: 0,
            gold_payout: 0,
            original_import_data: sourceRowTwo,
          },
        ],
      }}
      closeouts={{
        [readyTournament.id]: {
          id: "draft",
          tournament_id: readyTournament.id,
          source_file_name: "Final Tournament Checks",
          source_rows: sourceRows,
          entry_count: 2,
          total_collected_cents: 245000,
          total_paid_cents: 245000,
          trail_retained_cents: 0,
          difference_cents: 0,
          checks,
          status: "complete",
          completed_at: "2026-08-02T12:10:00Z",
          completed_by_admin_id: null,
          created_at: "",
          updated_at: "",
        },
      }}
      insuranceResults={{
        [readyTournament.id]: {
          id: "insurance-zero",
          tournament_id: readyTournament.id,
          entry_count: 0,
          total_pot_cents: 0,
          places_paid: 0,
          calculated_payouts: [],
          winners: [],
          published: false,
          published_at: null,
          created_at: "",
          updated_at: "",
        },
      }}
    />,
  );
}

export function renderStaleFinalChecksDashboardFixture(): string {
  const readyTournament: Tournament = {
    ...tournaments[0],
    weighfish_imported: true,
    weighfish_imported_at: "2026-08-02T12:00:00Z",
    results_verified_at: "2026-08-02T12:05:00Z",
    results_verified_by: "admin-1",
    result_status: "imported",
    prepare_registration_review_complete: true,
    paper_membership_reminder_checked: true,
  };
  const sourceRow = {
    place: 1,
    sourcePlacement: "1",
    participationStatus: "participated" as const,
    entryName: "Smith / Jones",
    fishCount: 5,
    totalWeight: 22.4,
    bigFishWeight: 6.1,
    basePayout: 1200,
    bronzePayout: 100,
    silverPayout: 200,
    goldPayout: 300,
    bigBassPlace: 1,
    bigBassPayout: 400,
    cashPayout: 2200,
    payoutBreakdown: "",
    prizeDescription: "",
    validationMessages: [],
  };
  const sourceRowTwo = {
    ...sourceRow,
    place: 2,
    entryName: "Taylor / Moore",
    bigBassPlace: 2,
    bigBassPayout: 250,
    cashPayout: 250,
  };
  const sourceRows = [sourceRow, sourceRowTwo];
  const weighfishChecks = buildWeighfishChecks(sourceRows);
  const savedChecks = sortCloseoutChecks(weighfishChecks);
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[readyTournament]}
      initialTournamentId={readyTournament.id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={4}
      importEvidence={{ [readyTournament.id]: { tournamentId: readyTournament.id, persistedRowCount: 1 } }}
      importedRows={{
        [readyTournament.id]: [
          {
            id: "row-1",
            place: 1,
            team_name: "Smith / Jones",
            total_weight: 22.4,
            big_fish_weight: 6.1,
            bronze_payout: 100,
            silver_payout: 200,
            gold_payout: 300,
            original_import_data: sourceRow,
          },
          {
            id: "row-2",
            place: 2,
            team_name: "Taylor / Moore",
            total_weight: 18.1,
            big_fish_weight: 5.4,
            bronze_payout: 0,
            silver_payout: 0,
            gold_payout: 0,
            original_import_data: sourceRowTwo,
          },
        ],
      }}
      closeouts={{
        [readyTournament.id]: {
          id: "draft",
          tournament_id: readyTournament.id,
          source_file_name: "Final Tournament Checks",
          source_rows: sourceRows,
          entry_count: 2,
          total_collected_cents: 245000,
          total_paid_cents: 245000,
          trail_retained_cents: 0,
          difference_cents: 0,
          checks: savedChecks,
          status: "draft",
          completed_at: null,
          completed_by_admin_id: null,
          created_at: "",
          updated_at: "",
        },
      }}
      insuranceResults={{
        [readyTournament.id]: {
          id: "insurance-active",
          tournament_id: readyTournament.id,
          entry_count: 20,
          total_pot_cents: 40000,
          places_paid: 4,
          calculated_payouts: [10000, 10000, 10000, 10000],
          winners: [
            { entryName: "Brown / Davis", finishingPosition: 8, amountCents: 10000 },
            { entryName: "Wilson / Lee", finishingPosition: 10, amountCents: 10000 },
            { entryName: "Taylor / Moore", finishingPosition: 11, amountCents: 10000 },
            { entryName: "Smith / Jones", finishingPosition: 14, amountCents: 10000 },
          ],
          published: false,
          published_at: null,
          created_at: "",
          updated_at: "",
        },
      }}
    />,
  );
}

export function renderPayoutLockedDashboardFixture(): string {
  return renderToStaticMarkup(
    <AdminTournamentDashboard
      tournaments={[tournaments[0]]}
      initialTournamentId={tournaments[0].id}
      comparisonDate="2026-07-23T12:00:00-05:00"
      showTournamentTools
      initialExpandedStage={3}
    />,
  );
}
