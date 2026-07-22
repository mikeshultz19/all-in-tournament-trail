interface PaymentOptionsProps {
  total: string;
  canReview: boolean;
  reviewComplete?: boolean;
  reviewing?: boolean;
  checkoutAvailable?: boolean;
  validationMessage?: string;
}

export default function PaymentOptions({
  total,
  canReview,
  reviewComplete = false,
  reviewing = false,
  checkoutAvailable = false,
  validationMessage,
}: PaymentOptionsProps) {
  return (
    <section aria-labelledby="payment-handoff-heading">
      <h3 id="payment-handoff-heading" className="sr-only">Payment handoff</h3>
      {validationMessage && <p className="text-sm text-red-400" role="alert">{validationMessage}</p>}
      <button
        type="submit"
        disabled={!canReview || reviewing}
        className="mt-5 min-h-14 w-full rounded-sm bg-[#D4A017] px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#0B0B0B] transition hover:bg-yellow-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {reviewing ? "Reviewing Registration…" : "Continue to Payment"}
      </button>
      <p className="mt-3 text-center text-xs text-neutral-400">You’ll review and confirm before paying.</p>
      <p className="mt-2 text-center text-xs text-neutral-500">Secure payment through Square</p>
      {reviewComplete && !checkoutAvailable && (
        <p className="mt-4 border border-[#333] bg-[#0B0B0B] p-3 text-xs leading-5 text-neutral-300" role="status">
          Square checkout is not configured. No payment was attempted. Verified total: {total}.
        </p>
      )}
    </section>
  );
}
