import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname,
}));

import AdminSidebar from "@/components/admin/AdminSidebar";

describe("AdminSidebar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/admin/announcements");
  });

  it("shows the six primary Admin Console destinations", () => {
    const markup = renderToStaticMarkup(<AdminSidebar />);

    expect(markup).toContain("Home");
    expect(markup).toContain("Tournament Manager");
    expect(markup).toContain("Members");
    expect(markup).toContain("Website");
    expect(markup).toContain("Registration Review");
    expect(markup).toContain("Settings");
    expect(markup).toContain('href="/admin/tournament-manager"');
    expect(markup).toContain('href="/admin/registration-review"');
    expect(markup).toContain('href="/admin/announcements"');
    expect(markup).toContain('href="/admin/forms"');
    expect(markup).toContain('href="/admin/settings"');
    expect(markup).not.toContain("<svg");
  });

  it("marks the current route for assistive technology", () => {
    const markup = renderToStaticMarkup(<AdminSidebar />);

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain("Website");
  });

  it("marks Forms active on the Forms page", () => {
    usePathname.mockReturnValue("/admin/forms");

    const markup = renderToStaticMarkup(<AdminSidebar />);

    expect(markup).toMatch(
      /<a[^>]*aria-current="page"[^>]*href="\/admin\/forms"[^>]*>Forms<\/a>/,
    );
  });
});
