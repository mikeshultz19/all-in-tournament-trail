"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const contactEmail = "info@allintrail.com";

const emailSubject = encodeURIComponent(
  "All-In Tournament Trail Website Inquiry"
);

const emailBody = encodeURIComponent(
  [
    "Hello All-In Tournament Trail,",
    "",
    "I am contacting you regarding:",
    "",
    "",
    "My name:",
    "",
    "Best email or phone number:",
    "",
    "Message:",
    "",
  ].join("\n")
);

const mailtoLink = `mailto:${contactEmail}?subject=${emailSubject}&body=${emailBody}`;

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

  useEffect(() => {
    function openContact() {
      setIsOpen(true);
    }

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
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="fixed right-0 top-1/2 z-[80] -translate-y-1/2 rounded-l-md border border-r-0 border-red-500/50 bg-red-700 px-2 py-4 text-xs font-black uppercase tracking-[0.18em] text-white shadow-2xl transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        style={{ writingMode: "vertical-rl" }}
        aria-label="Open contact information"
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

              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Ask a tournament question, request a rule clarification, report
                a website issue, share a suggestion, or contact us about
                sponsorship opportunities.
              </p>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-md p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              aria-label="Close contact information"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                ×
              </span>
            </button>

            <div className="p-6">
              <div className="rounded-lg border border-zinc-800 bg-black/50 p-5">
                <p className="text-sm leading-6 text-zinc-300">
                  Send the AITT team an email and we will respond as soon as
                  possible.
                </p>

                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-4 inline-flex text-base font-black text-yellow-400 transition hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400"
                >
                  {contactEmail}
                </a>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-zinc-700 px-5 py-3 text-sm font-black uppercase tracking-wide text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Close
                </button>

                <a
                  href={mailtoLink}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-700 px-6 py-3 text-center text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  Open Email
                </a>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
                The Open Email button uses the email application configured on
                your device.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}