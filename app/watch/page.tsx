import Header from "@/components/Header";
import LiveStreamPlayer from "@/components/LiveStreamPlayer";
import { PUBLIC_PAGE_CONTAINER } from "@/config/layout";

export default function WatchPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0B0B] text-white">
      <Header activeItem="Watch" />

      <section className="py-10 md:py-14">
        <div className={PUBLIC_PAGE_CONTAINER}>
          <header className="border-b border-[#D4A017]/30 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-500">
              All-In Tournament Trail
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
              Watch Live
            </h1>

            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400 sm:text-base">
              Live Weigh-In Broadcast
            </p>
          </header>
        </div>
      </section>

      <div className={`${PUBLIC_PAGE_CONTAINER} py-10 md:py-14`}>
        <LiveStreamPlayer />
      </div>
    </main>
  );
}
