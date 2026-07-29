"use client";

import { useActionState } from "react";

import {
  saveActiveSeasonAction,
  type ActiveSeasonFormState,
} from "@/app/admin/settings/actions";
import type { Season } from "@/types/aoy";

const initialState: ActiveSeasonFormState = {
  status: "idle",
  message: "",
};

export default function ActiveSeasonForm({
  seasons,
  activeSeasonId,
}: {
  seasons: Season[];
  activeSeasonId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveActiveSeasonAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 max-w-xl">
      <label
        htmlFor="active-membership-season"
        className="text-xs font-black uppercase tracking-[0.12em] text-neutral-300"
      >
        Active Membership Season
      </label>
      <select
        id="active-membership-season"
        name="seasonId"
        required
        defaultValue={activeSeasonId ?? ""}
        className="mt-2 min-h-11 w-full border border-white/15 bg-[#0B0B0B] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#D4A017] focus-visible:ring-2 focus-visible:ring-[#D4A017]/40"
      >
        <option value="" disabled>
          Select a season
        </option>
        {seasons.map((season) => (
          <option key={season.id} value={season.id}>
            {season.name}
          </option>
        ))}
      </select>

      {state.message && (
        <p
          className={`mt-3 text-sm ${
            state.status === "success" ? "text-green-400" : "text-red-400"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || seasons.length === 0}
        className="mt-5 inline-flex min-h-11 items-center justify-center bg-[#D4A017] px-6 text-sm font-black uppercase tracking-[0.12em] text-black transition hover:bg-[#e2b22a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
