import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/app/admin/tournament-manager/import/workflow-actions", () => ({
  resetImportedResultsAction: vi.fn(),
  setImportedResultDisqualificationAction: vi.fn(),
  verifyImportedResultsAction: vi.fn(),
}));

import ImportedResultsReview, { type ImportedRow } from "@/components/admin/ImportedResultsReview";

const rows: ImportedRow[] = [
  { id: "eligible-1", place: 1, team_name: "Eligible Team", total_weight: 20, big_fish_weight: 5, bronze_payout: 100, silver_payout: 0, gold_payout: 0, participation_status: "participated" },
  { id: "dq-1", place: 2, team_name: "Jeff Silver", total_weight: 18, big_fish_weight: 4, bronze_payout: 0, silver_payout: 0, gold_payout: 0, participation_status: "disqualified" },
  { id: "dq-2", place: 3, team_name: "Second DQ", total_weight: 17, big_fish_weight: 3, bronze_payout: 0, silver_payout: 0, gold_payout: 0, participation_status: "disqualified" },
];

describe("DQ management UI", () => {
  it("shows every persisted DQ in a separate removable list after refresh", () => {
    const markup = renderToStaticMarkup(<ImportedResultsReview tournamentId="tournament-1" tournamentSlug="event" rows={rows} verified published={false} />);
    expect(markup).toContain("Disqualified Entries");
    expect(markup).toContain("Jeff Silver");
    expect(markup).toContain("Second DQ");
    expect(markup.match(/Remove DQ/g)).toHaveLength(2);
  });

  it("keeps DQ management separate from Reset Import and excludes DQ rows from the mark selector", () => {
    const markup = renderToStaticMarkup(<ImportedResultsReview tournamentId="tournament-1" tournamentSlug="event" rows={rows} verified published={false} />);
    expect(markup).toContain("Reset Import");
    expect(markup).toContain("Disqualify Entry");
    expect(markup).toContain('<option value="eligible-1">Eligible Team</option>');
    expect(markup).not.toContain('<option value="dq-1">');
    expect(markup).not.toContain('<option value="dq-2">');
  });

  it("locks removal after publication without deleting the internal DQ history", () => {
    const markup = renderToStaticMarkup(<ImportedResultsReview tournamentId="tournament-1" tournamentSlug="event" rows={rows} verified published />);
    expect(markup).toContain("Disqualified Entries");
    expect(markup.match(/Locked/g)).toHaveLength(2);
    expect(markup).not.toContain("Remove DQ");
  });
});
