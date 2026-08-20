"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
  activePaths?: string[];
};

const navigationItems: NavigationItem[] = [
  { href: "/admin", label: "Home" },
  {
    href: "/admin/tournament-manager",
    label: "Tournament Manager",
    activePaths: [
      "/admin/tournament-manager",
      "/admin/conditions",
      "/admin/results",
    ],
  },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/registration-review", label: "Registration & Check-In" },
  {
    href: "/admin/tournament",
    label: "Tournament Info",
    activePaths: ["/admin/tournament"],
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    activePaths: ["/admin/announcements"],
  },
  {
    href: "/admin/rules",
    label: "Rules",
    activePaths: ["/admin/rules"],
  },
  {
    href: "/admin/faq",
    label: "FAQ",
    activePaths: ["/admin/faq"],
  },
  {
    href: "/admin/forms",
    label: "Forms",
    activePaths: ["/admin/forms"],
  },
  { href: "/admin/settings", label: "Settings" },
  {
    href: "/admin/analytics",
    label: "Website Analytics",
    activePaths: ["/admin/analytics", "/admin/registration-interest"],
  },
];

function isNavigationItemActive(
  pathname: string,
  item: NavigationItem,
) {
  if (item.href === "/admin") {
    return pathname === item.href;
  }

  return (item.activePaths ?? [item.href]).some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Admin navigation"
      className="border-b border-white/10 bg-[#111111] md:w-64 md:border-b-0 md:border-r"
    >
      <nav className="px-4 py-5 md:py-6">
        <ul className="space-y-1">
          {navigationItems.map((item, index) => {
            const active = isNavigationItemActive(pathname, item);
            const showWebsiteHeading = index === 4;

            return (
              <li key={item.href}>
                {showWebsiteHeading ? (
                  <p className="mb-2 mt-5 border-t border-white/20 px-4 pt-4 text-[10px] font-black uppercase tracking-[0.22em] text-neutral-200">
                    Website
                  </p>
                ) : null}

                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-r-sm border-l-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017] ${
                    active
                      ? "border-[#D4A017] bg-gradient-to-r from-[#D4A017]/10 to-white/[0.03] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]"
                      : "border-transparent text-neutral-400 hover:bg-white/[0.025] hover:text-[#D4A017]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
