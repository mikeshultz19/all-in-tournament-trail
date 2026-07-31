import RegistrationReviewResolutionForm from "@/components/admin/RegistrationReviewResolutionForm";
import { reopenRegistrationReviewAction } from "@/app/admin/registration-review/actions";
import { requireAdminUser } from "@/lib/admin-auth";
import {
  listRegistrationReviewItems,
  listReviewAnglerOptions,
  summarizeRegistrationReviewItems,
} from "@/lib/registration-identity-review";
import { getActiveSeasonSchedule } from "@/lib/tournaments";

export const dynamic = "force-dynamic";

export default async function RegistrationReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  await requireAdminUser();
  const { tournament } = await searchParams;
  const [items, anglers, tournaments] = await Promise.all([
    listRegistrationReviewItems(tournament),
    listReviewAnglerOptions(),
    getActiveSeasonSchedule(),
  ]);
  const reviewSummary = summarizeRegistrationReviewItems(items);

  return (
    <>
      <header>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
          Tournament Operations
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase text-white">
          Registration Review
        </h1>
        <p className="mt-3 max-w-3xl text-neutral-400">
          Resolve possible identity conflicts after registration and payment.
          Registrations remain stored and visible while review is pending.
        </p>
      </header>

      <form className="mt-6 flex max-w-xl gap-3">
        <select
          name="tournament"
          defaultValue={tournament ?? ""}
          className="min-h-11 flex-1 border border-white/15 bg-[#111] px-3 text-sm text-white"
        >
          <option value="">All tournaments</option>
          {tournaments.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <button className="bg-[#D4A017] px-5 text-xs font-black uppercase text-black">
          Filter
        </button>
      </form>

      <p className="mt-6 text-sm font-bold text-[#D4A017]">
        Pending: {reviewSummary.pendingReviewCount}
      </p>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="border border-white/10 bg-[#111] p-6 text-neutral-400">
            No registration identity reviews found.
          </p>
        ) : items.map((item) => (
          <section key={item.id} className="border border-white/10 bg-[#111] p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs uppercase text-neutral-500">Tournament</p><p className="font-bold text-white">{item.tournamentName}</p></div>
              <div><p className="text-xs uppercase text-neutral-500">Participant</p><p className="font-bold text-white">{item.participantName}</p></div>
              <div><p className="text-xs uppercase text-neutral-500">Competing As</p><p className="font-bold uppercase text-white">{item.recordType}</p></div>
              <div><p className="text-xs uppercase text-neutral-500">Status</p><p className="font-bold uppercase text-[#D4A017]">{item.status.replace("_", " ")}</p></div>
              <div><p className="text-xs uppercase text-neutral-500">Email</p><p className="text-sm text-neutral-300">{item.email ?? "Not provided"}</p></div>
              <div><p className="text-xs uppercase text-neutral-500">Phone</p><p className="text-sm text-neutral-300">{item.phone ?? "Not provided"}</p></div>
              <div className="sm:col-span-2"><p className="text-xs uppercase text-neutral-500">Reason</p><p className="text-sm text-neutral-300">{item.reason}</p></div>
            </div>

            {item.status === "review_required" ? (
              <RegistrationReviewResolutionForm
                reviewId={item.id}
                anglers={anglers}
                suggestedAnglerIds={item.suggestedAnglers.map((angler) => angler.id)}
              />
            ) : (
              <form action={reopenRegistrationReviewAction} className="mt-4 flex gap-3">
                <input type="hidden" name="reviewId" value={item.id} />
                <input name="reviewNote" placeholder="Reason for reopening" className="min-h-10 flex-1 border border-white/15 bg-[#0B0B0B] px-3 text-sm text-white" />
                <button className="border border-red-500/40 px-4 text-xs font-black uppercase text-red-300">
                  Reopen Review
                </button>
              </form>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
