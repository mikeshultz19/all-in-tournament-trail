import { NextResponse } from "next/server";

import { reconcileOnlinePaymentAttempt } from "@/lib/online-payment-attempts";

export async function POST(request: Request) {
  let attemptId: string | undefined;
  try { attemptId = (await request.json() as { attemptId?: string }).attemptId; } catch { return NextResponse.json({ error: "Invalid recovery request." }, { status: 400 }); }
  if (!attemptId) return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });
  try { return NextResponse.json(await reconcileOnlinePaymentAttempt(attemptId)); }
  catch (error) { console.error("Payment reconciliation check failed.", error); return NextResponse.json({ status: "reconciliation_required" }, { status: 202 }); }
}
