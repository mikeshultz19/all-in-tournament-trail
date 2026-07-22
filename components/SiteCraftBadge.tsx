import Link from "next/link";

import SiteCraftMark from "@/components/SiteCraftMark";

const accessibleLabel =
  "Designed and developed by SiteCraft. Contact us about web design.";

export default function SiteCraftBadge() {
  return (
    <Link
      aria-label={accessibleLabel}
      className="group inline-flex min-h-11 items-center justify-center gap-3 rounded-sm px-2 py-1.5 text-[#D4A017] opacity-[0.68] transition-[opacity,transform,filter] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:drop-shadow-[0_0_7px_rgba(212,160,23,0.28)] focus-visible:-translate-y-0.5 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017] focus-visible:drop-shadow-[0_0_7px_rgba(212,160,23,0.28)] motion-reduce:transform-none"
      href="/contact"
      title="Designed & Developed by SiteCraft — Need a website like this? Contact us."
    >
      <SiteCraftMark
        className="shrink-0 transition-colors duration-200 group-hover:text-yellow-400 group-focus-visible:text-yellow-400"
        size={28}
      />
      <span aria-hidden="true" className="h-7 w-px bg-[#D4A017]/45" />
      <span className="text-left leading-none">
        <span className="block text-[13px] font-semibold tracking-[0.08em] text-zinc-100">
          SiteCraft
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#D4A017] transition-colors duration-200 group-hover:text-yellow-400 group-focus-visible:text-yellow-400">
          Web Design
        </span>
      </span>
    </Link>
  );
}
