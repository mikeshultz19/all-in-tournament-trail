import AdminPanel from "@/components/admin/AdminPanel";
import { requireAdminUser } from "@/lib/admin-auth";
import { listPaymentRecoveryAttempts, type PaymentRecoveryAttempt } from "@/lib/admin-payment-recovery";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TournamentSummary = { id: string; name: string; tournament_date: string };

export default async function PaymentRecoveryPage() {
  await requireAdminUser();

  let attempts: PaymentRecoveryAttempt[] = [];
  let tournaments = new Map<string, TournamentSummary>();
  let loadError: string | null = null;

  try {
    attempts = await listPaymentRecoveryAttempts();
    const tournamentIds = [...new Set(attempts.map((attempt) => attempt.tournament_id))];
    if (tournamentIds.length > 0) {
      const { data, error } = await createSupabaseServerClient()
        .from("tournaments")
        .select("id,name,tournament_date")
        .in("id", tournamentIds);
      if (error) throw error;
      tournaments = new Map((data ?? []).map((tournament) => [tournament.id, tournament as TournamentSummary]));
    }
  } catch (error) {
    console.error("Payment recovery page load failed.", error);
    loadError = "Payment recovery records could not be loaded. Please try again.";
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-white/10 pb-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">AITT Admin Center</p>
        <h1 className="mt-2 text-3xl font-black uppercase text-white">Payment Recovery</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
          Paid online attempts that did not finish creating a registration. Review the Square payment before taking any action; never ask the customer to pay again for the same attempt.
        </p>
      </header>

      {loadError ? (
        <section className="border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-100">{loadError}</section>
      ) : attempts.length === 0 ? (
        <AdminPanel accent className="p-6">
          <h2 className="text-xl font-black uppercase text-white">No recovery items</h2>
          <p className="mt-2 text-sm text-neutral-400">There are no paid online attempts waiting for registration recovery.</p>
        </AdminPanel>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <RecoveryCard key={attempt.id} attempt={attempt} tournament={tournaments.get(attempt.tournament_id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecoveryCard({ attempt, tournament }: { attempt: PaymentRecoveryAttempt; tournament?: TournamentSummary }) {
  const request = isRecord(attempt.registration_request) ? attempt.registration_request : {};
  const anglers = Array.isArray(request.anglers) ? request.anglers.filter(isRecord) : [];
  const names = anglers.map((angler) => [angler.firstName, angler.lastName].filter(isString).join(" ")).filter(Boolean);
  const emails = anglers.map((angler) => angler.email).filter(isString);

  return (
    <AdminPanel accent className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-400">Registration not completed</p>
          <h2 className="mt-2 text-xl font-black uppercase text-white">{tournament?.name ?? "Unknown tournament"}</h2>
          <p className="mt-1 text-xs text-neutral-500">Attempt {attempt.id} · {formatDate(attempt.created_at)}</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-neutral-500">Recorded amount</p>
          <p className="mt-1 text-2xl font-black text-[#E8C966]">{formatCurrency(attempt.amount_cents)}</p>
          <p className="mt-1 text-xs font-bold uppercase text-red-300">Manual review required</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
        <Detail label="Anglers" value={names.join(" / ") || "Not available"} />
        <Detail label="Email(s)" value={emails.join(" / ") || "Not available"} />
        <Detail label="Square payment" value={attempt.square_payment_id ?? "Not recorded"} />
        <Detail label="Square status" value={attempt.square_status ?? "Unknown"} />
      </dl>

      {attempt.failure_message || attempt.failure_code ? (
        <div className="mt-4 border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-100">
          <span className="font-black uppercase">System note:</span> {attempt.failure_code ? `${attempt.failure_code} — ` : ""}{attempt.failure_message ?? "No additional message."}
        </div>
      ) : null}
    </AdminPanel>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500">{label}</dt><dd className="mt-1 break-words text-sm font-bold text-white">{value}</dd></div>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function formatCurrency(amountCents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amountCents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

