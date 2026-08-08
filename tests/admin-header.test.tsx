import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import AdminHeader from "@/components/admin/AdminHeader";

describe("AdminHeader", () => {
  const markup = renderToStaticMarkup(<AdminHeader adminName="Mike" />);

  it("shows the AITT branding and administrator context", () => {
    expect(markup).toContain('alt="All-In Tournament Trail"');
    expect(markup).toContain("AITT Admin Center");
    expect(markup).toContain(
      "Tournament Administration &amp; Website Management",
    );
    expect(markup).toContain("Mike");
    expect(markup).toContain("Log Out");
    expect(markup).not.toContain("Tournament Administrator");
    expect(markup).not.toContain("Welcome");
  });

  it("preserves Admin Center branding and public website navigation", () => {
    expect(markup).toContain('href="/admin"');
    expect(markup).toContain("Log Out");
    expect(markup).toContain('href="/"');
    expect(markup).toContain("focus-visible:outline-2");
    expect(markup).not.toContain('href="/admin/members"');
  });

  it("uses a stacked mobile layout and horizontal desktop layout", () => {
    expect(markup).toContain("flex-col");
    expect(markup).toContain("md:flex-row");
  });
});
