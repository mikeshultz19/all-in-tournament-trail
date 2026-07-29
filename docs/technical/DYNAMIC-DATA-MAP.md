# Dynamic Data Map

Last verified: 2026-07-29

This is a developer/technical trace. “Implemented” describes code paths, not
launch approval.

| Feature | Authority and write path | Read/Admin/Public path | Refresh/cache/fallback | Inconsistency risk |
| --- | --- | --- | --- | --- |
| Featured Tournament | `tournaments`; Admin Tournament Information calls `updateTournament`. | `getFeaturedTournament` → adapter → `/` FeaturedTournament. | Homepage is `force-dynamic`; save revalidates `/`. Load failure hides event safely. | Multiple featured rows, permissive anonymous updates, manual flags. |
| Early Entries | `tournament_registrations`; intended accepted-registration records. | `getPublicEarlyEntriesForTournament` selects safe columns → `/` summary and `/registrations`. | Dynamic pages; homepage catches failure and says unavailable. | Public quote flow does not prove finalized persistence; table has broad anon rights. |
| Online membership | No proven membership write path from public registration. Registration options/quote are configuration only. | Registration form/quote; no authoritative Members update. | Request-time validation. | A checkbox/option can be mistaken for a membership record. Launch blocker. |
| Admin-created membership | `anglers` + `memberships`; `admin_create_member` RPC atomically writes both. | `/admin/members/new`; list/detail via Admin DAL/RPC. | Revalidates Members; dynamic. Duplicate response links to UUID detail. | First eligible tournament/season errors; incomplete types. |
| Member recognition during registration | No implemented stable identity lookup in public registration flow. | Registration form collects choices; Admin Members is separate. | None. | Names/options can imply eligibility without membership authority. |
| Admin Members | `anglers`, `memberships`, `seasons`, first-eligible `tournaments`; list RPC. | `/admin/members`, detail, export. | Dynamic; search URL resets page; action revalidation. | Active season context and registration records are separate. |
| Registrations | `tournament_registrations`; current public API provides validation/quote, not proven final payment write. | `/register`, `/registrations`, homepage summary. | Dynamic; registration state calculated at request. | No completed Square finalization/Admin-created path; anonymous writes. |
| Official field | Business authority is final WeighFish export; imported rows live in `tournament_result_entries`. | Tournament Manager import/review. No distinct normalized official-field table. | Import action revalidates closeout routes. | Saved early entries and imported complete field are not reconciled. |
| WeighFish import | CSV → `parseWeighfishCsv` → delete existing selected-tournament rows → insert `tournament_result_entries`; updates tournament import flags. | `/admin/tournament-manager/import`; publish reads imported rows. | Dynamic/revalidated. Parser errors are friendly. | Delete/insert/update are non-transactional; no stable identity links. |
| Draft results | `tournament_result_entries`. | Publish page queries selected tournament rows. | Dynamic; empty state blocks publish. | Draft has display strings only; no durable import snapshot/version. |
| Published results | `tournament_results` plus tournament status `Results Published`; `saveTournamentResults` upserts. | Tournament Manager publish and legacy `/admin/results`; public DAL. | Actions revalidate homepage/Results/Admin. | Non-atomic, mutable, two writers. Violates immutability. |
| Winner's Circle | Latest tournament with `Results Published` + matching `tournament_results`. | `getLatestPublishedTournamentResults` → `/` WinnersCircle. | Homepage dynamic; catches load failure and shows no Results. | Latest status/result mismatch, mutable records, media path mismatch. |
| Results index | Same published tournament/result join. | `getPublishedTournamentResultsArchive` → `/results`. | `force-dynamic`; load error/empty states. | Published tournament without result is dropped by archive builder. |
| Results detail/archive | Same records; archive builder creates slug/UUID URLs. | `/results/[slug]` loads archive then matches URL. | Dynamic; not-found/empty handling. | Reads entire archive per detail request; slug/status inconsistency. |
| AOY calculation | Stored `tournament_aoy_points`; no proven authoritative generator. Current reader groups each angler display string and best five. | `lib/aoy-standings.ts`; no current Admin calculation page. | Dynamic public reads; errors become empty state. | Not stable-team/eligibility/tie-break compliant. Critical blocker. |
| Homepage AOY top five | Published tournament IDs + `tournament_aoy_points`, shared AOY builder. | `/` → AOYPointsRaceStrip. | Homepage dynamic; empty message. Visual order 2,3,1,4,5. | Same incorrect source algorithm; display order must not be mistaken for rank. |
| Standings page | Same `getPublishedAoyStandings`. | `/standings`. | `force-dynamic`; empty message. | Shares points totals but not authoritative team/tie-break data. |
| Championship qualification | No table, write service, calculation, Admin page, or public page found. | None. Specification only. | None. | Required launch feature is absent. |

## Supporting controls

- Active Membership Season: `seasons.is_active`; `/admin/settings` calls
  `admin_set_active_season`, then revalidates membership routes.
- Eligibility helper: active angler + active membership in same season + First
  Eligible Tournament date at or before the target event. Effective Date is not
  used as the business threshold.
- Tournament Reset: `admin_reset_tournament` RPC deletes only selected
  tournament activity, resets operational columns, and writes
  `tournament_reset_log`; Storage cleanup follows separately.
- Payout source: `lib/result-payouts.ts` is the shared semantic utility. Public
  total is Bronze + Silver + Gold + Insurance.

## Required architectural corrections

1. Replace anonymous writes with least-privilege policies.
2. Persist/finalize registrations transactionally.
3. Reconcile imported names to stable people/teams.
4. Publish immutable Results atomically through one workflow.
5. Generate versioned AOY awards from published Results only.
6. Generate Championship participation separately.
