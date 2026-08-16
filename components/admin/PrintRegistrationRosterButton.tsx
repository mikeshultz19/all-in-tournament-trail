"use client";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

export default function PrintRegistrationRosterButton() {
  return <button type="button" onClick={() => window.print()} className={adminButtonStyles("primary")}>Print / Save PDF</button>;
}
