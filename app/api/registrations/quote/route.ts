import { NextResponse } from "next/server";

import { createAuthoritativeRegistrationQuote, validateOnlineRegistrationRequest, type OnlineRegistrationRequest } from "@/lib/online-registration";
import {
  toPublicTournament,
  type PublicTournamentRecord,
} from "@/lib/tournament-record-adapter";
import { validateRegistrationMembershipClaims } from "@/lib/registration-membership-validation";
import { getTournamentBySlug } from "@/lib/tournaments";
import type { Tournament } from "@/types/tournament";

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

  const errors = validateOnlineRegistrationRequest(input, now, {}, tournament);
  if (errors.length) return NextResponse.json({ error: "Registration needs attention.", errors }, { status: 400 });

  try {
    const membershipErrors =
      await validateRegistrationMembershipClaims(
        input.anglers,
        tournamentRecord,
      );
    if (membershipErrors.length) {
      return NextResponse.json(
        { error: "Registration needs attention.", errors: membershipErrors },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Registration membership validation failed.", error);
    return NextResponse.json(
      { error: "We could not verify membership information. Please try again." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    quote: createAuthoritativeRegistrationQuote(input, now, tournament),
  });
}
