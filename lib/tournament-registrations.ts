import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getTournamentEntrySummary,
  sortPublicEarlyEntries,
  toPublicEarlyEntry,
  type EarlyRegistrationRecord,
  type PublicEarlyEntry,
  type TournamentEntrySummary,
} from "@/lib/public-early-entry";

export class TournamentRegistrationDataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TournamentRegistrationDataError";
  }
}

type TournamentRegistrationRow = {
  registration_key: string;
  tournament_id: string;
  registered_at: string;
  registration_type: "solo" | "team";
  angler1_name: string;
  angler2_name: string | null;
  big_bass: boolean;
  member_pot: "bronze" | "silver" | "gold" | null;
  insurance: boolean;
  payment_reference: string | null;
  admin_notes: string | null;
};

function mapRowToPublicEntry(row: TournamentRegistrationRow): PublicEarlyEntry {
  const record: EarlyRegistrationRecord = {
    id: row.registration_key,
    tournamentSlug: row.tournament_id,
    registeredAt: row.registered_at,
    registrationType: row.registration_type,
    angler1: {
      publicDisplayName: row.angler1_name,
      email: "",
      phone: "",
    },
    angler2: row.angler2_name
      ? {
          publicDisplayName: row.angler2_name,
          email: "",
          phone: "",
        }
      : null,
    bigBass: row.big_bass,
    memberPot: row.member_pot,
    insurance: row.insurance,
    paymentReference: row.payment_reference ?? "",
    adminNotes: row.admin_notes,
  };

  return toPublicEarlyEntry(record);
}

export async function getTournamentRegistrationRows(
  tournamentId: string,
): Promise<TournamentRegistrationRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournament_registrations")
    .select(
      "registration_key,tournament_id,registered_at,registration_type,angler1_name,angler2_name,big_bass,member_pot,insurance,payment_reference,admin_notes",
    )
    .eq("tournament_id", tournamentId)
    .order("registered_at", { ascending: true });

  if (error) {
    throw new TournamentRegistrationDataError(
      "We could not load tournament registrations.",
      { cause: error },
    );
  }

  return (data ?? []) as TournamentRegistrationRow[];
}

export async function getPublicEarlyEntriesForTournament(
  tournamentId: string,
): Promise<PublicEarlyEntry[]> {
  const rows = await getTournamentRegistrationRows(tournamentId);
  return sortPublicEarlyEntries(rows.map(mapRowToPublicEntry));
}

export async function getTournamentRegistrationSummaryForTournament(
  tournamentId: string,
): Promise<TournamentEntrySummary> {
  return getTournamentEntrySummary(
    await getPublicEarlyEntriesForTournament(tournamentId),
  );
}

