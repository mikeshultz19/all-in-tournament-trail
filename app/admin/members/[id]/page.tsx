import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";

import { requireAdminUser } from "@/lib/admin-auth";
import { getAdminMemberById } from "@/lib/admin-members";
import { formatMemberDate } from "@/lib/member-list";
import { redirect } from "next/navigation";
import MemberLifecycleActions from "@/components/admin/MemberLifecycleActions";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const statusStyles = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-white/15 bg-white/[0.03] text-neutral-300",
  refunded: "border-red-500/30 bg-red-500/10 text-red-300",
};

function MemberNotFound() {
  return (
    <>
      <Link
        href="/admin/members"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 hover:text-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Members
      </Link>
      <section className="mt-8 border border-white/10 bg-[#111111] px-6 py-14 text-center">
        <h1 className="text-2xl font-black uppercase text-white">
          Member Not Found
        </h1>
        <p className="mt-4 text-sm text-neutral-400">
          No member exists with this identifier.
        </p>
      </section>
    </>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="border-b border-white/10 pb-4">
      <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
        {label}
      </dt>
      <dd className="mt-2 text-sm font-semibold text-neutral-200">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ history?: string }>;
}) {
  const { id } = await params;

  try {
    await requireAdminUser();
  } catch {
    redirect(
      `/admin/login?next=${encodeURIComponent(`/admin/members/${id}`)}`,
    );
  }

  if (!UUID_PATTERN.test(id)) {
    return <MemberNotFound />;
  }

  const member = await getAdminMemberById(id);

  if (!member) {
    return <MemberNotFound />;
  }

  return (
    <>
      <Link
        href="/admin/members"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Members
      </Link>

      <div className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
            Membership Management
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            {member.firstName} {member.lastName}
          </h1>
        </div>
        <button
          type="button"
          disabled
          title="Member editing is not available yet."
          className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 border border-white/15 px-5 text-xs font-black uppercase tracking-[0.12em] text-neutral-500"
        >
          <Pencil aria-hidden="true" className="size-4" />
          Edit Member
        </button>
      </div>

      <section className="mt-8 border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <dl className="contents">
            <Detail label="First Name" value={member.firstName} />
            <Detail label="Last Name" value={member.lastName} />
            <Detail label="Email" value={member.email} />
            <Detail label="Phone" value={member.phone} />
            <Detail
              label="Admin Status"
              value={member.active ? "Active" : "Inactive"}
            />
            <div className="border-b border-white/10 pb-4">
              <dt className="text-xs font-black uppercase tracking-[0.12em] text-[#D4A017]">
                Member Status
              </dt>
              <dd className="mt-2">
                {member.membershipStatus ? (
                  <span
                    className={`inline-flex border px-2.5 py-1 text-xs font-black uppercase tracking-[0.1em] ${statusStyles[member.membershipStatus]}`}
                  >
                    {member.membershipStatus}
                  </span>
                ) : (
                  <span className="text-sm text-neutral-400">
                    Not assigned
                  </span>
                )}
              </dd>
            </div>
            <Detail
              label="Membership Season"
              value={member.seasonName}
            />
            <Detail
              label="First Eligible Tournament"
              value={member.firstEligibleTournamentName}
            />
            <Detail
              label="Membership Effective Date"
              value={
                member.effectiveDate
                  ? formatMemberDate(member.effectiveDate)
                  : null
              }
            />
          </dl>
        </div>
      </section>
      <MemberLifecycleActions
        memberId={member.id}
        memberName={`${member.firstName} ${member.lastName}`}
        active={member.active}
        historyBlocked={(await searchParams).history === "1"}
      />
    </>
  );
}
