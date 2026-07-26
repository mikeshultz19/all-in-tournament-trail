"use client";

import { useActionState, useState } from "react";

import { createAnnouncementAction } from "@/app/admin/announcements/new/actions";
import {
  ANNOUNCEMENT_CONTENT_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
  type AnnouncementFormState,
} from "@/lib/announcement-form";

interface AnnouncementFormProps {
  events: readonly { id: string; name: string }[];
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

export default function AnnouncementForm({
  events,
}: AnnouncementFormProps) {
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

        <div className="grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Event
            <select
              name="tournamentId"
              defaultValue=""
              aria-invalid={Boolean(state.errors.tournamentId)}
              className={inputClassName}
            >
              <option value="">Any Event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
            {state.errors.tournamentId && (
              <span className="mt-2 block text-sm text-red-400" role="alert">
                {state.errors.tournamentId}
              </span>
            )}
          </label>

          <label className={`${labelClassName} sm:col-span-2`}>
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
            <CharacterCounter
              current={title.length}
              maximum={ANNOUNCEMENT_TITLE_MAX_LENGTH}
            />
            {state.errors.title && (
              <span className="mt-2 block text-sm text-red-400" role="alert">
                {state.errors.title}
              </span>
            )}
          </label>

          <label className={`${labelClassName} sm:col-span-2`}>
            Message
            <textarea
              name="content"
              required
              rows={7}
              maxLength={ANNOUNCEMENT_CONTENT_MAX_LENGTH}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              aria-invalid={Boolean(state.errors.content)}
              className={`${inputClassName} resize-y`}
            />
            <CharacterCounter
              current={content.length}
              maximum={ANNOUNCEMENT_CONTENT_MAX_LENGTH}
            />
            {state.errors.content && (
              <span className="mt-2 block text-sm text-red-400" role="alert">
                {state.errors.content}
              </span>
            )}
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
          className="inline-flex min-h-12 items-center justify-center bg-red-700 px-6 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Announcement"}
        </button>
      </div>
    </form>
  );
}
