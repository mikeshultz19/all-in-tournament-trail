import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

import { renderPublishReadyDashboardWithManualReviewFixture } from "@/tests/admin-dashboard-fixture";

describe("tournament manager publish step historical review", () => {
  it("surfaces the unresolved Place 4 review inside the main Tournament Manager step", () => {
    const html = renderPublishReadyDashboardWithManualReviewFixture();

    expect(html).toContain("Historical Review Required");
    expect(html).toContain("Place 4");
    expect(html).toContain("Joe Johnson / Solo PhoneMatch");
    expect(html).toContain("Review");
  });
});
