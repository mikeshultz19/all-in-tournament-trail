import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
}));

import AdminShell from "@/components/admin/AdminShell";

describe("AdminShell", () => {
  it("renders admin route content inside the main region", () => {
    const markup = renderToStaticMarkup(
      <AdminShell>
        <section data-testid="admin-route-content">
          Admin route content
        </section>
      </AdminShell>,
    );

    expect(markup).toContain("<main");
    expect(markup).toContain('data-testid="admin-route-content"');
    expect(markup).toContain("Admin route content");
  });
});
