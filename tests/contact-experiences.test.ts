import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public contact experiences", () => {
  const contactSource = readFileSync("components/FeedbackWidget.tsx", "utf8");
  const teamSource = readFileSync("components/AittTeamPopover.tsx", "utf8");

  it("uses the AITT business phone in the shared responsive Contact panel", () => {
    expect(contactSource).toContain('"817-841-9120"');
    expect(contactSource).toContain('"tel:+18178419120"');
    expect(contactSource).toContain("Call AITT Tournament Director");
    expect(contactSource).toContain("All In Tournament Trail");
  });

  it("retains the existing supporting Contact copy", () => {
    expect(contactSource).toContain("request a rule clarification");
    expect(contactSource).toContain("a website issue");
    expect(contactSource).toContain("Send the AITT team an email");
  });

  it("removes personal phone details from the team popover", () => {
    expect(teamSource).not.toContain("469-858-6203");
    expect(teamSource).not.toContain("817-692-5771");
    expect(teamSource).not.toContain("tel:+14698586203");
    expect(teamSource).not.toContain("tel:+18176925771");
    expect(teamSource).not.toContain("817-841-9120");
  });
});
