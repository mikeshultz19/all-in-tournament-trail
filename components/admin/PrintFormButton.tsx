"use client";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

export default function PrintFormButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={adminButtonStyles("primary")}
    >
      Print
    </button>
  );
}
