"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        window.alert("Unable to log out. Please try again.");
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      window.alert("Unable to log out. Please try again.");
    }
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