import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminLastUpdated from "@/components/admin/AdminLastUpdated";
import ManagementCard from "@/components/admin/ManagementCard";
import { CalendarDays } from "lucide-react";
import { formatAdminLastUpdated } from "@/lib/admin-last-updated";
import { renderAdminDashboardFixture } from "@/tests/admin-dashboard-fixture";

const NOW = new Date("2026-07-23T12:00:00");

describe("formatAdminLastUpdated", () => {
  it("formats an update from today without seconds", () => {
    expect(
      formatAdminLastUpdated(
        new Date("2026-07-23T09:22:00"),
        NOW,
        "en-US",
      ),
    ).toBe("Today at 9:22 AM");
  });

  it("formats an update from yesterday with its time", () => {
    expect(
      formatAdminLastUpdated(
        new Date("2026-07-22T18:14:00"),
        NOW,
        "en-US",
      ),
    ).toBe("Yesterday at 6:14 PM");
  });

  it("formats older updates as a staff-friendly calendar date", () => {
    expect(
      formatAdminLastUpdated(
        new Date("2026-07-20T12:00:00"),
        NOW,
        "en-US",
      ),
    ).toBe("July 20, 2026");
  });
});

describe("AdminLastUpdated", () => {
  it("renders placeholder metadata on all four dashboard cards", () => {
    const markup = renderAdminDashboardFixture();

    expect(markup.match(/Last Updated/g)).toHaveLength(4);
    expect(markup).toContain("July 20, 2026");
    expect(markup.match(/by AITT Staff/g)).toHaveLength(3);
    expect(markup).toContain("Never");
  });

  it("does not show an administrator when a section has never been updated", () => {
    const markup = renderToStaticMarkup(
      <AdminLastUpdated lastUpdatedDate={null} lastUpdatedBy="Jason" />,
    );

    expect(markup).toContain("Never");
    expect(markup).not.toContain("by Jason");
  });

  it("keeps metadata inside the fully clickable management card", () => {
    const markup = renderToStaticMarkup(
      <ManagementCard
        title="Tournament Information"
        description="Manage tournament information."
        href="/admin/tournament"
        icon={CalendarDays}
        statusItems={[
          { label: "Status", value: "Information Complete" },
        ]}
        lastUpdatedDate="2026-07-20T12:00:00-05:00"
        lastUpdatedBy="Jason"
      />,
    );

    expect(markup).toMatch(
      /^<a[^>]*href="\/admin\/tournament"[\s\S]*Last Updated[\s\S]*by Jason[\s\S]*<\/a>$/,
    );
    expect(markup).toContain("focus-visible:outline-2");
  });
});
