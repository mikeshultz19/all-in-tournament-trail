import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const TRACKED_PAGES: Record<string, string> = {
  "/": "Homepage",
  "/schedule": "Schedule",
  "/register": "Registration",
  "/rules": "Rules",
  "/faq": "FAQ",
  "/how-it-works": "How It Works",
  "/insurance-pot": "Insurance Pot",
  "/bass-stack": "Bass Stack",
  "/watch": "Watch",
  "/no-forward-facing-sonar": "No Forward-Facing Sonar",
  "/aoy-points": "AOY Points",
  "/sponsors": "Sponsors",
  "/winner-circle": "Winner Circle",
  "/standings": "AOY Standings",
  "/results": "Tournament Results",
  "/contact": "Contact",
};
export const TRACKED_PAGE_NAMES = [
  "Homepage", "Schedule", "Registration", "Rules", "FAQ", "Sponsors",
  "Winner Circle", "AOY Standings", "Tournament Results", "Contact",
  "How It Works", "Insurance Pot", "Bass Stack", "Watch",
  "No Forward-Facing Sonar", "AOY Points",
] as const;

export function pageNameForPath(path: string): string | null {
  if (path.startsWith("/results/")) return "Tournament Results";
  return TRACKED_PAGES[path] ?? null;
}

export const AITT_ANALYTICS_TIME_ZONE = "America/Chicago";

function zonedParts(value: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function zonedMidnight(
  year: number,
  month: number,
  day: number,
  timeZone: string,
) {
  const targetWallTime = Date.UTC(year, month - 1, day);
  let candidate = targetWallTime;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const observed = zonedParts(new Date(candidate), timeZone);
    const observedWallTime = Date.UTC(
      observed.year,
      observed.month - 1,
      observed.day,
      observed.hour,
      observed.minute,
      observed.second,
    );
    candidate += targetWallTime - observedWallTime;
  }

  return new Date(candidate);
}

export function startOfAnalyticsDay(
  value: Date,
  timeZone = AITT_ANALYTICS_TIME_ZONE,
) {
  const localDate = zonedParts(value, timeZone);
  return zonedMidnight(
    localDate.year,
    localDate.month,
    localDate.day,
    timeZone,
  );
}

export function startOfAnalyticsWeek(
  value: Date,
  timeZone = AITT_ANALYTICS_TIME_ZONE,
) {
  const localDate = zonedParts(value, timeZone);
  const localCalendarDate = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day),
  );
  localCalendarDate.setUTCDate(
    localCalendarDate.getUTCDate() - localCalendarDate.getUTCDay(),
  );
  return zonedMidnight(
    localCalendarDate.getUTCFullYear(),
    localCalendarDate.getUTCMonth() + 1,
    localCalendarDate.getUTCDate(),
    timeZone,
  );
}

export function startOfAnalyticsMonth(
  value: Date,
  timeZone = AITT_ANALYTICS_TIME_ZONE,
) {
  const localDate = zonedParts(value, timeZone);
  return zonedMidnight(localDate.year, localDate.month, 1, timeZone);
}

export function countUniqueVisitorsSince(
  rows: readonly { visitor_id: string; viewed_at: string }[],
  boundary: Date,
) {
  return new Set(
    rows
      .filter((row) => new Date(row.viewed_at) >= boundary)
      .map((row) => row.visitor_id),
  ).size;
}

const ANALYTICS_PAGE_SIZE = 1000;

export async function fetchAllAnalyticsRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<{
    data: T[] | null;
    error: unknown;
  }>,
  pageSize = ANALYTICS_PAGE_SIZE,
) {
  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const response = await fetchPage(from, from + pageSize - 1);
    if (response.error) throw response.error;
    const page = response.data ?? [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

export function exactAnalyticsCount(response: {
  count: number | null;
  error: unknown;
}) {
  if (response.error || typeof response.count !== "number") {
    throw response.error ?? new Error("Analytics count was unavailable.");
  }
  return response.count;
}

export async function getAnalyticsDashboard() {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const startToday = startOfAnalyticsDay(now);
  const startWeek = startOfAnalyticsWeek(now);
  const startMonth = startOfAnalyticsMonth(now);

  try {
    const [
      monthViewRows,
      sessionVisitorRows,
      sessionCountResponse,
      pageViewCountResponse,
      interestCountResponse,
      recentSessionsResponse,
      recentInterestResponse,
      topPageResponses,
    ] = await Promise.all([
      fetchAllAnalyticsRows<{ visitor_id: string; viewed_at: string }>((from, to) =>
        supabase
          .from("website_page_views")
          .select("visitor_id,viewed_at")
          .gte("viewed_at", startMonth.toISOString())
          .order("viewed_at", { ascending: true })
          .range(from, to),
      ),
      fetchAllAnalyticsRows<{ visitor_id: string }>((from, to) =>
        supabase
          .from("website_analytics_sessions")
          .select("visitor_id")
          .order("visitor_id", { ascending: true })
          .range(from, to),
      ),
      supabase
        .from("website_analytics_sessions")
        .select("session_id", { count: "exact", head: true }),
      supabase
        .from("website_page_views")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("registration_interest")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("website_analytics_sessions")
        .select("session_id,first_path,referrer_domain,utm_source,first_seen_at")
        .order("first_seen_at", { ascending: false })
        .limit(8),
      supabase
        .from("registration_interest")
        .select("id,first_name,email,created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      Promise.all(
        TRACKED_PAGE_NAMES.map(async (pageName) => ({
          pageName,
          response: await supabase
            .from("website_page_views")
            .select("id", { count: "exact", head: true })
            .eq("page_name", pageName),
        })),
      ),
    ]);

    if (recentSessionsResponse.error || recentInterestResponse.error) {
      throw recentSessionsResponse.error ?? recentInterestResponse.error;
    }

    const topPages = topPageResponses
      .map(({ pageName, response }) => ({
        name: pageName,
        totalViews: exactAnalyticsCount(response),
      }))
      .sort((a, b) => b.totalViews - a.totalViews);

    return {
      totalVisitors: new Set(sessionVisitorRows.map((row) => row.visitor_id)).size,
      visitorsToday: countUniqueVisitorsSince(monthViewRows, startToday),
      visitorsThisWeek: countUniqueVisitorsSince(monthViewRows, startWeek),
      visitorsThisMonth: countUniqueVisitorsSince(monthViewRows, startMonth),
      totalPageViews: exactAnalyticsCount(pageViewCountResponse),
      totalSessions: exactAnalyticsCount(sessionCountResponse),
      interestCount: exactAnalyticsCount(interestCountResponse),
      topPages,
      recentInterest: recentInterestResponse.data ?? [],
      recentSessions: recentSessionsResponse.data ?? [],
    };
  } catch {
    throw new Error("Website analytics could not be loaded.");
  }
}
