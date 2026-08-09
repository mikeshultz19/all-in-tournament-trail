# Competitive Record Foundation

## Architecture decision

AITT extends the existing `public.teams` and `public.team_members` model rather
than creating a parallel Competitive Record table.

The existing model already provides the required durable properties:

- a stable UUID
- season ownership
- an order-independent canonical member key
- stable angler relationships
- uniqueness for the same member combination in a season

`public.teams.record_type` now distinguishes the two constitutional record
types:

- `team`: exactly two stable anglers
- `solo`: exactly one stable angler

The table name remains `teams` for compatibility with existing code and
foreign-key relationships. Application types expose Competitive Record aliases
so registration review, Official Results, AOY, and Championship code can use
constitutional terminology without duplicating storage.

## Integrity and creation

`public.create_competitive_record` finds or creates a record and inserts its
stable members in one database transaction. Deferred constraint triggers verify
the exact member count at commit time.

The canonical key continues to use sorted stable angler UUIDs. Names and
display names are presentation values and are not part of record identity.
Database triggers prevent later changes to a record's season, type, canonical
key, or member relationships. Presentation names and active status remain
editable without changing ownership.

## Registration relationship

`public.tournament_registrations.competitive_record_id` references the permanent
owner of the registration.

The migration uses a registration validation trigger deliberately:

- PostgreSQL requires the non-null relationship for every new registration.
- Changes to a registration's ownership fields are validated.
- Existing name-only registrations remain readable and are not deleted.
- Unrelated administrative fields on legacy registrations remain editable
  before reconciliation.
- Legacy rows must be reconciled to stable anglers and Competitive Records
  before a later migration can make the column formally `NOT NULL`.

A registration trigger also verifies that:

- registration type matches Competitive Record type
- tournament and Competitive Record belong to the same season

Locking Competitive Record ownership after registration closes is intentionally
outside this foundation task.

## Compatibility

- Existing `teams` and `team_members` IDs and relationships are preserved.
- Existing one-member records backfill to `solo`.
- Existing two-member records backfill to `team`.
- Existing invalid zero-member or over-capacity records stop the migration
  instead of being silently reclassified.
- Existing name-only registrations remain available for reviewed
  reconciliation.
- Existing `createTeam()` remains available and delegates to transactional
  Competitive Record creation.

## Integrated workflows

Later milestones build on this foundation without changing ownership:

- durable registrations reference a Competitive Record when identity is clear;
- Registration Review resolves ambiguous submitted identities;
- WeighFish reconciliation links Working Results to canonical records;
- Official Results snapshot the historical record identity;
- AOY and Championship engines calculate separate persisted projections.

Registration-close ownership locking remains a distinct control and must not
be inferred solely from this foundation.
