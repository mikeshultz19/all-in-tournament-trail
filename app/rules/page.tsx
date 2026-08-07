import type { Metadata } from "next";

import Header from "@/components/Header";
import PolicyDocument from "@/components/PolicyDocument";
import { loadPolicyDocument } from "@/lib/policy-documents";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Official Tournament Rules",
  description:
    "Read the current All-In Tournament Trail Official Tournament Rules, including eligibility, practice restrictions, sonar rules, tournament procedures, AOY requirements, and Championship qualification.",
  alternates: {
    canonical: "/rules",
  },
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

function addQuickLinks(source: string): string {
  const quickLinks = [
    "## Quick Links",
    "",
    "- [Practice Rules](#practice-off-limits)",
    "- [Forward-Facing Sonar](#forward-facing-sonar)",
    "- [Registration](#registration)",
    "- [Membership](#membership)",
    "- [Team Rules](#team-rules)",
    "- [Angler of the Year](#angler-of-the-year)",
    "- [Championship Qualification](#championship-qualification)",
    "- [Boat & Safety](#boat-safety)",
    "- [Fishing Rules](#fishing-rules)",
    "- [Tournament Operations](#tournament-operations)",
    "- [Refund & Cancellation](#refund-cancellation-policy)",
    "- [Version History](#version-history)",
    "",
  ].join("\n");

  return source.replace(
    "## Table of Contents",
    `${quickLinks}## Complete Table of Contents`,
  );
}

export default async function RulesPage() {
  const rules = await loadPolicyDocument("rules");

  const publicSource = addQuickLinks(
    toPublicRulesSource(rules.source),
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Rules" />

      <PolicyDocument
        source={publicSource}
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