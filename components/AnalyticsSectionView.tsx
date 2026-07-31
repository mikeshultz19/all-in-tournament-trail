"use client";

import { useEffect, useRef } from "react";

export default function AnalyticsSectionView({ name }: { name: "Sponsors" | "Winner Circle" }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = marker.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      try {
        const visitorId = localStorage.getItem("aitt_visitor_id");
        const sessionId = sessionStorage.getItem("aitt_session_id");
        if (!visitorId || !sessionId) return;
        const body = JSON.stringify({ visitorId, sessionId, path: location.pathname, pageName: name });
        navigator.sendBeacon("/api/analytics/page-view", new Blob([body], { type: "application/json" }));
      } catch {}
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [name]);
  return <span ref={marker} aria-hidden="true" className="sr-only" />;
}
