"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  href: string;
  label: string;
  activePaths?: string[];
};

const navigationItems: NavigationItem[] = [
  {
    href: "/admin",
    label: "Home",
  },
  {
    href: "/admin/tournament-manager",
    label: "Tournament",
    activePaths: [
      "/admin/tournament-manager",
      "/admin/tournament",
      "/admin/conditions",
      "/admin/results",
    ],
  },
  {
    href: "/admin/members",
    label: "Members",
  },
  {
    href: "/admin/registration-review",
    label: "Registration Review",
  },
  {
    href: "/admin/announcements",
    label: "Website",
    activePaths: ["/admin/announcements", "/admin/sponsors"],
  },
  {
    href: "/admin/settings",
    label: "Settings",
  },
  {
    href: "/admin/analytics",
    label: "Website Analytics",
    activePaths: ["/admin/analytics", "/admin/registration-interest"],
  },
];

function isNavigationItemActive(pathname: string, item: NavigationItem) {
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
          {navigationItems.map((item) => {
            const active = isNavigationItemActive(pathname, item);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center border-l-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017] ${
                    active
                      ? "border-[#D4A017] bg-white/5 text-white"
                      : "border-transparent text-neutral-400 hover:text-[#D4A017]"
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
