"use client";

import { useActionState, useState } from "react";

import { createAnnouncementAction } from "@/app/admin/announcements/new/actions";
import {
  ANNOUNCEMENT_CONTENT_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
  type AnnouncementFormState,
} from "@/lib/announcement-form";

const initialState: AnnouncementFormState = {
  status: "idle",
  message: "",
  errors: {},
};

const inputClassName =
  "mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40";

const labelClassName =
  "text-xs font-black uppercase tracking-[0.12em] text-neutral-300";

function CharacterCounter({
  current,
  maximum,
}: {
  current: number;
  maximum: number;
}) {
  return (
    <span className="mt-2 block text-right text-xs font-medium text-neutral-500">
      {current}/{maximum}
    </span>
  );
}

export default function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(
    createAnnouncementAction,
    initialState,
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Announcement Details
        </legend>

        <div className="grid gap-5">
          <label className={labelClassName}>
            Title
            <input
              name="title"
              required
              maxLength={ANNOUNCEMENT_TITLE_MAX_LENGTH}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(state.errors.title)}
              aria-describedby={
                state.errors.title ? "announcement-title-error" : undefined
              }
              className={inputClassName}
            />

            <CharacterCounter
              current={title.length}
              maximum={ANNOUNCEMENT_TITLE_MAX_LENGTH}
            />

            {state.errors.title && (
              <span
                id="announcement-title-error"
                className="mt-2 block text-sm text-red-400"
                role="alert"
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
              aria-describedby={
                state.errors.content
                  ? "announcement-content-error"
                  : undefined
              }
              className={`${inputClassName} resize-y`}
            />

            <CharacterCounter
              current={content.length}
              maximum={ANNOUNCEMENT_CONTENT_MAX_LENGTH}
            />

            {state.errors.content && (
              <span
                id="announcement-content-error"
                className="mt-2 block text-sm text-red-400"
                role="alert"
              >
                {state.errors.content}
              </span>
            )}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Publish Date
              <input
                type="datetime-local"
                name="publishDate"
                required
                aria-invalid={Boolean(state.errors.publishDate)}
                className={inputClassName}
              />
              {state.errors.publishDate && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.publishDate}
                </span>
              )}
            </label>

            <label className={labelClassName}>
              Display Order
              <input
                type="number"
                name="displayOrder"
                min="0"
                step="1"
                defaultValue="0"
                aria-invalid={Boolean(state.errors.displayOrder)}
                className={inputClassName}
              />
              {state.errors.displayOrder && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.displayOrder}
                </span>
              )}
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Link Label <span className="text-neutral-500">(Optional)</span>
              <input
                name="linkLabel"
                aria-invalid={Boolean(state.errors.linkLabel)}
                className={inputClassName}
              />
              {state.errors.linkLabel && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.linkLabel}
                </span>
              )}
            </label>

            <label className={labelClassName}>
              Link URL <span className="text-neutral-500">(Optional)</span>
              <input
                name="linkUrl"
                placeholder="/register or https://example.com"
                aria-invalid={Boolean(state.errors.linkUrl)}
                className={inputClassName}
              />
              {state.errors.linkUrl && (
                <span className="mt-2 block text-sm text-red-400" role="alert">
                  {state.errors.linkUrl}
                </span>
              )}
            </label>
          </div>

          <label className="flex items-start gap-3 border border-white/10 bg-black/30 p-4">
            <input
              type="checkbox"
              name="isPublished"
              value="true"
              className="mt-0.5 size-4 accent-[#D4A017]"
            />
            <span>
              <span className="block text-xs font-black uppercase tracking-[0.12em] text-neutral-300">
                Published
              </span>
              <span className="mt-1 block text-sm leading-6 text-neutral-500">
                Published announcements appear on the homepage when their
                publish date arrives.
              </span>
            </span>
          </label>
        </div>
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
          className="inline-flex min-h-12 items-center justify-center bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#e2b22a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Announcement"}
        </button>
      </div>
    </form>
  );
}
