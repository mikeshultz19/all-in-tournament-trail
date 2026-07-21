import Image from "next/image";

export default function LiveStreamPlayer() {
  return (
    <section
      aria-label="All-In Tournament Trail live stream"
      className="overflow-hidden rounded-md border border-amber-500/60 bg-black"
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        <div className="absolute left-4 top-4 flex items-center gap-3">
          <span className="rounded bg-red-600 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white shadow">
            Live
          </span>

          <span className="flex items-center gap-2 rounded bg-black/75 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current"
            >
              <path d="M12 5c-5.5 0-9.5 5.1-9.7 5.3a1 1 0 0 0 0 1.4C2.5 11.9 6.5 17 12 17s9.5-5.1 9.7-5.3a1 1 0 0 0 0-1.4C21.5 10.1 17.5 5 12 5Zm0 10c-3.6 0-6.7-2.8-7.6-4 .9-1.2 4-4 7.6-4s6.7 2.8 7.6 4c-.9 1.2-4 4-7.6 4Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
            </svg>
            128
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
          <div
            aria-hidden="true"
            className="mb-3 h-1 w-full overflow-hidden rounded-full bg-white/25"
          >
            <div className="h-full w-3/4 rounded-full bg-red-600" />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Pause live stream"
                className="rounded p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Adjust volume"
                className="rounded p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M3 9v6h4l5 4V5L7 9H3Zm12.5 3a3.5 3.5 0 0 0-1.5-2.9v5.8a3.5 3.5 0 0 0 1.5-2.9Zm-1.5-7v2.1a6 6 0 0 1 0 9.8V19a8 8 0 0 0 0-14Z" />
                </svg>
              </button>

              <span className="flex items-center gap-2 text-sm font-semibold uppercase">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                Live
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Live stream settings"
                className="rounded p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                >
                  <path d="m19.4 13 .1-1-.1-1 2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L15 3.3h-4L10.6 6a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.5 11l-.1 1 .1 1-2.1 1.6 2 3.4 2.5-1a8 8 0 0 0 1.7 1l.4 2.7h4l.4-2.7a8 8 0 0 0 1.7-1l2.5 1 2-3.4L19.4 13ZM13 17h-2l-.3-2a6 6 0 0 1-2-1.2l-1.9.8-1-1.7 1.6-1.2a6 6 0 0 1 0-2.4L5.8 9.1l1-1.7 1.9.8a6 6 0 0 1 2-1.2l.3-2h2l.3 2a6 6 0 0 1 2 1.2l1.9-.8 1 1.7-1.6 1.2a6 6 0 0 1 0 2.4l1.6 1.2-1 1.7-1.9-.8a6 6 0 0 1-2 1.2l-.3 2Zm-1-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Picture in picture"
                className="rounded p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M19 7H5v10h14V7Zm2-2v14H3V5h18Zm-3 7h-6v4h6v-4Z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Enter fullscreen"
                className="rounded p-1 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M5 5h5v2H7v3H5V5Zm9 0h5v5h-2V7h-3V5ZM5 14h2v3h3v2H5v-5Zm12 0h2v5h-5v-2h3v-3Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}