import {
  ArrowRight,
  Check,
  CircleAlert,
} from "lucide-react";
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

function PreTournamentControl({
  item,
}: {
  item: ReadinessChecklistItem;
}) {
  const content = (
    <>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
          item.complete
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]"
        }`}
      >
        {item.complete ? (
          <Check
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.5}
          />
        ) : (
          <CircleAlert
            aria-hidden="true"
            className="size-4"
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black uppercase text-white">
          {item.label}
        </span>

        <span
          className={`mt-1 block text-xs font-semibold ${
            item.complete
              ? "text-emerald-400"
              : "text-[#D4A017]"
          }`}
        >
          {item.complete
            ? "Ready — open to review or change"
            : "Needs attention"}
        </span>
      </span>

      {item.href && (
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-neutral-600 transition group-hover:translate-x-1 group-hover:text-[#D4A017]"
        />
      )}
    </>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="group flex min-h-20 items-center gap-3 border border-white/10 bg-[#111111] p-4 transition hover:border-[#D4A017]/40 hover:bg-white/[0.03]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex min-h-20 items-center gap-3 border border-white/10 bg-[#111111] p-4">
      {content}
    </div>
  );
}

function PostTournamentStatus({
  item,
}: {
  item: ReadinessChecklistItem;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4 first:border-t-0">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
          item.complete
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
            : "border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]"
        }`}
      >
        {item.complete ? (
          <Check
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.5}
          />
        ) : (
          <CircleAlert
            aria-hidden="true"
            className="size-4"
          />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-neutral-200">
          {item.label}
        </span>

        <span
          className={`mt-1 block text-xs font-semibold ${
            item.complete
              ? "text-emerald-400"
              : "text-[#D4A017]"
          }`}
        >
          {item.complete ? "Complete" : "Needs attention"}
        </span>
      </span>
    </div>
  );
}

export default function WebsiteReadiness({
  preTournamentItems,
  postTournamentItems,
}: WebsiteReadinessProps) {
  const preCompleteCount = preTournamentItems.filter(
    (item) => item.complete,
  ).length;

  const postCompleteCount = postTournamentItems.filter(
    (item) => item.complete,
  ).length;

  const postRemainingCount =
    postTournamentItems.length - postCompleteCount;

  return (
    <section aria-labelledby="tournament-controls-heading">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
          Tournament Controls
        </p>

        <h2
          id="tournament-controls-heading"
          className="mt-1 text-xl font-black uppercase text-white"
        >
          Tournament Setup
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
          These controls remain available through tournament day.
          Open any item to review or change tournament information,
          registration details, ramp information, or announcements.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <span className="border border-white/10 bg-[#111111] px-3 py-2 text-neutral-400">
          <strong className="text-white">
            {preCompleteCount}
          </strong>{" "}
          of{" "}
          <strong className="text-white">
            {preTournamentItems.length}
          </strong>{" "}
          currently ready
        </span>

        <span className="text-xs text-neutral-600">
          Ready items can still be opened and changed.
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {preTournamentItems.map((item) => (
          <PreTournamentControl
            key={item.label}
            item={item}
          />
        ))}
      </div>

      <div className="mt-8 border border-white/10 bg-[#111111]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
              After Weigh-In
            </p>

            <h2 className="mt-1 text-lg font-black uppercase text-white">
              Post-Tournament Progress
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-neutral-500">
              This section is status only. Use the yellow Update
              Tournament button above to complete these steps.
            </p>
          </div>

          <span
            className={`inline-flex w-fit border px-3 py-2 text-xs font-black uppercase ${
              postRemainingCount === 0
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]"
            }`}
          >
            {postRemainingCount === 0
              ? "Complete"
              : `${postRemainingCount} ${
                  postRemainingCount === 1
                    ? "item"
                    : "items"
                } remaining`}
          </span>
        </div>

        <div>
          {postTournamentItems.map((item) => (
            <PostTournamentStatus
              key={item.label}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}