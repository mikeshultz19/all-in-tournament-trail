import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import AdminCardStatus, {
  type AdminCardStatusItem,
} from "@/components/admin/AdminCardStatus";
import AdminLastUpdated from "@/components/admin/AdminLastUpdated";

interface ManagementCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  statusItems: readonly AdminCardStatusItem[];
  lastUpdatedDate: string | Date | null;
  lastUpdatedBy?: string | null;
}

export default function ManagementCard({
  title,
  description,
  href,
  icon: Icon,
  statusItems,
  lastUpdatedDate,
  lastUpdatedBy,
}: ManagementCardProps) {
  return (
    <Link
      href={href}
      className="group flex min-h-52 flex-col border border-white/10 bg-[#111111] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#D4A017]/70 hover:bg-[#151515] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center border border-red-500/40 bg-red-500/10 text-red-500 transition-colors group-hover:border-[#D4A017]/50 group-hover:text-[#D4A017]">
          <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-5 text-neutral-600 transition group-hover:translate-x-1 group-hover:text-[#D4A017]"
        />
      </div>

      <h2 className="mt-6 text-xl font-black uppercase tracking-tight text-white">
        {title}
      </h2>
      <p className="mb-6 mt-3 text-sm leading-6 text-neutral-400">
        {description}
      </p>
      <AdminCardStatus items={statusItems} />
      <AdminLastUpdated
        lastUpdatedDate={lastUpdatedDate}
        lastUpdatedBy={lastUpdatedBy}
      />
    </Link>
  );
}
