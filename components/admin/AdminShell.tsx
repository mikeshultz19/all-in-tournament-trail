import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import styles from "@/components/admin/AdminShell.module.css";

export default function AdminShell({
  adminName,
  children,
}: {
  adminName?: string | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0B0B0B] text-[#F2F2F2]">
      <AdminHeader adminName={adminName} />
      <div className={styles.body}>
        <AdminSidebar />
        <main className="min-w-0 px-5 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
