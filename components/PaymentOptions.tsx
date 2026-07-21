interface PaymentOptionsProps {
  total: number;
  canSubmit: boolean;
  validationMessage?: string;
}

export default function PaymentOptions({ total, canSubmit, validationMessage }: PaymentOptionsProps) {
  return (
    <section aria-labelledby="payment-heading" className="border-t border-[#4A3A12] pt-8">
      <h2 id="payment-heading" className="text-xl font-black uppercase tracking-[0.05em] text-[#D4A017]">
        Payment
      </h2>
      <p className="mt-2 text-sm text-[#8E8E8E]">Secure checkout powered by Stripe</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled className="min-h-12 rounded-sm border border-[#3A3A3A] bg-black px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
          Apple Pay
        </button>
        <button type="button" disabled className="min-h-12 rounded-sm border border-[#3A3A3A] bg-black px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70">
          Google Pay
        </button>
      </div>

      <div className="my-5 flex items-center gap-4 text-xs font-bold uppercase tracking-[0.18em] text-[#777]">
        <span className="h-px flex-1 bg-[#333]" /> or pay with card <span className="h-px flex-1 bg-[#333]" />
      </div>

      <div className="rounded-sm border border-[#3A3A3A] bg-[#0B0B0B] px-4 py-4 text-sm text-[#777]">
        Card payment will be available when Stripe Checkout is connected.
      </div>

      {validationMessage && (
        <p className="mt-4 text-sm text-red-400" role="alert">{validationMessage}</p>
      )}

      <button type="submit" disabled={!canSubmit} className="mt-5 min-h-14 w-full rounded-sm bg-[#D4A017] px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#0B0B0B] transition hover:bg-[#e2b229] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#D4A017]">
        Pay ${total.toFixed(2)} &amp; Register
      </button>
    </section>
  );
}
