import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  countUniqueVisitorsSince,
  pageNameForPath,
  startOfAnalyticsDay,
} from "@/lib/website-analytics";
import {
  analyticsSourceLabel,
  classifyAiReferrerDomain,
} from "@/lib/traffic-source";

describe("website analytics corrections", () => {
  it("counts a unique visitor active today from page views", () => {
    const boundary = new Date("2026-08-09T05:00:00.000Z");
    expect(countUniqueVisitorsSince([
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T05:01:00.000Z" },
    ], boundary)).toBe(1);
  });

  it("counts multiple page views from the same visitor once", () => {
    const boundary = new Date("2026-08-09T05:00:00.000Z");
    expect(countUniqueVisitorsSince([
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T06:00:00.000Z" },
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T07:00:00.000Z" },
    ], boundary)).toBe(1);
  });

  it("counts today's page view without depending on when its session was created", () => {
    const boundary = new Date("2026-08-09T05:00:00.000Z");
    const pageViewsFromAnOldSession = [
      { visitor_id: "returning-visitor", viewed_at: "2026-08-09T12:00:00.000Z" },
    ];
    expect(countUniqueVisitorsSince(pageViewsFromAnOldSession, boundary)).toBe(1);
  });

  it("uses the America/Chicago calendar-day boundary", () => {
    expect(startOfAnalyticsDay(new Date("2026-08-09T18:00:00.000Z")).toISOString())
      .toBe("2026-08-09T05:00:00.000Z");
  });

  it("handles daylight-saving changes at Texas midnight", () => {
    expect(startOfAnalyticsDay(new Date("2026-01-15T18:00:00.000Z")).toISOString())
      .toBe("2026-01-15T06:00:00.000Z");
    expect(startOfAnalyticsDay(new Date("2026-07-15T18:00:00.000Z")).toISOString())
      .toBe("2026-07-15T05:00:00.000Z");
    expect(startOfAnalyticsDay(new Date("2026-03-09T18:00:00.000Z")).toISOString())
      .toBe("2026-03-09T05:00:00.000Z");
  });

  it("normalizes ChatGPT and OpenAI referral domains", () => {
    expect(classifyAiReferrerDomain("chatgpt.com")).toBe("ChatGPT");
    expect(classifyAiReferrerDomain("chat.openai.com")).toBe("ChatGPT");
    expect(classifyAiReferrerDomain("openai.com")).toBe("OpenAI");
  });

  it("keeps unknown referrer domains raw", () => {
    expect(analyticsSourceLabel({ referrerDomain: "example.com" })).toBe("example.com");
  });

  it("gives a recognized UTM source precedence over the referrer", () => {
    expect(analyticsSourceLabel({ utmSource: "chatgpt", referrerDomain: "openai.com" }))
      .toBe("ChatGPT");
  });

  it("captures and persists the raw UTM source on the landing event", () => {
    const tracker = readFileSync("components/WebsiteAnalyticsTracker.tsx", "utf8");
    const route = readFileSync("app/api/analytics/page-view/route.ts", "utf8");
    expect(tracker).toContain('get("utm_source")');
    expect(tracker).toContain("utmSource");
    expect(route).toContain("utm_source: utmSource");
  });

  it("leaves referrerless untagged traffic as Direct", () => {
    expect(analyticsSourceLabel({ utmSource: null, referrerDomain: null })).toBe("Direct");
  });

  it.each([
    ["/faq", "FAQ"],
    ["/insurance-pot", "Insurance Pot"],
    ["/bass-stack", "Bass Stack"],
    ["/watch", "Watch"],
  ])("accepts tracked public route %s", (path, category) => {
    expect(pageNameForPath(path)).toBe(category);
  });
});
