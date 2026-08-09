# Identity Reconciliation Foundation

## Scope

This foundation links identities received from WeighFish or another trusted
import source to canonical AITT Anglers and Competitive Records. It does not
publish Official Results and does not calculate AOY points or Championship
qualification.

## Canonical ownership

`public.anglers.id` is the permanent person identity. `public.teams.id` is the
permanent Competitive Record identity; the existing table name is retained for
compatibility. Display names are never identity keys.

An imported name remains source evidence. Reconciliation attaches that evidence
to a canonical UUID without rewriting the source value.

## Source identity lifecycle

`public.source_angler_identities` stores one source identity per
`source_system + source_identity_key`. It preserves:

- the source name and normalized form;
- source metadata;
- the confirmed canonical Angler, when resolved;
- reconciliation status and method;
- resolution time and the resolving Admin, when applicable.

Statuses are `unresolved`, `suggested`, `confirmed`, `rejected`, and
`review_required`. Candidate Anglers are stored through
`source_angler_identity_candidates`. Every administrative decision or
reassignment is appended to `source_angler_identity_history`.

Raw source fields cannot be updated after insertion.

## Imported Competitive Record lifecycle

`public.imported_competitive_identities` preserves one imported entry per
`source_system + source_entry_key`, including its original participant payload,
tournament UUID, season UUID, immutable regular-season number, and declared
Team/Solo type.

Its member rows point to source Angler identities. Candidate and resolution
history tables preserve review evidence. The resolved Competitive Record must:

- belong to the same season;
- have the same Team/Solo type;
- contain exactly the same confirmed canonical Angler UUIDs.

Member order is ignored because canonical Competitive Record keys sort UUIDs.
Team records can never resolve to Solo records, and Solo records can never
resolve to Team records.

## Matching priority

Application matching uses this order:

1. Existing confirmed source alias.
2. One exact normalized email supplied by a trusted source.
3. One exact normalized full-name match.
4. Partial-name candidates as suggestions only.
5. No match remains unresolved.

Multiple exact email or name matches produce
`AITT_IDENTITY_REVIEW_REQUIRED`. No candidate is selected arbitrarily. Partial
and fuzzy-like matches are never confirmed automatically.

Registration evidence is accepted only when tournament UUID, registration type,
canonical Anglers, and Competitive Record agree. Dates are not identity
evidence. Postponed events retain the stored tournament UUID, season UUID, and
regular-season number.

## Administrative resolution

Protected server actions call service-role-only RPCs. They require the existing
active Admin session before they can:

- confirm or reject a source Angler mapping;
- reassign a previously resolved source identity;
- confirm or reject an imported Competitive Record mapping;
- link matching durable registration evidence;
- create a missing Competitive Record through the existing validated
  `create_competitive_record` workflow.

The RPCs validate canonical targets and append an audit-history row in the same
transaction as each resolution.

## Idempotency

Native source keys are preferred. When none exists, application code derives a
SHA-256 identity key from the normalized source system and trusted email, or
from the normalized full name when no email exists.

Unique constraints and an advisory transaction lock make repeated recording of
the same imported entry idempotent. Repeated imports do not create Anglers or
Competitive Records. Confirmed aliases are reusable on later imports.

## Historical integrity

Original participant values live in the imported entry payload and cannot be
rewritten. Source aliases, candidate references, resolver UUIDs, timestamps,
and resolution histories remain separate from Official Results publication.

Working Result reconciliation links imported evidence to canonical Competitive
Records. Publication remains a separate transactional step and refuses
unresolved required identities.

## Remaining limitations

- Current WeighFish CSV rows contain one combined `Angler`/team display value.
  Human review or a future source-specific participant splitter is required
  before those rows can safely supply one or two person identities.
- Nicknames such as Bob/Robert are not inferred.
- Reversed names are not guessed.
- A name-only derived source key can represent ambiguous people; it must remain
  under review until an Admin confirms the correct Angler.
- Candidate generation is deterministic. The protected Tournament Manager
  import/reconciliation workspace exposes the administrative review flow.
- The new migration must be applied before these server mechanisms are used.
