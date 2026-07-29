import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import AddMemberForm from "@/components/admin/AddMemberForm";
import { requireAdminUser } from "@/lib/admin-auth";
import { listMembershipTournamentsForSeason } from "@/lib/admin-members";
import { getActiveSeason } from "@/lib/seasons";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function todayDateInputValue(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function AddMemberPage() {
  try {
    await requireAdminUser();
  } catch {
    redirect("/admin/login?next=/admin/members/new");
  }

  const activeSeason = await getActiveSeason();
  const tournaments = activeSeason
    ? await listMembershipTournamentsForSeason(activeSeason.id)
    : [];

  return (
    <>
      <Link
        href="/admin/members"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Members
      </Link>

      <div className="mt-8 border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Membership Management
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Add Member
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
          Enter information from a completed physical AITT membership form.
        </p>
      </div>

      {!activeSeason ? (
        <section className="mt-8 border border-[#D4A017]/30 bg-[#D4A017]/10 px-6 py-10 text-center">
          <p className="text-sm text-neutral-200">
            Set an active season before adding a membership.
          </p>
        </section>
      ) : tournaments.length === 0 ? (
        <section className="mt-8 border border-[#D4A017]/30 bg-[#D4A017]/10 px-6 py-10 text-center">
          <p className="text-sm text-neutral-200">
            Add regular-season tournaments to {activeSeason.name} before
            creating memberships.
          </p>
        </section>
      ) : (
        <AddMemberForm
          seasons={[activeSeason]}
          defaultSeasonId={activeSeason.id}
          tournaments={tournaments}
          defaultEffectiveDate={todayDateInputValue()}
        />
      )}
    </>
  );
}
