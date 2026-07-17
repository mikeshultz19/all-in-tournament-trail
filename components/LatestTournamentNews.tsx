import Link from "next/link";

export default function LatestTournamentNews() {
  return (
    <section className="bg-black px-4 pb-6 pt-0 sm:px-6 lg:pb-8">
      <div className="mx-auto max-w-[1300px]">
        <div className="mb-3 flex items-center gap-4">
          <h2 className="shrink-0 text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            Latest Tournament News
          </h2>

          <div className="h-px flex-1 bg-gradient-to-r from-red-600 via-red-600/40 to-transparent" />
        </div>

        <article className="relative overflow-hidden border border-[#9f8537]/50 bg-[#101010]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(185,154,63,0.1),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(185,20,20,0.1),transparent_38%)]" />

          <div className="absolute left-0 top-0 h-full w-1 bg-red-600" />

          <div className="relative grid grid-cols-1 gap-5 px-5 py-5 sm:px-6 lg:grid-cols-[1.5fr_0.5fr] lg:items-center lg:px-7 lg:py-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />

                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 sm:text-[10px]">
                  Featured Announcement
                </p>
              </div>

              <h3 className="mt-3 text-xl font-black uppercase italic leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
                New to the{" "}
                <span className="text-[#d0ae4c]">
                  All-In Tournament Trail?
                </span>
              </h3>

              <p className="mt-3 text-sm font-black uppercase tracking-wide text-white sm:text-base">
                Fish Free or Enter the $60 Base Tournament
              </p>

              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-neutral-300 sm:text-sm">
                Choose the{" "}
                <strong className="font-black text-[#d0ae4c]">
                  Free Entry
                </strong>{" "}
                and compete for{" "}
                <strong className="font-black text-[#d0ae4c]">
                  Big Bass only
                </strong>
                , or enter the{" "}
                <strong className="font-black text-red-500">
                  $60 Base Tournament
                </strong>{" "}
                and compete for the main tournament payout.
              </p>

              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.1em] text-white sm:text-xs">
                No membership required.
              </p>
            </div>

            <div className="border-t border-white/10 pt-5 lg:border-l lg:border-t-0 lg:py-2 lg:pl-6">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#d0ae4c] sm:text-[10px]">
                Fish Your Way
              </p>

              <p className="mt-2 text-base font-black uppercase leading-tight text-white sm:text-lg">
                Choose the entry that works for you.
              </p>

              <Link
                href="/how-it-works"
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 border border-[#b99a3f] bg-[#b99a3f] px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.13em] text-black transition hover:bg-[#d0ae4c] sm:text-xs"
              >
                How It Works
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}