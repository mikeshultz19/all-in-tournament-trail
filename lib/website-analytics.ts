import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const TRACKED_PAGES: Record<string, string> = {
  "/": "Homepage",
  "/schedule": "Schedule",
  "/register": "Registration",
  "/rules": "Rules",
  "/how-it-works": "FAQ",
  "/sponsors": "Sponsors",
  "/winner-circle": "Winner Circle",
  "/standings": "AOY Standings",
  "/results": "Tournament Results",
  "/contact": "Contact",
};
export const TRACKED_PAGE_NAMES = [
  "Homepage", "Schedule", "Registration", "Rules", "FAQ", "Sponsors",
  "Winner Circle", "AOY Standings", "Tournament Results", "Contact",
] as const;

export function pageNameForPath(path: string): string | null {
  if (path.startsWith("/results/")) return "Tournament Results";
  return TRACKED_PAGES[path] ?? null;
}

export async function getAnalyticsDashboard() {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startWeek = new Date(startToday);
  startWeek.setDate(startToday.getDate() - startToday.getDay());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [sessions, views, interest] = await Promise.all([
    supabase.from("website_analytics_sessions").select("*"),
    supabase.from("website_page_views").select("page_name,viewed_at"),
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
    visitorsToday: since(startToday),
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
