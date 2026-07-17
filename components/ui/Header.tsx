import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-red-950 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <a href="#" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="All In Tournament Trail"
            width={210}
            height={80}
            priority
            className="h-auto w-[150px] sm:w-[190px]"
          />
        </a>

        <nav className="hidden items-center gap-6 text-sm font-bold uppercase tracking-wide text-zinc-200 lg:flex">
          <a href="#results" className="hover:text-red-500">
            Results
          </a>
          <a href="#news" className="hover:text-red-500">
            News
          </a>
          <a href="#schedule" className="hover:text-red-500">
            Schedule
          </a>
          <a href="#standings" className="hover:text-red-500">
            AOY
          </a>
          <a href="#rules" className="hover:text-red-500">
            Rules
          </a>
          <a href="#sponsors" className="hover:text-red-500">
            Sponsors
          </a>
        </nav>

        <a
          href="#register"
          className="rounded-md bg-red-700 px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-red-600"
        >
          Register
        </a>
      </div>
    </header>
  );
}