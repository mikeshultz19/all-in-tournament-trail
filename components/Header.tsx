import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Home", href: "#" },
  { label: "Results", href: "#results" },
  { label: "Schedule", href: "#schedule" },
  { label: "Standings", href: "#standings" },
  { label: "Rules", href: "#rules" },
  { label: "Sponsors", href: "#sponsors" },
];

export default function Header() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-zinc-800 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center gap-4 px-4 py-3 lg:px-5">
          <Link href="#" className="flex shrink-0 items-center">
            <Image
              src="/images/logo.png"
              alt="All In Tournament Trail"
              width={210}
              height={80}
              priority
              className="h-auto w-[145px] sm:w-[175px] lg:w-[205px]"
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-5">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-sm font-black uppercase tracking-[0.08em] text-zinc-100 transition duration-200 hover:text-red-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-4 lg:flex">
            <Link
              href="/how-it-works"
              className="whitespace-nowrap text-sm font-black uppercase tracking-[0.12em] text-yellow-400 transition duration-200 hover:text-yellow-300 hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.45)]"
            >
              How It Works
            </Link>

            <Link
              href="#register"
              className="rounded-md bg-red-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition duration-200 hover:bg-red-600"
            >
              Register
            </Link>

            <Link
              href="/login"
              className="rounded-md border border-zinc-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition duration-200 hover:border-zinc-500 hover:bg-zinc-900"
            >
              Login
            </Link>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
            <Link
              href="/how-it-works"
              className="hidden whitespace-nowrap text-xs font-black uppercase tracking-[0.08em] text-yellow-400 transition hover:text-yellow-300 sm:block"
            >
              How It Works
            </Link>

            <Link
              href="#register"
              className="rounded-md bg-red-700 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-600"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <div aria-hidden="true" className="h-[92px] sm:h-[104px] lg:h-[116px]" />
    </>
  );
}