import type { Metadata } from "next";

import Header from "@/components/Header";
import PolicyDocument from "@/components/PolicyDocument";
import { loadPolicyDocument } from "@/lib/policy-documents";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Official Tournament Rules | All-In Tournament Trail",
  description:
    "Read the current All-In Tournament Trail Official Tournament Rules.",
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

function addScheduleReturnLink(source: string): string {
  const nextSectionAnchor = '<a id="tournament-operations"></a>';

  const returnLink = [
    "",
    "---",
    "",
    "[← Back to Tournament Schedule](/schedule)",
    "",
  ].join("\n");

  return source.replace(
    nextSectionAnchor,
    `${returnLink}${nextSectionAnchor}`,
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
type RulesPageProps = {
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function RulesPage({
  searchParams,
}: RulesPageProps) {
  const rules = await loadPolicyDocument("rules");
  const params = await searchParams;

  let publicSource = addQuickLinks(
  toPublicRulesSource(rules.source),
);

  if (params.from === "schedule") {
    publicSource = addScheduleReturnLink(publicSource);
  }

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