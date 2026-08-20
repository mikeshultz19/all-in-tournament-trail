import { NextResponse } from "next/server";

import { completeAttemptFromVerifiedSquarePayment, recordTerminalSquarePaymentFailure } from "@/lib/online-payment-attempts";
import { verifySquareWebhookSignature, type SquarePayment } from "@/lib/square-payments";

type SquareWebhook = { type?: string; data?: { object?: { payment?: SquarePayment } } };

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifySquareWebhookSignature(rawBody, request.headers.get("x-square-hmacsha256-signature"))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });
  }
  let event: SquareWebhook;
  try { event = JSON.parse(rawBody) as SquareWebhook; } catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }); }
  if (!event.type?.startsWith("payment.")) return NextResponse.json({ received: true });
  const payment = event.data?.object?.payment;
  if (!payment?.id || !payment.reference_id) return NextResponse.json({ received: true });
  try {
    if (payment.status === "COMPLETED") await completeAttemptFromVerifiedSquarePayment(payment.reference_id, payment);
    else await recordTerminalSquarePaymentFailure(payment.reference_id, payment);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Square webhook reconciliation failed.", error);
    return NextResponse.json({ error: "Reconciliation failed." }, { status: 500 });
  }
}
