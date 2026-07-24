"use client";

import { useActionState } from "react";

import { saveTournamentAction } from "@/app/admin/tournament/actions";
import {
  tournamentToFormValues,
  type TournamentFormErrors,
  type TournamentFormState,
} from "@/lib/tournament-form";
import {
  TOURNAMENT_STATUSES,
  type Tournament,
} from "@/types/tournament";

interface TournamentInformationFormProps {
  tournament: Tournament;
}

const initialState: TournamentFormState = {
  status: "idle",
  message: "",
  errors: {},
};

function FieldError({
  errors,
  field,
}: {
  errors: TournamentFormErrors;
  field: keyof TournamentFormErrors;
}) {
  const message = errors[field];

  return message ? (
    <p id={`${field}-error`} className="mt-2 text-sm text-red-400" role="alert">
      {message}
    </p>
  ) : null;
}

const inputClassName =
  "mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40";
const labelClassName =
  "text-xs font-black uppercase tracking-[0.12em] text-neutral-300";

export default function TournamentInformationForm({
  tournament,
}: TournamentInformationFormProps) {
  const values = tournamentToFormValues(tournament);
  const action = saveTournamentAction.bind(null, tournament.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Tournament Details
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Tournament Name
            <input
              name="name"
              required
              defaultValue={values.name}
              aria-invalid={Boolean(state.errors.name)}
              aria-describedby={state.errors.name ? "name-error" : undefined}
              className={inputClassName}
            />
            <FieldError errors={state.errors} field="name" />
          </label>
          <label className={labelClassName}>
            Lake
            <input
              name="lake"
              required
              defaultValue={values.lake}
              aria-invalid={Boolean(state.errors.lake)}
              aria-describedby={state.errors.lake ? "lake-error" : undefined}
              className={inputClassName}
            />
            <FieldError errors={state.errors} field="lake" />
          </label>
          <label className={labelClassName}>
            Tournament Date
            <input
              name="tournamentDate"
              type="datetime-local"
              required
              defaultValue={values.tournamentDate}
              aria-invalid={Boolean(state.errors.tournamentDate)}
              aria-describedby={
                state.errors.tournamentDate
                  ? "tournamentDate-error"
                  : undefined
              }
              className={inputClassName}
            />
            <FieldError errors={state.errors} field="tournamentDate" />
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Tournament Description
            <textarea
              name="description"
              rows={5}
              defaultValue={values.description}
              className={`${inputClassName} resize-y`}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Launch Information
        </legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <label className={labelClassName}>
            Ramp
            <input
              name="ramp"
              defaultValue={values.ramp}
              className={inputClassName}
            />
          </label>
          <label className={labelClassName}>
            Launch Type
            <input
              name="launchType"
              defaultValue={values.launchType}
              className={inputClassName}
            />
          </label>
          <label className={labelClassName}>
            Morning Registration
            <input
              name="morningRegistration"
              defaultValue={values.morningRegistration}
              className={inputClassName}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Registration
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Registration Opens
            <input
              name="registrationOpens"
              type="datetime-local"
              defaultValue={values.registrationOpens}
              className={inputClassName}
            />
          </label>
          <label className={labelClassName}>
            Registration Closes
            <input
              name="registrationCloses"
              type="datetime-local"
              defaultValue={values.registrationCloses}
              aria-invalid={Boolean(state.errors.registrationCloses)}
              aria-describedby={
                state.errors.registrationCloses
                  ? "registrationCloses-error"
                  : undefined
              }
              className={inputClassName}
            />
            <FieldError errors={state.errors} field="registrationCloses" />
          </label>
          <label className={labelClassName}>
            Tournament Status
            <select
              name="status"
              defaultValue={values.status}
              aria-invalid={Boolean(state.errors.status)}
              aria-describedby={
                state.errors.status ? "status-error" : undefined
              }
              className={inputClassName}
            >
              {TOURNAMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors} field="status" />
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Website
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={`${labelClassName} sm:col-span-2`}>
            Hero Image URL
            <input
              name="heroImageUrl"
              type="text"
              inputMode="url"
              placeholder="/images/tournament-hero.png"
              defaultValue={values.heroImageUrl}
              aria-invalid={Boolean(state.errors.heroImageUrl)}
              aria-describedby={
                state.errors.heroImageUrl ? "heroImageUrl-error" : undefined
              }
              className={inputClassName}
            />
            <FieldError errors={state.errors} field="heroImageUrl" />
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-200">
            <input
              name="isFeatured"
              type="checkbox"
              defaultChecked={values.isFeatured}
              className="size-4 accent-[#D4A017]"
            />
            Featured Tournament
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-200">
            <input
              name="showOnHomepage"
              type="checkbox"
              defaultChecked={values.showOnHomepage}
              className="size-4 accent-[#D4A017]"
            />
            Show on Homepage
          </label>
        </div>
      </fieldset>

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`border px-4 py-3 text-sm font-semibold ${
            state.status === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center bg-red-700 px-7 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Saving Changes…" : "Save Changes"}
      </button>
    </form>
  );
}
