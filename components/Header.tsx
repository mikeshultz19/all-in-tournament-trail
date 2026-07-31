import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import HeaderSocialLinks from "@/components/HeaderSocialLinks";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Watch", href: "/watch" },
  { label: "Results", href: "/results" },
  { label: "Schedule", href: "/schedule" },
  { label: "Standings", href: "/standings" },
  { label: "Rules", href: "/rules" },
  { label: "Sponsors", href: "/sponsors" },
];

const mobileNavItems = [...navItems, { label: "How AITT Works", href: "/how-it-works" }];

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

export default function Header({ activeItem }: { activeItem?: string }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-3 sm:gap-4 lg:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/logo-new.png"
              alt="All In Tournament Trail"
              width={1774}
              height={887}
              priority
              className="h-auto w-[128px] sm:w-[160px] xl:w-[192px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex xl:gap-5">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                label={item.label}
                href={item.href}
                activeItem={activeItem}
              />
            ))}

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

          <div className="ml-auto hidden shrink-0 items-center gap-4 xl:flex">
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

          <div className="ml-auto flex shrink-0 items-center gap-2 xl:hidden">
            <Link
              href="/register"
              className="rounded-md bg-red-700 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-600"
            >
              Register
            </Link>

            <Link
              href="/admin"
              className="cursor-pointer rounded-md border border-zinc-800 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-zinc-600 transition hover:border-zinc-600 hover:text-zinc-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
            >
              Login
            </Link>

            <details className="group relative">
              <summary className="flex list-none items-center gap-2 rounded-md border border-zinc-800 px-3 py-2.5 text-xs font-black uppercase tracking-[0.08em] text-zinc-100/90 transition duration-200 hover:border-zinc-600 hover:text-red-500 [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>

              <div className="absolute right-0 top-full z-[120] mt-3 w-[min(92vw,340px)] overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F0F] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
                <div className="border-b border-zinc-800 px-4 py-3">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-zinc-500">
                    Navigate
                  </p>
                </div>

                <div className="grid gap-1 p-3">
                  {mobileNavItems.map((item) => (
                    <NavLink
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      activeItem={activeItem}
                      className="rounded-lg px-3 py-2 text-sm text-zinc-100 hover:bg-white/5"
                    />
                  ))}
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
