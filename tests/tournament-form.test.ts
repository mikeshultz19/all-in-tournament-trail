import { describe, expect, it } from "vitest";

import {
  tournamentFormData,
  tournamentFormToUpdate,
  tournamentToFormValues,
  validateTournamentForm,
} from "@/lib/tournament-form";
import { databaseTournament } from "@/tests/tournament-db-fixture";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("name", "Lake Fork Open");
  formData.set("lake", "Lake Fork");
  formData.set("tournamentDate", "2026-08-16T06:00");
  formData.set("registrationOpens", "2026-07-01T08:00");
  formData.set("registrationCloses", "2026-08-15T18:00");
  formData.set("status", "Registration Open");
  formData.set("isFeatured", "on");
  formData.set("showOnHomepage", "on");
  return formData;
}

describe("Tournament Information form", () => {
  it("prepopulates staff-friendly form values from a tournament record", () => {
    const values = tournamentToFormValues(databaseTournament);

    expect(values).toMatchObject({
      name: "Eagle Mountain",
      lake: "Eagle Mountain",
      tournamentDate: "2026-11-01T06:00",
      registrationCloses: "2026-10-31T21:00",
      status: "Registration Open",
      isFeatured: true,
      showOnHomepage: true,
    });
  });

  it("validates required fields and the registration window", () => {
    const formData = validFormData();
    formData.set("name", "");
    formData.set("registrationCloses", "2026-06-01T08:00");
    const errors = validateTournamentForm(tournamentFormData(formData));

    expect(errors.name).toBe("Enter the tournament name.");
    expect(errors.registrationCloses).toContain("after registration opens");
  });

  it("rejects unsupported statuses", () => {
    const formData = validFormData();
    formData.set("status", "Unknown");

    expect(
      validateTournamentForm(tournamentFormData(formData)).status,
    ).toBe("Choose a valid tournament status.");
  });

  it("maps valid values to database update fields and neutral attribution", () => {
    const update = tournamentFormToUpdate(
      tournamentFormData(validFormData()),
    );

    expect(update).toMatchObject({
      name: "Lake Fork Open",
      lake: "Lake Fork",
      status: "Registration Open",
      is_featured: true,
      show_on_homepage: true,
      updated_by: "AITT Staff",
    });
    expect(update.tournament_date).toBe("2026-08-16T11:00:00.000Z");
  });
});
