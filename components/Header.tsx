import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black">
      <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between px-5">
        <a href="/" className="flex shrink-0 items-center">
          <Image
            src="/images/logo.png"
            alt="All In Tournament Trail"
            width={300}
            height={120}
            priority
            className="h-auto w-[175px] object-contain"
          />
        </a>

        <nav className="hidden items-center gap-9 text-sm font-black uppercase tracking-[0.1em] text-white lg:flex">
          <a href="/" className="text-red-500">
            Home
          </a>
          <a href="/results" className="transition hover:text-red-500">
            Results
          </a>
          <a href="/schedule" className="transition hover:text-red-500">
            Schedule
          </a>
          <a href="/standings" className="transition hover:text-red-500">
            Standings
          </a>
          <a href="/rules" className="transition hover:text-red-500">
            Rules
          </a>
          <a href="/sponsors" className="transition hover:text-red-500">
            Sponsors
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/register"
            className="rounded-md bg-red-600 px-5 py-3 text-sm font-black uppercase tracking-wide transition hover:bg-red-700"
          >
            Register
          </a>

          <a
            href="/login"
            className="hidden rounded-md border border-white/30 px-5 py-3 text-sm font-black uppercase tracking-wide transition hover:bg-white/10 sm:block"
          >
            Login
          </a>
        </div>
      </div>
    </header>
  );
}