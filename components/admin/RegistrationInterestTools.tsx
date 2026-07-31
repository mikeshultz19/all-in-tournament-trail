"use client";

export default function RegistrationInterestTools({ emails }: { emails: string[] }) {
  async function copy() {
    await navigator.clipboard.writeText(emails.join(", "));
  }
  return <div className="flex gap-3"><a href="/admin/registration-interest/export" className="border border-[#4A3A12] px-4 py-2 text-xs font-bold uppercase text-[#D4A017]">Export CSV</a><button type="button" onClick={copy} className="bg-red-700 px-4 py-2 text-xs font-bold uppercase text-white">Copy All Emails</button></div>;
}
