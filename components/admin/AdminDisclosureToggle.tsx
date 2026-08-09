"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

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
      className={adminButtonStyles("disclosure")}
    >
      {expanded ? <><ChevronUp aria-hidden="true" className="size-4" /> Collapse</> : <><ChevronDown aria-hidden="true" className="size-4" /> Expand</>}
    </button>
  );
}
