import { NextResponse } from "next/server";

import { createAuthoritativeRegistrationQuote, validateOnlineRegistrationRequest, type OnlineRegistrationRequest } from "@/lib/online-registration";

export async function POST(request: Request) {
  let input: OnlineRegistrationRequest;
  try {
    input = (await request.json()) as OnlineRegistrationRequest;
  } catch {
    return NextResponse.json({ error: "Enter valid registration information." }, { status: 400 });
  }

  const now = new Date();
  const errors = validateOnlineRegistrationRequest(input, now);
  if (errors.length) return NextResponse.json({ error: "Registration needs attention.", errors }, { status: 400 });

  // TODO(Phase 4): Persist the accepted rules/waiver versions and replace the
  // client-reported acknowledgment time with a trusted server timestamp before
  // creating a durable registration or initiating Square payment.
  return NextResponse.json({ quote: createAuthoritativeRegistrationQuote(input, now) });
}
