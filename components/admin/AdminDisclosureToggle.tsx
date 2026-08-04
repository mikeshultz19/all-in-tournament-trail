"use client";

export default function AdminDisclosureToggle({
  expanded,
  controls,
  onToggle,
}: {
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="inline-flex min-h-10 items-center justify-center px-3 text-xs font-black uppercase text-neutral-300 transition hover:text-white"
    >
      {expanded ? "▲ Collapse" : "▼ Expand"}
    </button>
  );
}