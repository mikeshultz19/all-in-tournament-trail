import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type SquarePayment = {
  id: string;
  status: string;
  reference_id?: string;
  amount_money?: { amount?: number; currency?: string };
};

export class SquarePaymentError extends Error {
  constructor(message: string, readonly code = "SQUARE_PAYMENT_ERROR", readonly payment?: SquarePayment) {
    super(message);
    this.name = "SquarePaymentError";
  }
}

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

function squareHeaders() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new SquarePaymentError("Online payment is not configured.", "SQUARE_NOT_CONFIGURED");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Square-Version": "2026-07-15",
  };
}

async function squareRequest(path: string, init: RequestInit): Promise<SquarePayment> {
  const response = await fetch(`${squareBaseUrl()}${path}`, { ...init, headers: { ...squareHeaders(), ...init.headers } });
  const body = await response.json() as { payment?: SquarePayment; errors?: Array<{ code?: string; detail?: string }> };
  if (!response.ok || !body.payment) {
    const error = body.errors?.[0];
    throw new SquarePaymentError(error?.detail ?? "Square could not complete the payment.", error?.code ?? "SQUARE_PAYMENT_FAILED", body.payment);
  }
  return body.payment;
}

export function createSquarePayment(input: { sourceId: string; idempotencyKey: string; attemptId: string; amountCents: number }) {
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  if (!locationId) throw new SquarePaymentError("Online payment is not configured.", "SQUARE_NOT_CONFIGURED");
  return squareRequest("/v2/payments", {
    method: "POST",
    body: JSON.stringify({
      source_id: input.sourceId,
      idempotency_key: input.idempotencyKey,
      amount_money: { amount: input.amountCents, currency: "USD" },
      autocomplete: true,
      location_id: locationId,
      reference_id: input.attemptId,
      note: "AITT online tournament registration",
    }),
  });
}

export function retrieveSquarePayment(paymentId: string) {
  return squareRequest(`/v2/payments/${encodeURIComponent(paymentId)}`, { method: "GET" });
}

export function verifySquareWebhookSignature(rawBody: string, signature: string | null) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  if (!key || !notificationUrl || !signature) return false;
  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest();
  let supplied: Buffer;
  try { supplied = Buffer.from(signature, "base64"); } catch { return false; }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
