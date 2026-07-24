import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";

interface AdminPlaceholderPageProps {
  title: string;
}

export default function AdminPlaceholderPage({
  title,
}: AdminPlaceholderPageProps) {
  return (
    <>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Admin Center
      </Link>

      <div className="mt-8 border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Management
        </p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
      </div>

      <section className="mt-8 border border-white/10 bg-[#111111] px-6 py-14 text-center sm:px-10 sm:py-20">
        <Clock3
          aria-hidden="true"
          className="mx-auto size-8 text-[#D4A017]"
          strokeWidth={1.75}
        />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-red-500">
          Coming Soon
        </p>
        <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">
          {title} tools are on the way
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
          This section is ready for the next phase of the Admin Center.
        </p>
      </section>
    </>
  );
}
