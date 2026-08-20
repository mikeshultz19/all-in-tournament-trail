"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type SquareCard = { attach(selector: string): Promise<void>; tokenize(details: Record<string, unknown>): Promise<{ status: string; token?: string; errors?: Array<{ message?: string }> }>; destroy(): Promise<void> };
declare global { interface Window { Square?: { payments(applicationId: string, locationId: string): { card(): Promise<SquareCard> } } } }

interface PaymentOptionsProps {
  total: string;
  canReview: boolean;
  reviewComplete?: boolean;
  reviewing?: boolean;
  checkoutAvailable?: boolean;
  validationMessage?: string;
  registrationClosed?: boolean;
  paymentAttemptId?: string | null;
  squareConfig?: { applicationId: string; locationId: string; environment: "sandbox" | "production" } | null;
  billingContact?: { firstName: string; lastName: string; email: string; phone: string; streetAddress: string; city: string; state: string; zipCode: string };
}

export default function PaymentOptions({ total, canReview, reviewComplete = false, reviewing = false, checkoutAvailable = false, validationMessage, registrationClosed = false, paymentAttemptId, squareConfig, billingContact }: PaymentOptionsProps) {
  const [sdkReady, setSdkReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");
  const [activeAttemptId, setActiveAttemptId] = useState(paymentAttemptId);
  const cardRef = useRef<SquareCard | null>(null);

  useEffect(() => {
    if (!sdkReady || !squareConfig || !checkoutAvailable || cardRef.current || !window.Square) return;
    let cancelled = false;
    void window.Square.payments(squareConfig.applicationId, squareConfig.locationId).card().then(async (card) => {
      if (cancelled) return card.destroy();
      cardRef.current = card;
      await card.attach("#square-card-container");
    }).catch(() => setMessage("Secure payment could not be loaded. Please refresh and try again."));
    return () => { cancelled = true; const card = cardRef.current; cardRef.current = null; if (card) void card.destroy(); };
  }, [checkoutAvailable, sdkReady, squareConfig]);

  async function pay() {
    if (!cardRef.current || !activeAttemptId || !billingContact) return;
    setPaying(true); setMessage("");
    try {
      const token = await cardRef.current.tokenize({
        amount: total.replace(/[^0-9.]/g, ""), currencyCode: "USD", intent: "CHARGE", customerInitiated: true, sellerKeyedIn: false,
        billingContact: { givenName: billingContact.firstName, familyName: billingContact.lastName, email: billingContact.email, phone: billingContact.phone, addressLines: [billingContact.streetAddress], city: billingContact.city, state: billingContact.state, postalCode: billingContact.zipCode, countryCode: "US" },
      });
      if (token.status !== "OK" || !token.token) throw new Error(token.errors?.[0]?.message ?? "Card verification failed.");
      const response = await fetch("/api/registrations/payment", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId: activeAttemptId, sourceId: token.token }) });
      const result = await response.json() as { status?: string; attemptId?: string; retryAttemptId?: string; message?: string };
      if (result.status === "completed") { window.location.assign(`/register/confirmation?attempt=${encodeURIComponent(result.attemptId ?? activeAttemptId)}`); return; }
      if (result.status === "reconciliation_required") { window.location.assign(`/register/confirmation?attempt=${encodeURIComponent(result.attemptId ?? activeAttemptId)}`); return; }
      if (result.retryAttemptId) setActiveAttemptId(result.retryAttemptId);
      setMessage(result.message ?? "Payment was not completed. Try another card or payment method.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Payment was not completed. Try another card or payment method."); }
    finally { setPaying(false); }
  }

  const scriptUrl = squareConfig?.environment === "production" ? "https://web.squarecdn.com/v1/square.js" : "https://sandbox.web.squarecdn.com/v1/square.js";
  return <section aria-labelledby="payment-handoff-heading">
    <h3 id="payment-handoff-heading" className="sr-only">Payment handoff</h3>
    {(validationMessage || message) && <p className="text-sm text-red-400" role="alert">{message || validationMessage}</p>}
    <p className="mt-2 text-center text-xs text-neutral-500">Secure payment through Square</p>
    {checkoutAvailable && squareConfig ? <>
      <Script src={scriptUrl} onLoad={() => setSdkReady(true)} />
      <div id="square-card-container" className="mt-5 min-h-24 rounded-sm border border-[#3A3A3A] bg-white p-3" />
      <button type="button" onClick={pay} disabled={!sdkReady || paying} className="mt-3 min-h-14 w-full rounded-sm bg-[#D4A017] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50">{paying ? "Processing Payment…" : `Pay ${total}`}</button>
      <p className="mt-3 text-center text-xs text-neutral-400">Your registration is created only after Square confirms payment.</p>
    </> : <>
      <button type="submit" disabled={registrationClosed || !canReview || reviewing} className="mt-5 min-h-14 w-full rounded-sm bg-[#D4A017] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-50">{registrationClosed ? "Registration Closed" : reviewing ? "Reviewing Registration…" : "Continue to Payment"}</button>
      <p className="mt-3 text-center text-xs text-neutral-400">You’ll review and confirm before paying.</p>
      {reviewComplete && <p className="mt-4 border border-[#333] bg-[#0B0B0B] p-3 text-xs leading-5 text-neutral-300" role="status">Square checkout is not configured. No payment was attempted. Verified total: {total}.</p>}
    </>}
  </section>;
}
