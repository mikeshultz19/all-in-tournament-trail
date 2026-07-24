import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminUserInfo from "@/components/admin/AdminUserInfo";

describe("AdminUserInfo", () => {
  it("renders only the provided name and its first initial", () => {
    const markup = renderToStaticMarkup(<AdminUserInfo name="Mike" />);

    expect(markup).toContain("Mike");
    expect(markup).toMatch(/aria-hidden="true"[^>]*>M<\/span>/);
    expect(markup).not.toContain("Tournament Administrator");
    expect(markup).not.toContain("Welcome");
    expect(markup).toContain('aria-haspopup="menu"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("lucide-chevron-down");
  });

  it("does not hardcode the displayed user", () => {
    const markup = renderToStaticMarkup(<AdminUserInfo name="Jennifer" />);

    expect(markup).toContain("Jennifer");
    expect(markup).toMatch(/aria-hidden="true"[^>]*>J<\/span>/);
  });

  it("renders Log Out disabled when no real logout handler exists", () => {
    const markup = renderToStaticMarkup(<AdminUserInfo name="Mike" />);

    expect(markup).toContain("Log Out");
    expect(markup).toContain("lucide-log-out");
    expect(markup).toMatch(/role="menuitem"[^>]*disabled=""/);
  });
});
