import type { ReactNode } from "react";

export type AdminStatusTone = "positive" | "attention" | "neutral" | "critical";

const toneClasses: Record<AdminStatusTone, string> = {
  positive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  attention: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  neutral: "border-white/10 bg-white/5 text-neutral-400",
  critical: "border-red-500/35 bg-red-500/10 text-red-300",
};

export function getAdminStatusTone(status: string): AdminStatusTone {
  const normalized = status.trim().toLowerCase();
  if (["ready", "complete", "completed", "published", "checked in"].includes(normalized)) return "positive";
  if (["needs review", "needs attention", "not ready", "in progress", "pending"].includes(normalized)) return "attention";
  if (["blocked", "error", "disqualified", "dq"].includes(normalized)) return "critical";
  return "neutral";
}

export default function AdminStatusBadge({ children, tone, className = "" }: { children: ReactNode; tone?: AdminStatusTone; className?: string }) {
  const resolvedTone = tone ?? getAdminStatusTone(String(children));
  return <span className={`inline-flex min-h-6 items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${toneClasses[resolvedTone]} ${className}`}>{children}</span>;
}
