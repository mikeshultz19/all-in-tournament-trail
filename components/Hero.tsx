import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-black pt-[70px] sm:pt-[91px] xl:pt-[102px]">
      <div className="mx-auto w-full max-w-[1700px] px-4 lg:px-8">
        <Image
          src="/images/hero/hero-locked-v10.png"
          alt="All In Tournament Trail"
          width={1920}
          height={1080}
          priority
          sizes="(max-width: 1699px) calc(100vw - 2rem), 1636px"
          className="block h-auto w-full"
        />

        <p className="py-3 text-center text-sm text-neutral-400 sm:text-base">
          <Link
            href="/how-it-works"
            className="font-bold text-yellow-400 underline decoration-yellow-400 underline-offset-4 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
          >
            How AITT Works
          </Link>
          .
        </p>

        {/* Bottom divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
      </div>
    </section>
  );
}
