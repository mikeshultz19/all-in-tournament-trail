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

export function startOfAnalyticsDay(
  value: Date,
  timeZone = AITT_ANALYTICS_TIME_ZONE,
) {
  const localDate = zonedParts(value, timeZone);
  const targetWallTime = Date.UTC(
    localDate.year,
    localDate.month - 1,
    localDate.day,
  );
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

export async function getAnalyticsDashboard() {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const startToday = startOfAnalyticsDay(now);
  const startWeek = new Date(now);
  startWeek.setHours(0, 0, 0, 0);
  startWeek.setDate(startWeek.getDate() - startWeek.getDay());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sessions, views, interest] = await Promise.all([
    supabase.from("website_analytics_sessions").select("*"),
    supabase.from("website_page_views").select("visitor_id,page_name,viewed_at"),
    supabase.from("registration_interest").select("id,first_name,email,created_at").order("created_at", { ascending: false }),
  ]);
  if (sessions.error || views.error || interest.error) {
    throw new Error("Website analytics could not be loaded.");
  }
  const sessionRows = sessions.data ?? [];
  const viewRows = views.data ?? [];
  const interestRows = interest.data ?? [];
  const visitorIds = new Set(sessionRows.map((row) => row.visitor_id));
  const since = (date: Date) =>
    new Set(sessionRows.filter((row) => new Date(row.first_seen_at) >= date).map((row) => row.visitor_id)).size;
  const totals = new Map<string, number>(TRACKED_PAGE_NAMES.map((name) => [name, 0]));
  for (const view of viewRows) totals.set(view.page_name, (totals.get(view.page_name) ?? 0) + 1);

  return {
    totalVisitors: visitorIds.size,
    visitorsToday: countUniqueVisitorsSince(viewRows, startToday),
    visitorsThisWeek: since(startWeek),
    visitorsThisMonth: since(startMonth),
    totalPageViews: viewRows.length,
    totalSessions: sessionRows.length,
    interestCount: interestRows.length,
    topPages: [...totals].map(([name, totalViews]) => ({ name, totalViews })).sort((a, b) => b.totalViews - a.totalViews),
    recentInterest: interestRows.slice(0, 5),
    recentSessions: sessionRows.sort((a, b) => b.first_seen_at.localeCompare(a.first_seen_at)).slice(0, 8),
  };
}
