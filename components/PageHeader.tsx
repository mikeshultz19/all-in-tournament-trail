import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-neutral-400 transition hover:text-red-500"
        >
          ← Back to Home
        </Link>

        <p className="mt-10 text-center text-xs font-black uppercase tracking-[0.35em] text-red-500">
          All-In Tournament Trail
        </p>

        <h1 className="mt-3 text-center text-4xl font-black uppercase tracking-tight sm:text-6xl">
          {title}
        </h1>

        <div className="mx-auto mt-5 h-1 w-20 bg-red-600" />

        {subtitle && (
          <p className="mx-auto mt-6 max-w-3xl text-center text-neutral-400">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}