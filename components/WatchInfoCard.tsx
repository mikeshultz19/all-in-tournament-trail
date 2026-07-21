import type { ReactNode } from "react";

export default function WatchInfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="border border-[#5B4715] bg-[#131313] p-5 sm:p-6">
      <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#D4A017]">{title}</h2>
      <div className="mt-4 text-sm leading-6 text-zinc-300">{children}</div>
    </article>
  );
}
