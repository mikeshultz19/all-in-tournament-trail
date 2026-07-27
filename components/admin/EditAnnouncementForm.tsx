"use client";

import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  useActionState,
  useState,
} from "react";

import {
  deleteAnnouncementAction,
  updateAnnouncementAction,
} from "@/app/admin/announcements/[id]/edit/actions";
import {
  ANNOUNCEMENT_CONTENT_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
  type AnnouncementFormState,
} from "@/lib/announcement-form";
import type { Announcement } from "@/types/announcement";

interface EditAnnouncementFormProps {
  announcement: Announcement;
}

const initialState: AnnouncementFormState = {
  status: "idle",
  message: "",
  errors: {},
};

const inputClassName =
  "mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40";

const labelClassName =
  "text-xs font-black uppercase tracking-[0.12em] text-neutral-300";

export default function EditAnnouncementForm({
  announcement,
}: EditAnnouncementFormProps) {
  const updateAction = updateAnnouncementAction.bind(
    null,
    announcement.id,
  );

  const deleteAction = deleteAnnouncementAction.bind(
    null,
    announcement.id,
  );

  const [state, formAction, pending] = useActionState(
    updateAction,
    initialState,
  );

  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);

  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Delete "${announcement.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <>
      <Link
        href="/admin/announcements"
        className="inline-flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-[#D4A017]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to Announcements
      </Link>

      <header className="mt-8 border-b border-white/10 pb-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-red-500">
          Website Content
        </p>

        <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          Edit Announcement
        </h1>
      </header>

      <form action={formAction} className="mt-8 space-y-8">
        <fieldset className="space-y-6 border border-white/10 bg-[#111111] p-5 sm:p-7">
          <legend className="px-2 text-lg font-black uppercase text-red-500">
            Announcement Details
          </legend>

          <label className={labelClassName}>
            Title
            <input
              name="title"
              required
              maxLength={ANNOUNCEMENT_TITLE_MAX_LENGTH}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(state.errors.title)}
              className={inputClassName}
            />

            <span className="mt-2 block text-right text-xs text-neutral-500">
              {title.length}/{ANNOUNCEMENT_TITLE_MAX_LENGTH}
            </span>

            {state.errors.title && (
              <span
                role="alert"
                className="mt-2 block text-sm text-red-400"
              >
                {state.errors.title}
              </span>
            )}
          </label>

          <label className={labelClassName}>
            Message
            <textarea
              name="content"
              required
              rows={9}
              maxLength={ANNOUNCEMENT_CONTENT_MAX_LENGTH}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              aria-invalid={Boolean(state.errors.content)}
              className={`${inputClassName} resize-y`}
            />

            <span className="mt-2 block text-right text-xs text-neutral-500">
              {content.length}/{ANNOUNCEMENT_CONTENT_MAX_LENGTH}
            </span>

            {state.errors.content && (
              <span
                role="alert"
                className="mt-2 block text-sm text-red-400"
              >
                {state.errors.content}
              </span>
            )}
          </label>

          <label className="flex items-start gap-3 border border-white/10 bg-black/30 p-4">
            <input
              type="checkbox"
              name="isPinned"
              value="true"
              defaultChecked={announcement.is_pinned}
              className="mt-0.5 size-4 accent-[#D4A017]"
            />

            <span>
              <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
                Pin Announcement
              </span>

              <span className="mt-1 block text-sm text-neutral-500">
                Show this announcement before the others.
              </span>
            </span>
          </label>
        </fieldset>

        {state.message && (
          <p
            role="alert"
            className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {state.message}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#e2b22a] disabled:opacity-50"
          >
            <Save aria-hidden="true" className="size-4" />
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <section className="mt-10 border border-red-500/30 bg-red-500/5 p-5 sm:p-7">
        <h2 className="text-lg font-black uppercase text-red-400">
          Delete Announcement
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-400">
          This permanently removes the announcement from the Admin Center
          and homepage.
        </p>

        <form
          action={deleteAction}
          onSubmit={confirmDelete}
          className="mt-5"
        >
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-red-500 px-5 text-xs font-black uppercase tracking-[0.12em] text-red-400 transition hover:bg-red-500 hover:text-white"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete Announcement
          </button>
        </form>
      </section>
    </>
  );
}