import Image from "next/image";
import Link from "next/link";

import AdminUserInfo from "@/components/admin/AdminUserInfo";

export default function AdminHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0B0B0B]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link
          href="/admin"
          className="group inline-flex min-w-0 items-center gap-4 self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
        >
          <Image
            src="/images/logo.png"
            alt="All-In Tournament Trail"
            width={210}
            height={80}
            priority
            className="h-auto w-[92px] shrink-0 sm:w-[112px]"
          />
          <span className="min-w-0">
            <span className="block text-lg font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#D4A017] sm:text-xl">
              AITT Admin Center
            </span>
            <span className="mt-1 block text-[0.65rem] font-bold uppercase leading-5 tracking-[0.12em] text-neutral-500 sm:text-xs">
              Tournament Administration &amp; Website Management
            </span>
          </span>
        </Link>

        <div className="flex items-center justify-between gap-6 border-t border-white/10 pt-4 md:justify-end md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <AdminUserInfo name="Mike" />
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
          >
            View Website
          </Link>
        </div>
      </div>
    </header>
  );
}
