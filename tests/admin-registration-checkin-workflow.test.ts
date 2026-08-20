import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const actions = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const checkIn = readFileSync("app/admin/tournament-manager/prepare/check-in-actions.ts", "utf8");
const controls = readFileSync("components/admin/RegistrationOperationsControls.tsx", "utf8");
const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608200002_add_admin_walkup_registration.sql", "utf8");

describe("unified Registration & Check-In workflow", () => {
  it("defaults to the next active tournament and filters without a mutation action", () => {
    expect(page).toContain("getNextUpcomingTournament()");
    expect(page).toContain("?? currentTournament");
    expect(page).toContain('<form className="mt-6 flex max-w-2xl gap-3">');
    expect(page).toContain('name="tournament"');
    expect(page).not.toMatch(/<form[^>]+action=[^>]+name="tournament"/);
    expect(roster).toContain('.eq("tournament_id", tournamentId)');
  });

  it("shows the selected tournament, boat identity, and one authoritative roster", () => {
    expect(page).toContain("Current Tournament");
    expect(page).toContain("selectedTournament.name");
    expect(page).toContain("row.boatNumber");
    expect(page).toContain("getTournamentRegistrationRoster(selectedTournament.id)");
  });

  it("uses mobile cards so Check In is not trapped in the desktop table", () => {
    expect(page).toContain('data-testid="mobile-registration-roster"');
    expect(page).toContain('className="mt-4 grid gap-3 md:hidden"');
    expect(page).toContain('className="mt-4 hidden overflow-x-auto');
    expect(page).toContain("<RosterActions row={row}");
  });

  it("requires a boat number and resolved review before saving check-in", () => {
    expect(checkIn).toContain('.not("boat_number", "is", null)');
    expect(checkIn).toContain('.neq("identity_review_status", "review_required")');
    expect(checkIn).toContain("checked_in_at: checkedIn ? new Date().toISOString() : null");
    expect(checkIn).toContain('.eq("registration_status", "active")');
    expect(checkIn).toContain("await requireAdminUser()");
  });

  it("locks normal edits after check-in and provides intentional reopening", () => {
    expect(controls).toContain("Locked after check-in");
    expect(readFileSync("components/admin/RegistrationCheckInControl.tsx", "utf8")).toContain("Edit / Reopen");
    expect(readFileSync("components/admin/RegistrationCheckInControl.tsx", "utf8")).toContain("window.confirm");
    expect(migration).toContain("and checked_in_at is null");
  });

  it("creates a paid walk-up through the protected durable registration boundary", () => {
    expect(actions).toContain("await requireAdminUser()");
    expect(actions).toContain('"admin_create_walkup_registration"');
    expect(migration).toContain("public.complete_durable_registration(");
    expect(migration).toContain("registration_source = 'walk_up'");
    expect(migration).toContain("p_payment_method");
    expect(controls).toContain("+ Add Walk-Up");
    for (const field of ["StreetAddress", "City", "State", "ZipCode", "Email", "Phone", "Membership"]) {
      expect(controls).toContain(`\${prefix}${field}`);
    }
    expect(migration).toContain("participant_contact_snapshot = v_contact_snapshot");
  });

  it("reuses membership identity and does not create non-member memberships", () => {
    expect(migration).toContain("'member-email:' || v_email");
    expect(migration).toContain("where angler_id = v_angler_id and season_id = v_tournament.season_id");
    expect(migration).toContain("v_angler ->> 'membership' = 'joining'");
    expect(migration).not.toMatch(/v_angler ->> 'membership' = 'non-member'[\s\S]{0,200}insert into public\.memberships/);
  });

  it("requires confirmation to cancel only an unchecked walk-up and retains durable records", () => {
    expect(controls).toContain("window.confirm");
    expect(controls).toContain("Cancel Walk-Up");
    expect(controls).toContain("Permanent anglers, memberships, and review history will be retained");
    expect(actions).toContain('"admin_cancel_walkup_registration"');
    expect(migration).toContain("registration_source = 'walk_up' and registration_status = 'active'");
    expect(migration).toContain("set registration_status = 'cancelled'");
    expect(migration).toContain("cancelled_by_admin_id = p_admin_user_id");
    expect(migration).not.toContain("delete from public.tournament_registrations");
    expect(migration).not.toContain("delete from public.memberships");
    expect(migration).not.toContain("delete from public.anglers");
  });

  it("excludes cancelled registrations from active rosters, exports, and registration summaries", () => {
    expect(roster.match(/\.eq\("registration_status", "active"\)/g) ?? []).toHaveLength(2);
    expect(roster).toContain('registration_status: "active" | "cancelled"');
    expect(migration).toContain("where boat_number is not null and registration_status = 'active'");
    expect(readFileSync("lib/tournament-registrations.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("lib/tournament-collection-summary.ts", "utf8")).toContain('.eq("registration_status", "active")');
    expect(readFileSync("lib/registration-identity-review.ts", "utf8").match(/registration_status/g) ?? []).toHaveLength(3);
  });

  it("preserves duplicate canonical emails for identity review instead of leaking a scalar query error", () => {
    expect(migration.match(/select array_agg\(id order by id::text\) into v_email_match_ids/g) ?? []).toHaveLength(2);
    expect(migration.match(/AITT_REGISTRATION_IDENTITY_REVIEW_REQUIRED/g) ?? []).toHaveLength(2);
    expect(migration).not.toMatch(/select id into v_(existing_id|angler_id) from public\.anglers/);
  });

  it("keeps export and print behavior on the same roster source", () => {
    const csv = readFileSync("app/admin/registration-review/export/route.ts", "utf8");
    const print = readFileSync("app/admin/registration-review/print/page.tsx", "utf8");
    expect(csv).toContain("getTournamentRegistrationRoster(tournament.id)");
    expect(csv).toContain('"boat_number"');
    expect(csv).toContain('`angler_${position}_street_address`');
    expect(print).toContain("getTournamentRegistrationRoster(tournament.id)");
  });
});
