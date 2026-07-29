import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminWarningBanner from "@/components/admin/AdminWarningBanner";
import {
  getAdminDisplayName,
  isAdminUser,
} from "@/lib/admin-auth";
import { createSupabaseAuthServerClient } from "@/lib/supabase/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  let adminName: string | null = null;

  try {
    const supabase = await createSupabaseAuthServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && isAdminUser(user)) {
      adminName = getAdminDisplayName(user);
    }
  } catch {
    adminName = null;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
      <AdminHeader adminName={adminName} />
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <AdminWarningBanner />
        <div className="mt-6 sm:mt-8">{children}</div>
      </main>
    </div>
  );
}
