"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "aitt_visitor_id";
const SESSION_KEY = "aitt_session_id";

export default function WebsiteAnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    try {
      let visitorId = localStorage.getItem(VISITOR_KEY);
      let sessionId = sessionStorage.getItem(SESSION_KEY);
      if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, visitorId); }
      if (!sessionId) { sessionId = crypto.randomUUID(); sessionStorage.setItem(SESSION_KEY, sessionId); }
      const body = JSON.stringify({ visitorId, sessionId, path: pathname, referrer: document.referrer });
      if (!navigator.sendBeacon("/api/analytics/page-view", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/analytics/page-view", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
      }
    } catch {}
  }, [pathname]);
  return null;
}
