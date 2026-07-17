import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-black">
      <div className="relative mx-auto max-w-[1500px]">
        <Image
          src="/images/hero/hero-locked-v3.png"
          alt="All In Tournament Trail"
          width={1536}
          height={1024}
          priority
          className="block h-auto w-full"
        />

        <a
          href="/register"
          aria-label="Register now"
          className="absolute bottom-[8%] left-[3.4%] h-[9%] w-[20%]"
        />

        <a
          href="#winners"
          aria-label="View latest results"
          className="absolute bottom-[8%] left-[25.3%] h-[9%] w-[21%]"
        />
      </div>
    </section>
  );
}