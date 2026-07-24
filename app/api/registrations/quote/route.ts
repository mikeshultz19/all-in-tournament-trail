import { NextResponse } from "next/server";

import { createAuthoritativeRegistrationQuote, validateOnlineRegistrationRequest, type OnlineRegistrationRequest } from "@/lib/online-registration";
import {
  toPublicTournament,
  type PublicTournamentRecord,
} from "@/lib/tournament-record-adapter";
import { getTournamentBySlug } from "@/lib/tournaments";

export async function POST(request: Request) {
  let input: OnlineRegistrationRequest;
  try {
    input = (await request.json()) as OnlineRegistrationRequest;
  } catch {
    return NextResponse.json({ error: "Enter valid registration information." }, { status: 400 });
  }

  const now = new Date();
  let tournament: PublicTournamentRecord;

  try {
    const tournamentRecord = await getTournamentBySlug(input.tournamentSlug);
    if (!tournamentRecord) {
      return NextResponse.json(
        { error: "Select a valid tournament." },
        { status: 400 },
      );
    }
    tournament = toPublicTournament(tournamentRecord);
  } catch (error) {
    console.error("Registration tournament validation failed.", error);
    return NextResponse.json(
      { error: "We could not verify this tournament. Please try again." },
      { status: 503 },
    );
  }

  const errors = validateOnlineRegistrationRequest(input, now, {}, tournament);
  if (errors.length) return NextResponse.json({ error: "Registration needs attention.", errors }, { status: 400 });

  // TODO(Phase 4): Persist the accepted rules/waiver versions and replace the
  // client-reported acknowledgment time with a trusted server timestamp before
  // creating a durable registration or initiating Square payment.
  return NextResponse.json({
    quote: createAuthoritativeRegistrationQuote(input, now, tournament),
  });
}
