"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  function handleLogout() {
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex min-h-10 items-center gap-2 border border-white/15 px-4 text-xs font-black uppercase tracking-[0.12em] text-neutral-300 transition hover:border-[#D4A017] hover:text-white"
    >
      <LogOut aria-hidden="true" className="size-4" />
      Log Out
    </button>
  );
}