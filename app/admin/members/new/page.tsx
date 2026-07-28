import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddMemberPlaceholderPage() {
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
          Add Member
        </h1>
        <p className="mt-4 text-sm text-neutral-400">
          Member creation will be implemented in a future sprint.
        </p>
      </section>
    </>
  );
}
