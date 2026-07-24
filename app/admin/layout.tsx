import type { ReactNode } from "react";

import AdminHeader from "@/components/admin/AdminHeader";
import AdminWarningBanner from "@/components/admin/AdminWarningBanner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        <AdminWarningBanner />
        <div className="mt-6 sm:mt-8">{children}</div>
      </main>
    </div>
  );
}
