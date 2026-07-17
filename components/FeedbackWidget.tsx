"use client";

import { FormEvent, useEffect, useState } from "react";

const categories = [
  "Website Issue",
  "Tournament Question",
  "Rule Clarification",
  "Feature Request",
  "General Feedback",
];

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    const openFeedback = () => {
      setStatus("idle");
      setIsOpen(true);
    };

    window.addEventListener("open-feedback", openFeedback);
    return () => window.removeEventListener("open-feedback", openFeedback);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function closeModal() {
    if (status !== "sending") {
      setIsOpen(false);
      setStatus("idle");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      category: String(formData.get("category") || ""),
      message: String(formData.get("message") || ""),
      website: String(formData.get("website") || ""),
    };

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to send feedback");
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setStatus("idle");
          setIsOpen(true);
        }}
        className="fixed right-0 top-1/2 z-[80] -translate-y-1/2 rounded-l-md border border-r-0 border-red-500/50 bg-red-700 px-2 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-2xl transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ writingMode: "vertical-rl" }}
        aria-label="Open feedback form"
      >
        Feedback
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl">
            <div className="border-b border-zinc-800 bg-black px-6 py-5">
              <p className="mb-1 text-xs font-black uppercase tracking-[0.22em] text-yellow-400">
                All-In Tournament Trail
              </p>
              <h2
                id="feedback-title"
                className="text-2xl font-black uppercase tracking-wide text-white"
              >
                Send Feedback
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Report a website issue, ask a question, or suggest an improvement.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close feedback form"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                ×
              </span>
            </button>

            {status === "success" ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-2xl text-green-400">
                  ✓
                </div>
                <h3 className="text-xl font-black uppercase text-white">
                  Feedback Sent
                </h3>
                <p className="mt-2 text-zinc-400">
                  Thanks for helping us improve the tournament trail.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-6 rounded-md bg-red-700 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                      Name <span className="text-zinc-600">(optional)</span>
                    </span>
                    <input
                      type="text"
                      name="name"
                      maxLength={100}
                      className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                      Email <span className="text-zinc-600">(optional)</span>
                    </span>
                    <input
                      type="email"
                      name="email"
                      maxLength={160}
                      className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                    Category
                  </span>
                  <select
                    name="category"
                    required
                    defaultValue=""
                    className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition focus:border-yellow-400"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                    Message
                  </span>
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    maxLength={3000}
                    rows={6}
                    className="w-full resize-y rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                    placeholder="Tell us what happened, what you need help with, or what you would like to see improved."
                  />
                </label>

                {status === "error" && (
                  <p className="rounded-md border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-300">
                    The message could not be sent. Please try again.
                  </p>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md border border-zinc-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="rounded-md bg-red-700 px-6 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending..." : "Send Feedback"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
