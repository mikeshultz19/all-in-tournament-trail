import { NextResponse } from "next/server";

import { processOnlineCardPayment } from "@/lib/online-payment-attempts";

export async function POST(request: Request) {
  let input: { attemptId?: string; sourceId?: string };
  try { input = await request.json() as typeof input; } catch { return NextResponse.json({ error: "Enter valid payment information." }, { status: 400 }); }
  if (!input.attemptId || !input.sourceId) return NextResponse.json({ error: "Payment information is incomplete." }, { status: 400 });
  try {
    const result = await processOnlineCardPayment(input.attemptId, input.sourceId);
    return NextResponse.json(result, { status: result.status === "failed" ? 402 : 200 });
  } catch (error) {
    console.error("Online payment processing failed.", error);
    return NextResponse.json({
      status: "reconciliation_required",
      attemptId: input.attemptId,
      message: "Payment confirmation is delayed. Do not pay again. AITT will verify this payment automatically.",
    }, { status: 202 });
  }
}
