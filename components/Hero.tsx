import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-black">
      <div className="mx-auto w-full max-w-[1700px] px-4 lg:px-8">
        <div className="relative">
          <Image
            src="/images/hero/hero-locked-v10.png"
            alt="All In Tournament Trail"
            width={1920}
            height={1080}
            priority
            sizes="(max-width: 1699px) calc(100vw - 2rem), 1636px"
            className="block h-auto w-full"
          />

          <Link
            href="/no-forward-facing-sonar"
            aria-label="Learn why AITT prohibits forward-facing sonar during tournament competition"
            className="absolute left-[84.1%] top-[8.1%] h-[39.5%] w-[11.2%] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
          />
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />

        {/* Mobile-only No FFS link */}
        <div className="py-2 md:hidden">
          <Link
            href="/no-forward-facing-sonar"
            className="group text-[0.68rem] leading-5"
          >
            <span className="font-semibold text-[#D4A017]">
              Forward-Facing Sonar:
            </span>{" "}

            <span className="text-neutral-500 transition group-hover:text-neutral-300">
              Learn why AITT chose No FFS →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}