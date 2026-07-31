"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

export default function RegistrationInterest() {
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (open && !element?.open) element?.showModal();
    else if (!open && element?.open) element.close();
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/registration-interest", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), firstName: data.get("firstName") }),
    });
    const result = await response.json();
    setPending(false);
    if (!response.ok) { setError(result.error); return; }
    setComplete(true);
  }

  return (
    <>
      <section
        data-registration-interest
        aria-labelledby="registration-interest-heading"
        className="border-y border-white/10 bg-zinc-950"
      >
        <div className="mx-auto max-w-5xl px-6 py-7">
          <div className="flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6">
            <div className="sm:text-left">
              <h2
                id="registration-interest-heading"
                className="text-2xl font-extrabold tracking-tight text-white"
              >
                Be the First to Know
              </h2>
              <p className="mt-1 text-base text-zinc-400">
                Get notified the moment tournament registration opens.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="shrink-0 rounded-lg bg-red-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
            >
              Notify Me
            </button>
          </div>
        </div>
      </section>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) setOpen(false);
        }}
        aria-labelledby="registration-interest-dialog-title"
        aria-describedby="registration-interest-dialog-description"
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto border border-[#4A3A12] bg-[#0b0b0b] p-0 text-white shadow-2xl backdrop:bg-black/75"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id="registration-interest-dialog-title" className="text-lg font-black uppercase text-red-500">Be the First to Know</h2>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="min-h-10 min-w-10 text-xl text-neutral-400 hover:text-white focus-visible:outline-2 focus-visible:outline-[#D4A017]">×</button>
          </div>
          <p id="registration-interest-dialog-description" className="mt-3 text-sm leading-6 text-neutral-300">
            Join our notification list and we&apos;ll email you as soon as registration opens for the inaugural AITT season.
          </p>
          {complete ? (
            <p className="mt-5 text-sm leading-6">Thank you! We&apos;ll notify you as soon as registration opens.</p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-300">Email Address <span className="text-red-500">*</span><input autoFocus required name="email" type="email" autoComplete="email" className="mt-2 min-h-11 w-full border border-white/20 bg-black px-3 text-sm text-white" /></label>
              <label className="block text-xs font-bold uppercase tracking-wide text-neutral-300">First Name <span className="normal-case text-neutral-500">(Optional)</span><input name="firstName" autoComplete="given-name" maxLength={80} className="mt-2 min-h-11 w-full border border-white/20 bg-black px-3 text-sm text-white" /></label>
              {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
              <button disabled={pending} className="w-full bg-red-700 px-5 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-60">{pending ? "Saving…" : "Notify Me"}</button>
              <p className="text-center text-xs leading-5 text-zinc-500">
                Your email will only be used to notify you when registration
                opens for the Eagle Mountain tournament. Nothing else.
              </p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
