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
