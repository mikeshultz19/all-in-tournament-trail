import { Check } from "lucide-react";

import type { TournamentOperationStep } from "@/lib/admin-tournament-operations";

export default function TournamentProgress({
  steps,
}: {
  steps: readonly TournamentOperationStep[];
}) {
  return (
    <section aria-labelledby="tournament-progress-heading" className="mt-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-red-500">
        Tournament Progress
      </p>
      <h2
        id="tournament-progress-heading"
        className="mt-1 text-xl font-black uppercase text-white"
      >
        Operational Workflow
      </h2>

      <ol className="mt-5 grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.number}
            aria-current={step.state === "current" ? "step" : undefined}
            className={`border p-4 ${
              step.state === "current"
                ? "border-[#D4A017]/70 bg-[#D4A017]/10"
                : step.state === "completed"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-white/10 bg-[#111111]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black ${
                  step.state === "completed"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : step.state === "current"
                      ? "border-[#D4A017] bg-[#D4A017] text-black"
                      : "border-white/15 text-neutral-500"
                }`}
              >
                {step.state === "completed" ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  step.number
                )}
              </span>
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-neutral-500">
                  Step {step.number}
                </p>
                <h3 className="text-sm font-black uppercase text-white">
                  {step.title}
                </h3>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
