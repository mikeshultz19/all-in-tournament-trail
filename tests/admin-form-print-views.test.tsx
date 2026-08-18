import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminUser } = vi.hoisted(() => ({
  requireAdminUser: vi.fn(),
}));
const printButtonSource = readFileSync(
  "components/admin/PrintFormButton.tsx",
  "utf8",
);

vi.mock("@/lib/admin-auth", () => ({ requireAdminUser }));

import BassStackDrLogPrintPage from "@/app/admin/forms/bass-stack-dr-log/print/page";
import BassStackWeighLogPrintPage from "@/app/admin/forms/bass-stack-weigh-log/print/page";

describe("Admin spreadsheet print views", () => {
  beforeEach(() => {
    requireAdminUser.mockReset();
    requireAdminUser.mockResolvedValue({ id: "admin-user" });
  });

  it("protects and renders the 125-team log in five printable cycle sections", async () => {
    const markup = renderToStaticMarkup(await BassStackWeighLogPrintPage());

    expect(requireAdminUser).toHaveBeenCalledOnce();
    expect(markup).toContain("Bass Stack Weigh-In Log");
    expect(markup).toContain("Cycles 1–5 of 25");
    expect(markup).toContain("Cycles 21–25 of 25");
    expect(markup).toContain("Total Weight");
    expect(markup).toContain("Total Fish");
    expect(markup).toContain("Weigh-In 25");
    expect(markup).toContain(">Print</button>");
    expect(printButtonSource).toContain("window.print()");
    expect(markup).toContain("size: landscape");
    expect(markup).toContain("display: table-header-group");
  });

  it("protects and renders the 100-line handwriting-friendly DR log", async () => {
    const markup = renderToStaticMarkup(await BassStackDrLogPrintPage());

    expect(requireAdminUser).toHaveBeenCalledOnce();
    expect(markup).toContain("Bass Stack DR Weigh-In Log");
    expect(markup).toContain("Line #");
    expect(markup).toContain("Boat #");
    expect(markup).toContain("Team Name");
    expect(markup).toContain("# Fish");
    expect(markup).toContain("Weight");
    expect(markup).toContain("Initials");
    expect(markup).toContain(">Print</button>");
    expect(printButtonSource).toContain("window.print()");
    expect(markup).toContain("size: portrait");
    expect(markup).toContain("display: table-header-group");
  });
});
