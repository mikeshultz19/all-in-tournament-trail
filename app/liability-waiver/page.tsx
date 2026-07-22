import type { Metadata } from "next";

import Header from "@/components/Header";
import PolicyDocument from "@/components/PolicyDocument";
import { loadPolicyDocument } from "@/lib/policy-documents";

export const metadata: Metadata = {
  title: "Participant Liability Waiver | All-In Tournament Trail",
  description: "Review the All-In Tournament Trail Participant Liability Waiver and Assumption of Risk.",
};

export default async function LiabilityWaiverPage() {
  const waiver = await loadPolicyDocument("liability-waiver");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header />
      <PolicyDocument source={waiver.source} version={waiver.version} status={waiver.status} effectiveDate={waiver.effectiveDate} />
    </main>
  );
}
