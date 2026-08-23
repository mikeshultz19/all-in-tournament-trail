import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/admin/registration-review/page.tsx", "utf8");
const actions = readFileSync("app/admin/registration-review/actions.ts", "utf8");
const checkIn = readFileSync("app/admin/tournament-manager/prepare/check-in-actions.ts", "utf8");
const controls = readFileSync("components/admin/RegistrationOperationsControls.tsx", "utf8");
const roster = readFileSync("lib/tournament-registration-roster.ts", "utf8");
const toolbar = readFileSync("components/admin/RegistrationRosterToolbar.tsx", "utf8");
const resolutionForm = readFileSync("components/admin/RegistrationReviewResolutionForm.tsx", "utf8");
const membershipForm = readFileSync("components/admin/HistoricalMembershipReviewForm.tsx", "utf8");
const allRegistrations = readFileSync("app/admin/registrations/page.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202608200002_add_admin_walkup_registration.sql", "utf8");
const boatNumberMigration = readFileSync("supabase/migrations/202608220001_assign_sequential_boat_numbers.sql", "utf8");

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

  it("shows one authoritative Member Status without exposing derived eligibility", () => {
    expect(page).toContain("'Member Status'");
    expect(page).not.toContain("'Member Benefits'");
    expect(page).not.toContain("row.memberBenefitsEligible");
    expect(page).not.toContain('"Eligible"');
    expect(page).not.toContain('"Not Eligible"');
    expect(page).toContain("row.angler1.memberStatus");
    expect(roster).toContain("snapshot?.eligibleForTournament === true");
    expect(roster).toContain('"Member" | "Non-Member" | "Needs Review"');
  });

  it("offers All Registrations, Needs Review, and Walk-Ups as independent client filters", () => {
    const allPosition = toolbar.indexOf('selectFilter("all")}>All Registrations');
    const reviewPosition = toolbar.indexOf('selectFilter("needs_review")}>Needs Review');
    const walkUpPosition = toolbar.indexOf('selectFilter("walk_ups")}>Walk-Ups');
    expect(allPosition).toBeGreaterThan(-1);
    expect(reviewPosition).toBeGreaterThan(allPosition);
    expect(walkUpPosition).toBeGreaterThan(reviewPosition);
    expect(toolbar).toContain('aria-label="Registration filters"');
    expect(page).toContain('requestedFilter === "needs_review" || requestedFilter === "walk_ups"');
  });

  it("filters the shared active roster to walk-ups and sorts them by boat number", () => {
    expect(page).toContain('.filter((row) => row.registrationSource === "walk_up")');
    expect(page).toContain("left.boatNumber ?? Number.MAX_SAFE_INTEGER");
    expect(page).toContain(': allRows;');
    expect(page).not.toMatch(/getTournamentRegistrationRoster[\s\S]{0,200}registrationSource/);
    expect(roster).toContain('.eq("registration_status", "active")');
  });

  it("adds an active Walk-Ups count without changing the existing summary calculations", () => {
    expect(page).toContain('walkUps: allRows.filter((row) => row.registrationSource === "walk_up").length');
    expect(page).toContain('Metric label="Walk-Ups" value={summary.walkUps}');
    expect(page).toContain("const baseSummary = summarizeTournamentRegistrationRoster(allRows)");
    expect(page).toContain("needReview: allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id)).length");
    expect(roster).toContain('.eq("registration_status", "active")');
    expect(page).toContain('className="mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm"');
  });

  it("removes payment and financial summaries from the tournament-morning roster", () => {
    expect(page).not.toContain('Metric label="Payment Recorded"');
    expect(page).not.toContain("row.paymentStatus");
    expect(page).not.toContain("row.totalPaidCents");
    expect(page).not.toContain("MoneyLine");
    expect(page).not.toContain("Card Fee");
  });

  it("uses one compact Team/Solo row with selected pots and operational yes/no fields", () => {
    expect(page).toContain("function RosterRow");
    expect(page).toContain("row.angler1.displayName");
    expect(page).toContain("row.angler2.displayName");
    expect(page).toContain("row.angler1.memberStatus");
    expect(page).toContain("row.angler2.memberStatus");
    expect(page).toContain('row.memberPot ? title(row.memberPot) : "None"');
    expect(page).toContain("yesNo(row.insurance)");
    expect(page).toContain("yesNo(row.bigBass)");
    expect(page).toContain("compactDateTime(row.registeredAt)");
    expect(page).not.toContain("Bronze: No");
    expect(page).not.toContain("Silver: No");
    expect(page).not.toContain("Gold: No");
    expect(page).toContain("'Boat #','Type','Participants'");
    expect(page).toContain("{title(row.registrationType)}</td>");
    expect(page).toContain('row.angler2 ? ` / ${row.angler2.displayName}` : ""');
  });

  it("keeps general registration editing out of the roster and in All Registrations", () => {
    expect(page).not.toContain("RegistrationEditControl");
    expect(page).not.toContain("Edit / Registration Details");
    expect(allRegistrations).toContain("RegistrationEditControl");
    expect(allRegistrations).toContain('row.status === "active"');
  });

  it("keeps Needs Review independent and preserves check-in actions in every filtered row", () => {
    expect(page).toContain("allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id))");
    expect(page).toContain("<RosterActions row={row}");
    expect(page).toContain("<RegistrationCheckInControl");
  });

  it("shows review UI only while a review is unresolved", () => {
    expect(page).toContain('reviews.filter((review) => review.status === "review_required")');
    expect(page).toContain("pendingReviews.map((review)");
    expect(page).toContain("RegistrationReviewResolutionForm");
    expect(page).toContain("HistoricalMembershipReviewForm");
    expect(page).not.toContain("Review complete.");
    expect(page).not.toContain("reopenRegistrationReviewAction");
    expect(page).toContain("<details key={review.id}");
  });

  it("uses plain-language review decisions without exposing internal identity terms", () => {
    expect(page).toContain("getRegistrationReviewPresentation(review)");
    expect(resolutionForm).toContain("Confirm Match");
    expect(resolutionForm).toContain("Approve New Angler");
    expect(resolutionForm).toContain("Optional review note");
    expect(resolutionForm).not.toContain("Confirm Existing");
    expect(membershipForm).toContain("Confirm Member");
    expect(membershipForm).toContain("Confirm Non-Member");
    expect(membershipForm).toContain("Confirm Membership Purchase");
    expect(resolutionForm).toContain("Registration Submission");
    expect(resolutionForm).toContain("Existing Angler");
    expect(resolutionForm).toContain("Membership Selection");
    expect(resolutionForm).toContain("Membership Status");
    expect(resolutionForm).toContain("Membership Effective");
    expect(resolutionForm).toContain("onChange={(event) => setSelectedAnglerId(event.target.value)}");
    expect(resolutionForm).toContain('value="existing"');
    expect(resolutionForm).toContain('value="new"');
  });

  it("searches the current filtered roster by team, either angler, or exact boat number", () => {
    expect(toolbar).toContain('placeholder="Search name or boat #"');
    expect(page).toContain("const rows = search ? filteredRows.filter((row) => registrationMatchesSearch(row, search)) : filteredRows");
    expect(page).toContain('`${row.angler1.displayName} / ${row.angler2?.displayName ?? ""}`');
    expect(page).toContain('row.angler1.displayName.toLocaleLowerCase("en-US").includes(normalizedSearch)');
    expect(page).toContain('row.angler2?.displayName.toLocaleLowerCase("en-US").includes(normalizedSearch)');
    expect(page).toContain('String(row.boatNumber) === search');
  });

  it("keeps search case-insensitive, composable with every filter, and clearable", () => {
    expect(page).toContain('search.toLocaleLowerCase("en-US")');
    expect(toolbar).toContain('params.set("filter", nextFilter)');
    expect(toolbar).toContain('params.set("search", nextSearch.trim())');
    expect(toolbar).toContain('aria-label="Clear search"');
    expect(toolbar).toContain('router.replace(href(filter, ""), { scroll: false })');
    expect(toolbar).toContain('router.replace(href(nextFilter, searchText), { scroll: false })');
    expect(page).toContain(': filteredRows;');
    expect(page).toContain('.filter((row) => row.registrationSource === "walk_up")');
    expect(page).toContain('allRows.filter((row) => row.needsReview || pendingReviewIds.has(row.id))');
    expect(roster).toContain('.eq("registration_status", "active")');
  });

  it("wraps the compact search below filters without horizontal scrolling on mobile", () => {
    expect(toolbar).toContain('className="mt-4 flex flex-col gap-3 sm:flex-row');
    expect(toolbar).toContain('className="relative min-w-0 flex-1"');
  });

  it("refreshes roster server data locally while preserving query and scroll state", () => {
    expect(toolbar).toContain("startRefresh(() => router.refresh())");
    expect(toolbar).not.toContain("useEffect");
    expect(page).toContain('key={`${filter}:${search}`}');
    expect(toolbar).not.toContain("window.location");
    expect(toolbar).toContain('{refreshing ? "Refreshing…" : "Refresh"}');
    expect(toolbar).toContain('{ tournament: tournamentId }');
  });

  it("uses mobile cards so Check In is not trapped in the desktop table", () => {
    expect(page).toContain('data-testid="mobile-registration-roster"');
    expect(page).toContain('className="grid gap-3 p-3 md:hidden"');
    expect(page).toContain('className="hidden overflow-x-auto md:block"');
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
    const createWalkUpAction = actions.slice(actions.indexOf("export async function createWalkUpRegistrationAction"), actions.indexOf("export async function updateRegistrationOperationsAction"));
    expect(actions).toContain("await requireAdminUser()");
    expect(createWalkUpAction).toContain('"admin_create_sequential_walkup_registration"');
    expect(createWalkUpAction).not.toContain("p_boat_number");
    expect(migration).toContain("public.complete_durable_registration(");
    expect(migration).toContain("registration_source = 'walk_up'");
    expect(migration).toContain("p_payment_method");
    expect(controls).toContain("+ Add Walk-Up");
    expect(controls).toContain("The next tournament boat number is assigned automatically.");
    expect(controls).not.toContain('name="boatNumber" type="number" min="1" required className={input}');
    for (const field of ["StreetAddress", "City", "State", "ZipCode", "Email", "Phone", "Membership"]) {
      expect(controls).toContain(`\${prefix}${field}`);
    }
    expect(migration).toContain("participant_contact_snapshot = v_contact_snapshot");
  });

  it("serializes walk-up numbering after every historical tournament boat number", () => {
    expect(boatNumberMigration).toContain("public.admin_create_sequential_walkup_registration");
    expect(boatNumberMigration).toContain("'tournament-boat-number:' || p_tournament_id::text");
    expect(boatNumberMigration).toContain("coalesce(max(boat_number), 0) + 1");
    expect(boatNumberMigration).toContain("where tournament_id = p_tournament_id");
    expect(boatNumberMigration).not.toMatch(/where tournament_id = p_tournament_id[\s\S]{0,100}registration_status = 'active'/);
    expect(boatNumberMigration).toContain("public.admin_create_walkup_registration(");
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
    expect(csv).toContain('"angler_1_name"');
    expect(csv).toContain('"member_pots"');
    expect(csv).not.toContain('"total_paid"');
    expect(csv).not.toContain('"payment_status"');
    expect(print).toContain("getTournamentRegistrationRoster(tournament.id)");
    expect(print).toContain("size: landscape");
    expect(print).not.toContain("totalPaidCents");
    expect(print).not.toContain("paymentStatus");
  });
});
