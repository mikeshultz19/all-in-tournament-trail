"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut({ scope: "local" });
    } finally {
      window.location.assign("/admin/login");
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={logout}
      className="inline-flex min-h-10 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogOut aria-hidden="true" className="size-4" />
      {pending ? "Logging Out…" : "Logout"}
    </button>
  );
}
