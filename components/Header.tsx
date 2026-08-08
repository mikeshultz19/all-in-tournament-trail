import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import HeaderSocialLinks from "@/components/HeaderSocialLinks";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Bass Stack", href: "/bass-stack", bassStack: true },
  { label: "Results", href: "/results" },
  { label: "Schedule", href: "/schedule" },
  { label: "Standings", href: "/standings" },
  { label: "Rules", href: "/rules" },
  { label: "FAQ", href: "/faq" },
  { label: "Sponsors", href: "/sponsors" },
];

/*
 * Mobile dropdown navigation.
 *
 * "How AITT Works" is intentionally NOT included here because it is
 * permanently visible in the mobile header beside the Register button.
 *
 * FAQ is inherited from navItems, so it appears once on desktop and once
 * inside the mobile dropdown.
 */
const mobileNavItems = [
  navItems[0],
  { label: "How AITT Works", href: "/how-it-works" },
  ...navItems.slice(1),
];

function NavLink({
  label,
  href,
  activeItem,
  className,
  tone = "default",
}: {
  label: string;
  href: string;
  activeItem?: string;
  className?: string;
  tone?: "default" | "gold";
}) {
  const baseClasses =
    tone === "gold"
      ? "whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] text-yellow-400 transition duration-200 hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.45)]"
      : `whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] transition duration-200 hover:text-red-500 ${
          activeItem === label ? "text-red-500" : "text-zinc-100"
        }`;

  return (
    <Link
      href={href}
      aria-current={activeItem === label ? "page" : undefined}
      className={`${baseClasses} ${className ?? ""}`.trim()}
    >
      {label}
    </Link>
  );
}

function BassStackNavLink({
  activeItem,
  className,
}: {
  activeItem?: string;
  className?: string;
}) {
  const isActive = activeItem === "Bass Stack";

  return (
    <Link
      href="/bass-stack"
      aria-current={isActive ? "page" : undefined}
      className={`inline-flex items-center whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] transition duration-200 hover:text-red-500 ${
        isActive ? "text-red-500" : "text-zinc-100"
      } ${className ?? ""}`.trim()}
    >
      <span className="rounded border border-[#c9aa4a]/70 bg-black/70 px-2 py-1 text-[0.58rem] leading-none tracking-[0.18em] text-[#c9aa4a]">
        BASS STACK
      </span>
    </Link>
  );
}

