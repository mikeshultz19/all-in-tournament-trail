import Link from "next/link";

import { getAnalyticsDashboard } from "@/lib/website-analytics";
import { analyticsSourceLabel } from "@/lib/traffic-source";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Chicago" }).format(new Date(value));
}

export default async function WebsiteAnalyticsPage() {
  const data = await getAnalyticsDashboard();
  const cards = [
    ["Total Website Visitors", data.totalVisitors],
    ["Visitors Today", data.visitorsToday],
    ["Visitors This Week", data.visitorsThisWeek],
    ["Visitors This Month", data.visitorsThisMonth],
    ["Total Page Views", data.totalPageViews],
    ["Registration Interest Signups", data.interestCount],
  ] as const;
  return (
    <div className="space-y-6">
      <header><p className="text-xs font-black uppercase tracking-[0.16em] text-[#D4A017]">Website</p><h1 className="mt-1 text-2xl font-black uppercase text-red-500">Website Analytics</h1></header>
      <section aria-label="Website KPIs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => <article key={label} className="border border-white/10 bg-[#111] p-5"><p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{label}</p><p className="mt-3 text-3xl font-black text-white">{value.toLocaleString()}</p></article>)}
      </section>
      <p className="text-xs text-neutral-500">Sessions: {data.totalSessions.toLocaleString()} · Updates on page refresh.</p>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="border border-white/10 bg-[#111]"><h2 className="border-b border-white/10 px-5 py-4 text-sm font-black uppercase text-[#D4A017]">Top Pages</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-neutral-500"><tr><th className="px-5 py-3">Page Name</th><th className="px-5 py-3 text-right">Total Views</th></tr></thead><tbody>{data.topPages.map((page) => <tr key={page.name} className="border-t border-white/5"><td className="px-5 py-3">{page.name}</td><td className="px-5 py-3 text-right font-bold">{page.totalViews}</td></tr>)}</tbody></table></div></section>
        <section className="border border-white/10 bg-[#111]"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><h2 className="text-sm font-black uppercase text-[#D4A017]">Recent Registration Interest</h2><Link href="/admin/registration-interest" className="text-xs font-bold text-red-400">View All</Link></div><ul>{data.recentInterest.map((item) => <li key={item.id} className="border-b border-white/5 px-5 py-3 text-sm"><span className="font-bold">{item.first_name || "—"}</span><span className="ml-3 text-neutral-400">{item.email}</span><time className="block text-xs text-neutral-600">{dateTime(item.created_at)}</time></li>)}</ul></section>
      </div>
      <section className="border border-white/10 bg-[#111]"><h2 className="border-b border-white/10 px-5 py-4 text-sm font-black uppercase text-[#D4A017]">Recent Visitor Activity</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-neutral-500"><tr><th className="px-5 py-3">First Page</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">First Seen</th></tr></thead><tbody>{data.recentSessions.map((session) => <tr key={session.session_id} className="border-t border-white/5"><td className="px-5 py-3">{session.first_path}</td><td className="px-5 py-3">{analyticsSourceLabel({ utmSource: session.utm_source, referrerDomain: session.referrer_domain })}</td><td className="px-5 py-3">{dateTime(session.first_seen_at)}</td></tr>)}</tbody></table></div></section>
    </div>
  );
}
