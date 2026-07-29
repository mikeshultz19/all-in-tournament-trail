# Memberships and Registration

## Purpose

This guide explains how AITT identifies members, determines eligibility, accepts
entries, and prepares the official tournament field.

## Membership seasons

Each membership belongs to one Membership Season. Admin Settings controls the
single Active Membership Season. Member creation defaults to that season; do
not select a competing active season elsewhere.

If no season exists, the system can create the initial `2026–2027` season.
Changing the active season affects which records Members and Add Member use.

## New and existing memberships

Admin can create a member from a completed physical form. The member record
stores name and supported contact information; its membership stores status,
season, Effective Date, and First Eligible Tournament. Possible statuses are
Active, Cancelled, and Refunded. The person can also be Active or Inactive for
future administration.

The Add Member process checks strong duplicate identifiers such as email and
does not silently merge people. The member and membership are created together
so one cannot remain without the other.

Renewal editing is not currently available. Do not describe renewal as an
operational feature.

## First Eligible Tournament

First Eligible Tournament is the business eligibility control for AOY,
Championship qualification, and member benefits. Membership Effective Date is
administrative only. Never substitute one for the other.

Example: a membership recorded on August 1 with “Lake Two” selected as First
Eligible Tournament does not become eligible for Lake One merely because Lake
One occurred after the recorded Effective Date.

## Stable member and team records

Use the existing member whenever identity is confirmed. Do not create a new
person to correct spelling. Partner order does not create a new team. A
different two-person pairing is a different team. A solo appearance by one
registered partner should remain attached to the original two-person team.

The database foundation supports stable people and teams, but tournament-result
name reconciliation is not operational yet. This is a launch stop condition.

## Registration paths currently present

- The public registration page selects a tournament, collects angler/options
  information, validates registration state, and obtains a server-authoritative
  quote.
- The public Entries page reads saved tournament registrations.
- Tournament-morning/walk-in teams may exist only in WeighFish and later enter
  the official field through the complete WeighFish export.

The repository does **not** currently prove completed Square payment,
server-finalized public registration persistence, Admin-created registration,
waitlist, or a separate external-registration import. Those test cases must be
marked blocked rather than simulated as successful.

## What the Tournament Director Does

1. Confirm the Active Membership Season in Settings.
2. Search Members before creating a person.
3. Select the exact First Eligible Tournament.
4. Review public Entries and compare them with paid/confirmed registrations.
5. Close registration at the intended time.
6. Add tournament-morning teams in WeighFish.
7. Treat the final WeighFish export as the complete official tournament field.
8. Reconcile every imported participant to stable AITT identities before AOY
   publication once that workflow exists.

## What to Verify

- Member name/contact data appears once in Admin Members.
- Season, status, Effective Date, and First Eligible Tournament are correct.
- The selected tournament is the same in Featured Tournament, registration,
  Entries, and Admin.
- Entry counts and names agree before tournament day.
- Non-members remain in Official Results but receive no member-only season
  credit.

## Common scenarios

- **Existing email detected:** open the linked member; do not create another.
- **Partner absent:** remaining partner may fish alone for the original team.
- **Different partner:** treat the pairing as a new team.
- **Membership purchased late:** choose the approved First Eligible Tournament;
  do not backdate eligibility using Effective Date.
- **Inactive member:** retain history; reactivate only after confirming the
  record is the correct person.

## BUSINESS RULE CONFIRMATION REQUIRED

- Exact operational renewal procedure is not implemented.
- The repository does not prove whether a public registration option that says
  “purchase membership” should automatically create membership records.
- The repository does not define a supported Admin-created registration path.

## What Can Go Wrong

Duplicate people, name spelling differences, wrong seasons, wrong eligibility
tournaments, unpersisted public registration, and mismatches between saved
Entries and WeighFish can corrupt later standings. Stop and reconcile before
publishing.

## Related Documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)
- [AOY Specification](../AOY_SPECIFICATION.md)