export default function Header({ activeItem }: { activeItem?: string }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-2.5 py-3 min-[375px]:px-3 sm:gap-4 sm:px-4 lg:px-5">
          {/* Logo remains unchanged on desktop and scales down on mobile. */}
          <Link href="/" className="flex min-w-0 shrink items-center">
            <Image
              src="/images/logo-new.png"
              alt="All In Tournament Trail"
              width={1774}
              height={887}
              priority
              className="h-auto w-[88px] min-[360px]:w-[96px] min-[375px]:w-[104px] sm:w-[160px] min-[1440px]:w-[192px]"
            />
          </Link>

          {/*
           * DESKTOP NAVIGATION
           *
           * This section remains unchanged and is only visible at xl screens
           * and larger.
           */}
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 min-[1440px]:flex min-[1440px]:gap-5">
            {navItems.map((item) =>
              item.bassStack ? (
                <BassStackNavLink key={item.label} activeItem={activeItem} />
              ) : (
                <NavLink
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  activeItem={activeItem}
                />
              ),
            )}

            <span className="flex items-center border-x border-zinc-800 px-3">
              <HeaderSocialLinks className="gap-3" />
            </span>

            <NavLink
              label="How AITT Works"
              href="/how-it-works"
              activeItem={activeItem}
              tone="gold"
            />
          </nav>

          {/*
           * DESKTOP ACTION BUTTONS
           *
           * Register and Login remain unchanged on desktop.
           */}
          <div className="ml-auto hidden shrink-0 items-center gap-4 min-[1440px]:flex">
            <Link
              href="/register"
              className="rounded-md bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-600"
            >
              Register
            </Link>

            <Link
              href="/admin"
              className="cursor-pointer rounded-md border border-zinc-800 px-5 py-3 text-sm font-black uppercase tracking-wide text-zinc-600 transition hover:border-zinc-600 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
            >
              Login
            </Link>
          </div>

          {/*
           * MOBILE AND TABLET HEADER ACTIONS
           *
           * This section is visible below the xl breakpoint only.
           *
           * Order:
           * 1. How AITT Works
           * 2. Register
           * 3. Menu
           *
           * The desktop header above is not affected.
           */}
          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 min-[1440px]:hidden min-[375px]:gap-1.5 sm:gap-2">
  {/*
   * MOBILE BASS STACK EMBLEM
   *
   * This uses the same visual treatment as the desktop Bass Stack emblem.
   * It appears only in the mobile/tablet header because this entire row
   * remains hidden at the xl desktop breakpoint.
   */}
  <Link
    href="/bass-stack"
    aria-label="Bass Stack"
    aria-current={activeItem === "Bass Stack" ? "page" : undefined}
    className="inline-flex h-9 shrink-0 items-center justify-center sm:h-10"
  >
    <span
      className={`min-w-[42px] rounded border border-[#c9aa4a]/70 bg-black/70 px-1.5 py-1 text-center text-[0.42rem] font-black uppercase leading-none tracking-[0.08em] text-[#c9aa4a] transition active:scale-[0.96] hover:border-[#c9aa4a] hover:text-yellow-300 min-[375px]:min-w-[46px] min-[375px]:px-2 min-[375px]:text-[0.47rem] sm:min-w-[54px] sm:px-2.5 sm:text-[0.55rem] ${
        activeItem === "Bass Stack"
          ? "border-[#c9aa4a] text-yellow-300"
          : ""
      }`}
    >
      Bass
      <br />
      Stack
    </span>
  </Link>

  {/*
   * HOW AITT WORKS
   *
   * This stays permanently visible in yellow on the mobile header.
   */}
  <Link
    href="/how-it-works"
    aria-current={
      activeItem === "How AITT Works" ? "page" : undefined
    }
    className={`flex h-9 shrink-0 items-center justify-center whitespace-nowrap px-0.5 text-center text-[0.53rem] font-black uppercase leading-[0.95] tracking-[0.02em] text-yellow-400 transition duration-200 active:scale-[0.96] hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.45)] min-[375px]:text-[0.58rem] sm:h-10 sm:px-1 sm:text-[0.68rem] ${
      activeItem === "How AITT Works"
        ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
        : ""
    }`}
  >
    <span>
      How AITT
      <br />
      Works
    </span>
  </Link>

  {/*
   * SMALLER MOBILE REGISTER BUTTON
   *
   * The horizontal padding has been reduced slightly to make room for
   * the new Bass Stack emblem.
   */}
  <Link
    href="/register"
    className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-red-700 px-1.5 text-[0.56rem] font-black uppercase tracking-[0.025em] text-white transition active:scale-[0.96] hover:bg-red-600 min-[375px]:px-2 min-[375px]:text-[0.61rem] sm:h-10 sm:px-3 sm:text-[0.7rem]"
  >
    Register
  </Link>

  {/*
   * Login remains hidden on small phones and visible on larger tablet
   * widths exactly as before.
   */}
  <Link
    href="/admin"
    className="hidden cursor-pointer rounded-md border border-zinc-800 px-3 py-2.5 text-xs font-black uppercase tracking-wide text-zinc-600 transition hover:border-zinc-600 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 lg:inline-flex sm:px-4"
  >
    Login
  </Link>

  <details className="group relative">
              <summary className="flex h-9 list-none items-center justify-center gap-1 rounded-md border border-zinc-800 px-2 text-xs font-black uppercase tracking-[0.08em] text-zinc-100/90 transition duration-200 active:scale-[0.96] hover:border-zinc-600 hover:text-red-500 min-[375px]:px-2.5 sm:h-10 sm:gap-2 sm:px-3 [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden="true" className="h-4 w-4 shrink-0" />

                <span className="hidden sm:inline">Menu</span>

                <ChevronDown
                  aria-hidden="true"
                  className="hidden h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180 sm:block"
                />
              </summary>

              <div className="absolute right-0 top-full z-[120] mt-3 w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F0F] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                <div className="border-b border-zinc-800 px-4 py-3">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Navigate
                  </p>
                </div>

                <div className="grid gap-1 p-3">
                  {mobileNavItems.map((item) =>
                    item.bassStack ? (
                      <BassStackNavLink
                        key={item.label}
                        activeItem={activeItem}
                        className="rounded-lg px-3 py-2 hover:bg-white/5"
                      />
                    ) : (
                      <NavLink
                        key={item.label}
                        label={item.label}
                        href={item.href}
                        activeItem={activeItem}
                        className="rounded-lg px-3 py-2 text-sm text-zinc-100 hover:bg-white/5"
                      />
                    ),
                  )}
                </div>

                <div className="border-t border-zinc-800 px-4 py-4">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Follow
                  </p>

                  <div className="mt-3">
                    <HeaderSocialLinks className="gap-4" />
                  </div>
                </div>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div
        aria-hidden="true"
        className="h-[92px] sm:h-[104px] lg:h-[116px]"
      />
    </>
  );
}