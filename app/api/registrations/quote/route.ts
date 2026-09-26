import { NextResponse } from "next/server";

import { createAuthoritativeRegistrationQuote, validateOnlineRegistrationRequest, type OnlineRegistrationRequest } from "@/lib/online-registration";
import {
  toPublicTournament,
  type PublicTournamentRecord,
} from "@/lib/tournament-record-adapter";
import { getTournamentBySlug } from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";
import { createOnlinePaymentAttempt } from "@/lib/online-payment-attempts";
import { getSquareConfigurationStatus } from "@/lib/square";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { findActiveRegistrationDuplicatePositions } from "@/lib/active-registration-duplicate";

export async function POST(request: Request) {
  let input: OnlineRegistrationRequest;
  try {
    input = (await request.json()) as OnlineRegistrationRequest;
  } catch {
    return NextResponse.json({ error: "Enter valid registration information." }, { status: 400 });
  }

  const now = new Date();
  let tournament: PublicTournamentRecord;
  let tournamentRecord: Tournament;

  try {
    const loadedTournament = await getTournamentBySlug(
      input.tournamentSlug,
    );
    if (!loadedTournament) {
      return NextResponse.json(
        { error: "Select a valid tournament." },
        { status: 400 },
      );
    }
    tournamentRecord = loadedTournament;
    tournament = toPublicTournament(tournamentRecord);
  } catch (error) {
    console.error("Registration tournament validation failed.", error);
    return NextResponse.json(
      { error: "We could not verify this tournament. Please try again." },
      { status: 503 },
    );
  }

  const supabase = createSupabaseServerClient();
  const [canonicalResult, activeRegistrationsResult] = await Promise.all([
    supabase
      .from("anglers")
      .select("id,first_name,last_name,email,phone")
      .eq("is_active", true)
      .is("merged_into_angler_id", null),
    supabase
      .from("tournament_registrations")
      .select("angler1_id,angler2_id,registration_status")
      .eq("tournament_id", tournamentRecord.id)
      .in("registration_status", ["active", "cancelled"]),
  ]);
  if (canonicalResult.error || activeRegistrationsResult.error) {
    return NextResponse.json({ error: "Registration identity could not be verified. Please try again." }, { status: 503 });
  }
  const activeAnglerIds = new Set(
    (activeRegistrationsResult.data ?? []).filter((row) => row.registration_status === "active").flatMap((row) => [row.angler1_id, row.angler2_id]).filter(
      (id): id is string => Boolean(id),
    ),
  );
  const canceledAnglerIds = new Set(
    (activeRegistrationsResult.data ?? []).filter((row) => row.registration_status === "cancelled").flatMap((row) => [row.angler1_id, row.angler2_id]).filter(
      (id): id is string => Boolean(id),
    ),
  );
  const duplicatePositions = findActiveRegistrationDuplicatePositions(
    input.anglers,
    canonicalResult.data ?? [],
    activeAnglerIds,
  );
  if (duplicatePositions.length) {
    return NextResponse.json(
      {
        error: "Registration needs attention.",
        errors: [
          `Angler ${duplicatePositions.join(" and Angler ")} already has an active registration in this tournament. A canceled registration may return only through tournament-day walk-up registration.`,
        ],
      },
      { status: 409 },
    );
  }
  const canceledPositions = findActiveRegistrationDuplicatePositions(
    input.anglers,
    canonicalResult.data ?? [],
    canceledAnglerIds,
  );
  if (canceledPositions.length) {
    return NextResponse.json(
      {
        error: "Registration needs attention.",
        errors: [
          `Angler ${canceledPositions.join(" and Angler ")} already canceled an online registration for this tournament. Re-entry is available only through tournament-day walk-up registration.`,
        ],
      },
      { status: 409 },
    );
  }

  const errors = validateOnlineRegistrationRequest(
    input,
    now,
    {},
    tournament,
  );
  if (errors.length) return NextResponse.json({ error: "Registration needs attention.", errors }, { status: 400 });

  const quote = createAuthoritativeRegistrationQuote(
    input,
    now,
    tournament,
    {},
  );
  const square = getSquareConfigurationStatus();
  if (square.status !== "configured") return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
  try {
    const paymentAttemptId = await createOnlinePaymentAttempt({ tournamentId: tournamentRecord.id, request: input, quote });
    return NextResponse.json({
      quote,
      paymentAttemptId,
      square: {
        applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        environment: square.environment,
      },
    });
  } catch (error) {
    console.error("Registration payment preparation failed.", error);
    return NextResponse.json({ error: "Payment could not be prepared. No charge was attempted." }, { status: 503 });
  }
}
