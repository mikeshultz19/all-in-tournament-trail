import type { Metadata } from "next";

import Header from "@/components/Header";
import PolicyDocument from "@/components/PolicyDocument";
import { loadPolicyDocument } from "@/lib/policy-documents";

export const metadata: Metadata = {
  title: "Official Tournament Rules | All-In Tournament Trail",
  description: "Read the current All-In Tournament Trail Official Tournament Rules.",
};

function toPublicRulesSource(source: string): string {
  return source
    .replace(
      /> \*\*Draft notice:\*\*[\s\S]*?> publishes the applicable requirement\.\r?\n>\r?\n/,
      "",
    )
    .replace(
      /That document supersedes conflicting language in this Approved Draft\./,
      "That document supersedes conflicting language in these Official Tournament Rules.",
    )
    .replace(
      /^\*\*Pending approval:\*\*[^\r\n]*(?:\r?\n(?!\r?$)[^\r\n]*)*\r?\n?/gm,
      "",
    );
}

export default async function RulesPage() {
  const rules = await loadPolicyDocument("rules");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Rules" />
      <PolicyDocument
        source={toPublicRulesSource(rules.source)}
        version={rules.version}
        status={rules.status}
        effectiveDate={rules.effectiveDate}
        publicLabels={[
          "Official Tournament Rules",
          "2026–2027 Inaugural Season",
        ]}
      />
    </main>
  );
}
