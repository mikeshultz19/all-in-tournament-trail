"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createMemberAction } from "@/app/admin/members/new/actions";
import type { AddMemberFormState } from "@/lib/add-member-form";
import type { MembershipTournamentOption } from "@/lib/admin-members";
import {
  MEMBERSHIP_STATUSES,
  type Season,
} from "@/types/aoy";

const initialState: AddMemberFormState = {
  status: "idle",
  message: "",
  errors: {},
};

const inputClassName =
  "mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40";
const labelClassName =
  "text-xs font-black uppercase tracking-[0.12em] text-neutral-300";

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  return message ? (
    <span id={id} className="mt-2 block text-sm text-red-400" role="alert">
      {message}
    </span>
  ) : null;
}

function formatTournamentOption(tournament: MembershipTournamentOption) {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(tournament.tournament_date));

  return `${tournament.name} — ${date}`;
}

export default function AddMemberForm({
  seasons,
  defaultSeasonId,
  tournaments,
  defaultEffectiveDate,
}: {
  seasons: Season[];
  defaultSeasonId: string;
  tournaments: MembershipTournamentOption[];
  defaultEffectiveDate: string;
}) {
  const [state, formAction, pending] = useActionState(
    createMemberAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-8">
      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Member Information
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            First Name
            <input
              name="firstName"
              required
              autoComplete="given-name"
              aria-invalid={Boolean(state.errors.firstName)}
              aria-describedby={
                state.errors.firstName ? "first-name-error" : undefined
              }
              className={inputClassName}
            />
            <FieldError
              id="first-name-error"
              message={state.errors.firstName}
            />
          </label>
          <label className={labelClassName}>
            Last Name
            <input
              name="lastName"
              required
              autoComplete="family-name"
              aria-invalid={Boolean(state.errors.lastName)}
              aria-describedby={
                state.errors.lastName ? "last-name-error" : undefined
              }
              className={inputClassName}
            />
            <FieldError
              id="last-name-error"
              message={state.errors.lastName}
            />
          </label>
          <label className={labelClassName}>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(state.errors.email)}
              aria-describedby={
                state.errors.email ? "email-error" : undefined
              }
              className={inputClassName}
            />
            <FieldError id="email-error" message={state.errors.email} />
          </label>
          <label className={labelClassName}>
            Phone
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              className={inputClassName}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <legend className="px-2 text-lg font-black uppercase tracking-tight text-red-500">
          Membership Information
        </legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={labelClassName}>
            Membership Season
            <select
              name="seasonId"
              required
              defaultValue={defaultSeasonId}
              aria-describedby="season-description"
              className={inputClassName}
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
            <span
              id="season-description"
              className="mt-2 block text-xs font-normal normal-case tracking-normal text-neutral-500"
            >
              New memberships are recorded for the active season.
            </span>
            <FieldError id="season-error" message={state.errors.seasonId} />
          </label>
          <label className={labelClassName}>
            Membership Status
            <select
              name="status"
              defaultValue="active"
              aria-invalid={Boolean(state.errors.status)}
              aria-describedby={
                state.errors.status ? "status-error" : undefined
              }
              className={inputClassName}
            >
              {MEMBERSHIP_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <FieldError id="status-error" message={state.errors.status} />
          </label>
          <label className={labelClassName}>
            Membership Effective Date
            <input
              name="effectiveDate"
              type="date"
              required
              defaultValue={defaultEffectiveDate}
              aria-invalid={Boolean(state.errors.effectiveDate)}
              aria-describedby={
                state.errors.effectiveDate
                  ? "effective-date-error"
                  : "effective-date-description"
              }
              className={inputClassName}
            />
            <span
              id="effective-date-description"
              className="mt-2 block text-xs font-normal normal-case tracking-normal text-neutral-500"
            >
              Administrative recordkeeping date only.
            </span>
            <FieldError
              id="effective-date-error"
              message={state.errors.effectiveDate}
            />
          </label>
          <label className={labelClassName}>
            First Eligible Tournament
            <select
              name="firstEligibleTournamentId"
              required
              defaultValue={
                tournaments.length === 1 ? tournaments[0].id : ""
              }
              aria-invalid={Boolean(
                state.errors.firstEligibleTournamentId,
              )}
              aria-describedby={
                state.errors.firstEligibleTournamentId
                  ? "first-eligible-tournament-error"
                  : "first-eligible-tournament-description"
              }
              className={inputClassName}
            >
              <option value="" disabled>
                Select a tournament
              </option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {formatTournamentOption(tournament)}
                </option>
              ))}
            </select>
            <span
              id="first-eligible-tournament-description"
              className="mt-2 block text-xs font-normal normal-case tracking-normal text-neutral-500"
            >
              Determines AOY, Championship, and member-benefit eligibility.
            </span>
            <FieldError
              id="first-eligible-tournament-error"
              message={state.errors.firstEligibleTournamentId}
            />
          </label>
        </div>
      </fieldset>

      {state.message && (
        <div
          className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          <p>{state.message}</p>
          {state.duplicateAnglerId && (
            <Link
              href={`/admin/members/${state.duplicateAnglerId}`}
              className="mt-2 inline-flex font-black uppercase tracking-[0.1em] text-[#D4A017] underline underline-offset-4"
            >
              View Existing Member
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/admin/members"
          className="inline-flex min-h-12 items-center justify-center border border-white/15 px-6 text-sm font-black uppercase tracking-[0.12em] text-neutral-300 transition hover:border-white/30 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending || tournaments.length === 0}
          className="inline-flex min-h-12 items-center justify-center bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#e2b22a] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving Member…" : "Save Member"}
        </button>
      </div>
    </form>
  );
}
