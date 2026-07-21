import Link from "next/link";

import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  compact?: boolean;
  breadcrumbs?: readonly BreadcrumbItem[];
}

export default function PageHeader({
  title,
  subtitle,
  compact = false,
  breadcrumbs,
}: PageHeaderProps) {
  if (compact) {
    return (
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5">
          {breadcrumbs && (
            <div className="mb-4">
              <Breadcrumb items={breadcrumbs} />
            </div>
          )}
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-500 sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-400 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16">
        {breadcrumbs && (
          <div className="mb-4">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
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
