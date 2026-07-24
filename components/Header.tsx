import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Watch", href: "/watch" },
  { label: "Results", href: "/results" },
  { label: "Schedule", href: "/schedule" },
  { label: "Standings" },
  { label: "Rules", href: "/rules" },
  { label: "Sponsors" },
];

export default function Header({ activeItem }: { activeItem?: string }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] items-center gap-2 px-4 py-3 sm:gap-4 lg:px-5">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/logo.png"
              alt="All In Tournament Trail"
              width={210}
              height={80}
              priority
              className="h-auto w-[120px] sm:w-[175px] xl:w-[205px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 xl:flex xl:gap-5">
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={activeItem === item.label ? "page" : undefined}
                  className={`whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] transition duration-200 hover:text-red-500 ${
                    activeItem === item.label
                      ? "text-red-500"
                      : "text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  aria-disabled="true"
                  className="cursor-not-allowed whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] text-zinc-600"
                >
                  {item.label}
                </span>
              )
            )}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-4 xl:flex">
            <Link
              href="/how-it-works"
              className="whitespace-nowrap text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition duration-200 hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.45)]"
            >
              How It Works
            </Link>

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
              href="/how-it-works"
              className="hidden whitespace-nowrap text-xs font-black uppercase tracking-[0.08em] text-yellow-400 transition hover:text-yellow-300 sm:block"
            >
              How AITT Works
            </Link>

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
