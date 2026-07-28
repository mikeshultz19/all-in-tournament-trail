import {
  Check,
  Circle,
  CircleAlert,
  LockKeyhole,
} from "lucide-react";
import Link from "next/link";

import type {
  OperationItemStatus,
  TournamentOperationStep,
} from "@/lib/admin-tournament-operations";
import { formatAdminTournamentDate } from "@/lib/admin-tournaments";

const statusLabels: Record<OperationItemStatus, string> = {
  complete: "Complete",
  incomplete: "Needs attention",
  not_tracked: "Not tracked",
  not_available: "Not available",
};

function ChecklistIcon({ status }: { status: OperationItemStatus }) {
  if (status === "complete") {
    return <Check aria-hidden="true" className="size-4" />;
  }

  if (status === "not_available") {
    return <LockKeyhole aria-hidden="true" className="size-4" />;
  }

  if (status === "not_tracked") {
    return <Circle aria-hidden="true" className="size-4" />;
  }

  return <CircleAlert aria-hidden="true" className="size-4" />;
}

export default function TournamentOperationCard({
  step,
}: {
  step: TournamentOperationStep;
}) {
  const isCurrent = step.state === "current";

  return (
    <section
      aria-labelledby={`operation-step-${step.number}`}
      className={`border bg-[#111111] ${
        isCurrent
          ? "border-[#D4A017]/70"
          : step.state === "completed"
            ? "border-emerald-500/30"
            : "border-white/10"
      }`}
    >
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className={`text-xs font-black uppercase tracking-[0.18em] ${
                isCurrent ? "text-[#D4A017]" : "text-red-500"
              }`}
            >
              Step {step.number}
              {isCurrent ? " · Recommended Next" : ""}
            </p>
            <h2
              id={`operation-step-${step.number}`}
              className="mt-1 text-xl font-black uppercase text-white sm:text-2xl"
            >
              {step.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400">
              {step.purpose}
            </p>
          </div>

          <span
            className={`border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
              step.state === "completed"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : isCurrent
                  ? "border-[#D4A017]/50 bg-[#D4A017]/10 text-[#D4A017]"
                  : "border-white/10 text-neutral-500"
            }`}
          >
            {step.state === "completed"
              ? "Completed"
              : isCurrent
                ? "In Progress"
                : "Upcoming"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ul className="divide-y divide-white/10">
          {step.items.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3 px-5 py-4 sm:px-6"
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                  item.status === "complete"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : item.status === "incomplete"
                      ? "border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]"
                      : "border-white/10 text-neutral-500"
                }`}
              >
                <ChecklistIcon status={item.status} />
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-neutral-200">
                {item.label}
              </span>
              <span className="text-right text-xs font-bold text-neutral-500">
                {statusLabels[item.status]}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col border-t border-white/10 p-5 lg:border-l lg:border-t-0 sm:p-6">
          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Status
              </dt>
              <dd className="mt-1 font-semibold text-neutral-300">
                {step.state === "completed"
                  ? "Completed"
                  : step.state === "current"
                    ? "In Progress"
                    : "Upcoming"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Completed Date
              </dt>
              <dd className="mt-1 font-semibold text-neutral-300">
                {step.completedDate
                  ? formatAdminTournamentDate(step.completedDate)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-neutral-600">
                Completed By
              </dt>
              <dd className="mt-1 font-semibold text-neutral-300">
                {step.completedBy ?? "—"}
              </dd>
            </div>
          </dl>

          <Link
            href={step.actionHref}
            className={`mt-6 inline-flex min-h-12 items-center justify-center px-5 text-center text-xs font-black uppercase tracking-[0.12em] transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] lg:mt-auto ${
              isCurrent
                ? "bg-[#D4A017] text-black hover:bg-[#e2b22a]"
                : "border border-white/15 text-neutral-200 hover:border-[#D4A017]/70 hover:text-[#D4A017]"
            }`}
          >
            {step.actionLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
