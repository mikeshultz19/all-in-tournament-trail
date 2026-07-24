import { ArrowRight, Check, Circle, CircleAlert } from "lucide-react";
import Link from "next/link";

export interface ReadinessChecklistItem {
  label: string;
  complete: boolean;
  href?: string;
}

interface WebsiteReadinessProps {
  preTournamentItems: readonly ReadinessChecklistItem[];
  postTournamentItems: readonly ReadinessChecklistItem[];
}

interface ChecklistSectionProps {
  title: string;
  description: string;
  items: readonly ReadinessChecklistItem[];
  phase: "before" | "after";
}

function ChecklistItem({
  item,
  phase,
}: {
  item: ReadinessChecklistItem;
  phase: ChecklistSectionProps["phase"];
}) {
  const statusLabel = item.complete
    ? "Complete"
    : phase === "before"
      ? "Needs Attention"
      : "Upcoming";

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          item.complete
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-neutral-600 bg-white/[0.03] text-neutral-500"
        }`}
      >
        {item.complete ? (
          <Check className="size-3.5" strokeWidth={2.5} />
        ) : (
          <Circle className="size-3" strokeWidth={2} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-neutral-200">
          {item.label}
        </span>
        <span
          className={`mt-1 block text-xs font-bold ${
            item.complete
              ? "text-neutral-500"
              : phase === "before"
                ? "text-[#D4A017]"
                : "text-neutral-500"
          }`}
        >
          {statusLabel}
        </span>
      </span>
      {!item.complete && item.href && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-[#D4A017]"
        />
      )}
    </>
  );

  return (
    <li className="border-t border-white/10 first:border-t-0">
      {!item.complete && item.href ? (
        <Link
          href={item.href}
          aria-label={`${phase === "before" ? "Review" : "Open"} ${item.label}`}
          className="group flex min-h-16 items-center gap-3 py-3 transition-colors hover:bg-white/[0.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-h-16 items-center gap-3 py-3">{content}</div>
      )}
    </li>
  );
}

function ChecklistSection({
  title,
  description,
  items,
  phase,
}: ChecklistSectionProps) {
  return (
    <section
      aria-labelledby={`${phase}-tournament-heading`}
      className={phase === "after" ? "bg-white/[0.02]" : undefined}
    >
      <div className="border-b border-white/10 px-6 py-5 sm:px-7">
        <h2
          id={`${phase}-tournament-heading`}
          className="text-lg font-black uppercase tracking-tight text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
      </div>
      <ul className="px-6 sm:px-7">
        {items.map((item) => (
          <ChecklistItem key={item.label} item={item} phase={phase} />
        ))}
      </ul>
    </section>
  );
}

export default function WebsiteReadiness({
  preTournamentItems,
  postTournamentItems,
}: WebsiteReadinessProps) {
  const setupComplete = preTournamentItems.every((item) => item.complete);
  const setupLabel = setupComplete
    ? "Tournament Setup Complete"
    : "Tournament Setup Incomplete";

  return (
    <section
      aria-labelledby="website-readiness-heading"
      className="border border-white/10 bg-[#111111]"
    >
      <div className="border-b border-white/10 px-6 py-6 sm:px-7">
        <h1
          id="website-readiness-heading"
          className="text-xs font-black uppercase tracking-[0.22em] text-red-500"
        >
          Website Readiness
        </h1>

        <div className="mt-3 flex items-center gap-3">
          <span
            role="img"
            aria-label={`Status: ${setupLabel}`}
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
              setupComplete
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-[#D4A017]/50 bg-[#D4A017]/10 text-[#D4A017]"
            }`}
          >
            {setupComplete ? (
              <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            ) : (
              <CircleAlert
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2}
              />
            )}
          </span>
          <p className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            {setupLabel}
          </p>
        </div>

      </div>

      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-white/10">
        <ChecklistSection
          title="Before the Tournament"
          description="Complete these items before tournament day."
          items={preTournamentItems}
          phase="before"
        />
        <ChecklistSection
          title="After the Tournament"
          description="Complete these items after weigh-in before publishing the official results."
          items={postTournamentItems}
          phase="after"
        />
      </div>
    </section>
  );
}
