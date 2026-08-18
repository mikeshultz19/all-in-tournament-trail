import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AdminFormsPage from "@/app/admin/forms/page";

describe("AdminFormsPage", () => {
  it("keeps the approved registration form print and download actions", () => {
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

  it("provides the Bass Stack spreadsheet as the second form", () => {
    const markup = renderToStaticMarkup(<AdminFormsPage />);
    const registrationIndex = markup.indexOf(
      "Tournament-Morning Registration Form",
    );
    const bassStackIndex = markup.indexOf("Bass Stack Weigh-In Log");
    const bassStackPath = "/forms/AITT-Bass-Stack-Weigh-In-Log.xlsx";

    expect(registrationIndex).toBeGreaterThan(-1);
    expect(bassStackIndex).toBeGreaterThan(registrationIndex);
    expect(markup).toContain(
      "125-team paper backup scoring sheet with 25 weigh-in cycles, Total Weight, and Total Fish.",
    );
    expect(markup.match(new RegExp(bassStackPath, "g"))).toHaveLength(1);
    expect(markup).toContain(
      'href="/admin/forms/bass-stack-weigh-log/print"',
    );
    expect(markup.slice(bassStackIndex)).toContain("Print View");
    expect(markup).toContain(
      'download="AITT-Bass-Stack-Weigh-In-Log.xlsx"',
    );
    expect(markup).toContain("Download Spreadsheet");
  });

  it("provides print/view and download actions for the DR log as the third form", () => {
    const markup = renderToStaticMarkup(<AdminFormsPage />);
    const bassStackIndex = markup.indexOf("Bass Stack Weigh-In Log");
    const drIndex = markup.indexOf("Bass Stack DR Weigh-In Log");
    const drPath = "/forms/AITT-Bass-Stack-DR-Weigh-In-Log.xlsx";

    expect(drIndex).toBeGreaterThan(bassStackIndex);
    expect(markup).toContain(
      "Simple paper disaster-recovery weigh-in log for recording each weigh-in event by Boat #, Team Name, Fish Count, Weight, and Recorder Initials.",
    );
    expect(markup.match(new RegExp(drPath, "g"))).toHaveLength(1);
    expect(markup).toContain(
      'href="/admin/forms/bass-stack-dr-log/print"',
    );
    expect(markup).toContain("Print View");
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
    expect(markup).toContain(
      'download="AITT-Bass-Stack-DR-Weigh-In-Log.xlsx"',
    );
  });
});
