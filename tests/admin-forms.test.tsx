import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminFormsPage from "@/app/admin/forms/page";

describe("AdminFormsPage", () => {
  it("provides print and download actions for the approved form asset", () => {
    const markup = renderToStaticMarkup(<AdminFormsPage />);
    const pdfPath = "/forms/AITT-Tournament-Morning-Registration-Form.pdf";

    expect(markup).toContain("AITT Forms");
    expect(markup).toContain("Tournament-Morning Registration Form");
    expect(markup).toContain(
      "Printable one-page registration form for anglers registering at the ramp.",
    );
    expect(markup.match(new RegExp(pdfPath, "g"))).toHaveLength(2);
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain(
      'download="AITT-Tournament-Morning-Registration-Form.pdf"',
    );
  });
});
