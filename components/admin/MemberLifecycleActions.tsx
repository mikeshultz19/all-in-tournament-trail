"use client";

import {
  deleteMemberAction,
  setMemberActiveAction,
} from "@/app/admin/members/[id]/actions";

export default function MemberLifecycleActions({
  memberId,
  memberName,
  active,
  historyBlocked,
}: {
  memberId: string;
  memberName: string;
  active: boolean;
  historyBlocked: boolean;
}) {
  return (
    <div className="mt-8 border border-white/10 bg-[#111111] p-5 sm:p-7">
      <h2 className="text-lg font-black uppercase text-red-500">Member Access</h2>
      {historyBlocked && (
        <p className="mt-4 border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-3 text-sm text-neutral-200" role="alert">
          {memberName} has tournament history and cannot be permanently deleted. Deactivate the member instead.
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        <form action={setMemberActiveAction}>
          <input type="hidden" name="memberId" value={memberId} />
          <input type="hidden" name="active" value={String(!active)} />
          <button className="min-h-11 border border-white/20 px-5 text-xs font-black uppercase text-neutral-200">
            {active ? "Deactivate Member" : "Reactivate Member"}
          </button>
        </form>
        <form
          action={deleteMemberAction}
          onSubmit={(event) => {
            if (!window.confirm(`Permanently delete ${memberName}? This cannot be undone.`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="memberId" value={memberId} />
          <button className="min-h-11 border border-red-500/40 px-5 text-xs font-black uppercase text-red-300">
            Delete Member
          </button>
        </form>
      </div>
    </div>
  );
}
