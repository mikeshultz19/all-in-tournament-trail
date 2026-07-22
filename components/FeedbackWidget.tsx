"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const categories = [
  "General Question",
  "Tournament Question",
  "Rule Clarification",
  "Website Issue",
  "Suggestion",
  "Sponsor Inquiry",
  "Website Design & Development",
  "Other",
];

export default function FeedbackWidget() {
  const pathname = usePathname();

  return (
    <FeedbackWidgetContent
      key={pathname}
      initiallyOpen={pathname === "/contact"}
    />
  );
}

function FeedbackWidgetContent({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  useEffect(() => {
    const openContact = () => {
      setStatus("idle");
      setIsOpen(true);
    };

    window.addEventListener("open-feedback", openContact);
    window.addEventListener("open-contact", openContact);

    return () => {
      window.removeEventListener("open-feedback", openContact);
      window.removeEventListener("open-contact", openContact);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function openModal() {
    setStatus("idle");
    setIsOpen(true);
  }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to send message");
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
        onClick={openModal}
        className="fixed right-0 top-1/2 z-[80] -translate-y-1/2 rounded-l-md border border-r-0 border-red-500/50 bg-red-700 px-2 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-2xl transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ writingMode: "vertical-rl" }}
        aria-label="Open contact form"
      >
        Contact
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
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
                id="contact-title"
                className="text-2xl font-black uppercase tracking-wide text-white"
              >
                Contact Us
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Ask a question, report an issue, share a suggestion, or contact
                us about sponsorship opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              aria-label="Close contact form"
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
                  Message Sent
                </h3>

                <p className="mt-2 text-zinc-400">
                  Thanks for contacting All-In Tournament Trail. We will review
                  your message as soon as possible.
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
                      Name
                    </span>

                    <input
                      type="text"
                      name="name"
                      required
                      maxLength={100}
                      className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                      Email
                    </span>

                    <input
                      type="email"
                      name="email"
                      required
                      maxLength={160}
                      className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400"
                      placeholder="you@example.com"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-wider text-zinc-300">
                    Reason for Contact
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
                    placeholder="Tell us how we can help."
                  />
                </label>

                {status === "error" && (
                  <p className="rounded-md border border-red-900 bg-red-950/60 px-4 py-3 text-sm text-red-300">
                    Your message could not be sent. Please try again.
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
                    {status === "sending" ? "Sending..." : "Send Message"}
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
