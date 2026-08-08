import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import AdminShell from "@/components/admin/AdminShell";

describe("AdminShell", () => {
  it("renders the shared header, sidebar, and page content", () => {
    const markup = renderToStaticMarkup(
      <AdminShell adminName="Mike">
        <section>Admin page content</section>
      </AdminShell>,
    );

    expect(markup).toContain("AITT Admin Center");
    expect(markup).toContain('aria-label="Admin navigation"');
    expect(markup).toMatch(/class="[^"]*body[^"]*"/);
    expect(markup).toContain("Admin page content");
    expect(markup).not.toContain(
      "Changes made here are reflected on the production website",
    );
  });
});
