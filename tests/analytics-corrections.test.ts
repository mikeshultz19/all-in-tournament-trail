import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  countUniqueVisitorsSince,
  exactAnalyticsCount,
  fetchAllAnalyticsRows,
  pageNameForPath,
  startOfAnalyticsDay,
  startOfAnalyticsMonth,
  startOfAnalyticsWeek,
} from "@/lib/website-analytics";
import {
  analyticsSourceLabel,
  classifyAiReferrerDomain,
} from "@/lib/traffic-source";

describe("website analytics corrections", () => {
  it("paginates beyond 1,000 rows without truncating month activity", async () => {
    const source = Array.from({ length: 1_505 }, (_, index) => ({
      visitor_id: `visitor-${index}`,
      viewed_at: "2026-08-09T12:00:00.000Z",
    }));
    const pages: Array<[number, number]> = [];
    const rows = await fetchAllAnalyticsRows(async (from, to) => {
      pages.push([from, to]);
      return { data: source.slice(from, to + 1), error: null };
    });

    expect(rows).toHaveLength(1_505);
    expect(pages).toEqual([[0, 999], [1000, 1999]]);
    expect(countUniqueVisitorsSince(rows, new Date("2026-08-09T05:00:00.000Z")))
      .toBe(1_505);
  });

  it("counts distinct all-time visitors across multiple session pages", async () => {
    const source = [
      ...Array.from({ length: 1_000 }, (_, index) => ({ visitor_id: `visitor-${index}` })),
      ...Array.from({ length: 250 }, (_, index) => ({ visitor_id: `visitor-${index + 900}` })),
    ];
    const rows = await fetchAllAnalyticsRows(async (from, to) => ({
      data: source.slice(from, to + 1),
      error: null,
    }));
    expect(new Set(rows.map((row) => row.visitor_id)).size).toBe(1_150);
  });

  it("uses exact counts beyond 1,000 for sessions, page views, top pages, and interest", () => {
    expect(exactAnalyticsCount({ count: 1_189, error: null })).toBe(1_189);
    expect(exactAnalyticsCount({ count: 3_952, error: null })).toBe(3_952);
    expect(exactAnalyticsCount({ count: 1_675, error: null })).toBe(1_675);
    expect(exactAnalyticsCount({ count: 1_250, error: null })).toBe(1_250);
  });

  it("queries the true newest eight sessions for source attribution", () => {
    const source = readFileSync("lib/website-analytics.ts", "utf8");
    expect(source).toContain('.order("first_seen_at", { ascending: false })');
    expect(source).toContain(".limit(8)");
    expect(source).toContain("session_id,first_path,referrer_domain,utm_source,first_seen_at");
  });

  it("fails pagination instead of returning partial analytics rows", async () => {
    await expect(fetchAllAnalyticsRows(async (from, to) => ({
      data: from === 0 ? Array.from({ length: 1_000 }, () => ({ id: 1 })) : [],
      error: from === 0 ? null : new Error(`Failed range ${from}-${to}`),
    }))).rejects.toThrow("Failed range 1000-1999");
  });

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

  it("counts an old session's page-view activity in today, week, and month", () => {
    const views = [
      { visitor_id: "returning-visitor", viewed_at: "2026-08-09T12:00:00.000Z" },
    ];
    expect(countUniqueVisitorsSince(views, new Date("2026-08-09T05:00:00.000Z"))).toBe(1);
    expect(countUniqueVisitorsSince(views, new Date("2026-08-09T05:00:00.000Z"))).toBe(1);
    expect(countUniqueVisitorsSince(views, new Date("2026-08-01T05:00:00.000Z"))).toBe(1);
  });

  it("counts the same visitor once in each activity period", () => {
    const views = [
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T12:00:00.000Z" },
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T13:00:00.000Z" },
      { visitor_id: "visitor-a", viewed_at: "2026-08-09T14:00:00.000Z" },
    ];
    expect(countUniqueVisitorsSince(views, new Date("2026-08-09T05:00:00.000Z"))).toBe(1);
  });

  it("counts earlier-this-week activity in Week but not Today", () => {
    const views = [
      { visitor_id: "weekly-visitor", viewed_at: "2026-08-10T15:00:00.000Z" },
    ];
    expect(countUniqueVisitorsSince(views, startOfAnalyticsDay(new Date("2026-08-12T18:00:00.000Z")))).toBe(0);
    expect(countUniqueVisitorsSince(views, startOfAnalyticsWeek(new Date("2026-08-12T18:00:00.000Z")))).toBe(1);
  });

  it("counts earlier-this-month activity in Month but not Week", () => {
    const views = [
      { visitor_id: "monthly-visitor", viewed_at: "2026-08-03T15:00:00.000Z" },
    ];
    const now = new Date("2026-08-12T18:00:00.000Z");
    expect(countUniqueVisitorsSince(views, startOfAnalyticsWeek(now))).toBe(0);
    expect(countUniqueVisitorsSince(views, startOfAnalyticsMonth(now))).toBe(1);
  });

  it("uses America/Chicago calendar week and month boundaries", () => {
    const summer = new Date("2026-08-12T18:00:00.000Z");
    expect(startOfAnalyticsWeek(summer).toISOString()).toBe("2026-08-09T05:00:00.000Z");
    expect(startOfAnalyticsMonth(summer).toISOString()).toBe("2026-08-01T05:00:00.000Z");

    const winter = new Date("2026-01-15T18:00:00.000Z");
    expect(startOfAnalyticsWeek(winter).toISOString()).toBe("2026-01-11T06:00:00.000Z");
    expect(startOfAnalyticsMonth(winter).toISOString()).toBe("2026-01-01T06:00:00.000Z");
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
