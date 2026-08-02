import Image from "next/image";

export default function LiveStreamPlayer() {
  return (
    <section
      aria-label="All-In Tournament Trail live stream"
      className="mx-auto w-full max-w-5xl overflow-hidden rounded-md border border-amber-500/60 bg-black"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <div className="absolute inset-0 p-4 sm:p-6 lg:p-8">
          <div className="relative h-full w-full overflow-hidden rounded-sm">
            <Image
              src="/images/watch/watch-live-brb.png"
              alt="All-In Tournament Trail live stream placeholder"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-contain"
            />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 px-6 text-center">
          <p className="text-2xl font-black uppercase tracking-[0.18em] text-white sm:text-3xl">
            Coming Soon
          </p>
          <p className="mt-3 text-sm text-neutral-300 sm:text-base">
            AITT Live Tournament Stream &amp; Weigh-In Coverage
          </p>
        </div>
      </div>
    </section>
  );
}
