"use client";

import { useState } from "react";

export default function PaymentRecovery({ attemptId }: { attemptId: string }) {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  async function check() {
    setChecking(true); setMessage("");
    try {
      const response = await fetch("/api/registrations/reconcile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ attemptId }) });
      const result = await response.json() as { status?: string };
      if (result.status === "completed") { window.location.reload(); return; }
      setMessage("Payment is still being verified. Do not submit another payment.");
    } catch { setMessage("Verification is temporarily unavailable. Do not submit another payment."); }
    finally { setChecking(false); }
  }
  return <div className="mt-6"><button type="button" onClick={check} disabled={checking} className="min-h-11 border border-[#D4A017] px-4 text-sm font-black uppercase text-[#D4A017] disabled:opacity-50">{checking ? "Checking…" : "Verify Payment Status"}</button>{message ? <p className="mt-3 text-sm text-amber-200" role="status">{message}</p> : null}</div>;
}
