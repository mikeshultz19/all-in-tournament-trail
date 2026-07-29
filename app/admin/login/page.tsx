import Link from "next/link";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="mx-auto max-w-lg py-8 sm:py-14">
      <p className="text-center text-xs font-black uppercase tracking-[0.24em] text-red-500">
        AITT Admin Center
      </p>
      <h1 className="mt-3 text-center text-3xl font-black uppercase tracking-tight text-white">
        Admin Login
      </h1>
      <p className="mt-4 text-center text-sm leading-6 text-neutral-400">
        Sign in with your active AITT Admin account.
      </p>
      <AdminLoginForm
        nextPath={params.next}
        unauthorized={params.error === "unauthorized"}
      />
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center text-xs font-black uppercase tracking-[0.12em] text-neutral-400 transition hover:text-[#D4A017]"
      >
        Return to Website
      </Link>
    </section>
  );
}
