import type { ReactNode } from "react";

import AdminShell from "@/components/admin/AdminShell";
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
    <AdminShell adminName={adminName}>{children}</AdminShell>
  );
}
