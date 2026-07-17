import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-black">
      <Image
        src="/images/hero/hero-locked-v10.png"
        alt="All In Tournament Trail"
        width={1920}
        height={1080}
        priority
        sizes="100vw"
        className="
          block
          w-full
          h-auto

          -translate-y-[2vw]
          sm:-translate-y-[3vw]
          lg:-translate-y-[4vw]
        "
      />

      {/* Bottom divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-700/60 to-transparent" />
    </section>
  );
}