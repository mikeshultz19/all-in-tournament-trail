import Image from "next/image";

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

        {/* Bottom divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
      </div>
    </section>
  );
}
