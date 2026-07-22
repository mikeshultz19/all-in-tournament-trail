import type { Metadata } from "next";

import Header from "@/components/Header";
import PolicyDocument from "@/components/PolicyDocument";
import { loadPolicyDocument } from "@/lib/policy-documents";

export const metadata: Metadata = {
  title: "Official Tournament Rules | All-In Tournament Trail",
  description: "Read the current All-In Tournament Trail Official Tournament Rules.",
};

export default async function RulesPage() {
  const rules = await loadPolicyDocument("rules");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Rules" />
      <PolicyDocument source={rules.source} version={rules.version} status={rules.status} effectiveDate={rules.effectiveDate} />
    </main>
  );
}
