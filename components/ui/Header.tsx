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
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] items-center gap-5 px-4 py-3 lg:px-5">
        {/* Logo */}
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

        {/* Desktop navigation */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="
                whitespace-nowrap
                text-sm
                font-black
                uppercase
                tracking-[0.08em]
                text-zinc-100
                transition
                hover:text-red-500
              "
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/how-it-works"
            className="
              whitespace-nowrap
              text-sm
              font-black
              uppercase
              tracking-[0.1em]
              text-yellow-400
              transition
              hover:text-yellow-300
            "
          >
            How It Works
          </Link>
        </nav>

        {/* Header actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="#register"
            className="
              rounded-xl
              bg-red-600
              px-4
              py-3
              text-xs
              font-black
              uppercase
              tracking-wide
              text-white
              transition
              hover:bg-red-500
              sm:px-6
              sm:text-sm
            "
          >
            Register
          </Link>

          <Link
            href="/login"
            className="
              hidden
              rounded-xl
              border
              border-zinc-700
              px-4
              py-3
              text-xs
              font-black
              uppercase
              tracking-wide
              text-white
              transition
              hover:border-zinc-500
              hover:bg-zinc-900
              sm:block
              sm:px-6
              sm:text-sm
            "
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}