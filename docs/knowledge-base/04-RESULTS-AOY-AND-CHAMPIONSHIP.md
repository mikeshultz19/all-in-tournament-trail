# Results, AOY, and Championship

The complete authority is [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md).

## Official Results and payouts

WeighFish supplies scoring and finish data. AITT imports and verifies it, maps
registrations and Competitive Records, calculates AITT payouts and Insurance,
publishes Official Results, and calculates AOY and Championship projections.
Published Official Results are the historical source of truth.

`TOTAL PAID OUT TO ANGLERS` equals Main Tournament + Bronze + Silver + Gold +
Big Bass + Insurance, each exactly once. The authoritative value is the
completed closeout `total_paid_cents`; a category sum is fallback only.

The public Results table displays at most 25 standings per page with permanent
overall places. Mobile remains single-column and shows only applicable payout
breakdowns. `Total Won` includes Insurance, and Insurance winners retain a
compact **INSURANCE** badge. The bottom Insurance summary remains, without a
duplicate standalone winner-detail row.

## AOY

Only published Official Results feed AOY. Eligible results are reranked for AOY
without changing Official Results: AOY first earns 200 points and each next
eligible position decreases by one. Eligible participating zero-weight entries
earn 10; ineligible, no-show, excluded, and disqualified entries earn 0 under
the implemented rules. Historical tournament-time eligibility controls.

All performances remain stored; only the best five of eight count. Team and Solo
Competitive Records remain separate, and recalculation is deterministic and
idempotent. Public standings show at most 25 compact rows per page. Expansion
shows Tournament/Lake and Points only, marking scores outside the best five as
**Dropped**.

## Championship qualification

Championship qualification is separate from AOY: it requires five eligible
physical participations in the eight-event Regular Season. Qualification belongs
to the exact Competitive Record. Solo and Team histories cannot be combined;
changing a partner creates a different Team record. Both partners do not need
five independent personal appearances—the established Team record needs five
eligible participations, with applicable historical membership requirements.

The implemented authority is `current_championship_qualifications`,
`current_championship_participations`, and their supporting projection/RPC
pipeline. The public Championship registration gate is **pending** and must be
reviewed before Championship registration opens. Do not imply it is enforced.

## Related documents

- [AOY Specification](../AOY_SPECIFICATION.md)
- [Championship Qualification Engine](../technical/CHAMPIONSHIP_QUALIFICATION_ENGINE.md)
- [Official Tournament Rules](../TOURNAMENT_RULES.md)
