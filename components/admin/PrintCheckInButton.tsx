"use client";

import { adminButtonStyles } from "@/components/admin/admin-button-styles";

export default function PrintCheckInButton() {
  return <button type="button" onClick={() => window.print()} className={adminButtonStyles("secondary", "min-h-11")}>Print Check-In List</button>;
}
