import { NextResponse } from "next/server";

import { pageNameForPath, TRACKED_PAGE_NAMES } from "@/lib/website-analytics";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let input: { visitorId?: string; sessionId?: string; path?: string; pageName?: string; referrer?: string };
  try { input = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const pageName = input.pageName && TRACKED_PAGE_NAMES.includes(input.pageName as typeof TRACKED_PAGE_NAMES[number])
    ? input.pageName
    : input.path ? pageNameForPath(input.path) : null;
  if (!pageName || !input.visitorId || !input.sessionId ||
      !/^[0-9a-f-]{36}$/i.test(input.visitorId) || !/^[0-9a-f-]{36}$/i.test(input.sessionId)) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }
  const supabase = createSupabaseServerClient();
  let referrerDomain: string | null = null;
  try { referrerDomain = input.referrer ? new URL(input.referrer).hostname.slice(0, 255) : null; } catch {}
  const { error: sessionError } = await supabase.from("website_analytics_sessions").upsert({
    session_id: input.sessionId, visitor_id: input.visitorId, first_path: input.path,
    referrer_domain: referrerDomain, last_seen_at: new Date().toISOString(),
  }, { onConflict: "session_id", ignoreDuplicates: true });
  if (sessionError) return NextResponse.json({ error: "Tracking unavailable." }, { status: 503 });
  const { error } = await supabase.from("website_page_views").insert({
    visitor_id: input.visitorId, session_id: input.sessionId, page_name: pageName, path: input.path,
  });
  return error ? NextResponse.json({ error: "Tracking unavailable." }, { status: 503 }) : new NextResponse(null, { status: 204 });
}
