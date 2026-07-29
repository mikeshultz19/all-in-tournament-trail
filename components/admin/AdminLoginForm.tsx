"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginForm({
  nextPath = "/admin",
  unauthorized = false,
}: {
  nextPath?: string;
  unauthorized?: boolean;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(
    unauthorized
      ? "This account is not an active AITT Admin."
      : "",
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const normalizedUsername = username.trim().toLowerCase();
      const email = normalizedUsername.includes("@")
        ? normalizedUsername
        : `${normalizedUsername}@aitt.local`;
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError("Email or password is incorrect.");
        return;
      }

      if (
        data.user.app_metadata?.role !== "admin" ||
        data.user.app_metadata?.active !== true
      ) {
        await supabase.auth.signOut();
        setError("This account is not an active AITT Admin.");
        return;
      }

      const destination =
        nextPath.startsWith("/admin") &&
        !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin";
      router.replace(destination);
      router.refresh();
    } catch {
      setError("Admin login is temporarily unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 border border-white/10 bg-[#111111] p-6 sm:p-8"
    >
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
        Username
        <input
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-[#0B0B0B] px-4 text-base text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40"
        />
      </label>
      <label className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
        Password
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 min-h-12 w-full border border-white/15 bg-[#0B0B0B] px-4 text-base text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40"
        />
      </label>

      {error && (
        <p
          className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 w-full items-center justify-center bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#e2b22a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Signing In…" : "Sign In"}
      </button>
    </form>
  );
}
