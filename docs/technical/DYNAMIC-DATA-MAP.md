# Dynamic Data Map

Last verified: 2026-08-08

This is a developer/technical trace. “Implemented” describes code paths, not
launch approval.

| Feature | Authority and write path | Read/Admin/Public path | Refresh/cache/fallback | Inconsistency risk |
| --- | --- | --- | --- | --- |
| Featured Tournament | `tournaments`; protected Tournament Information action. | `getFeaturedTournament` → adapter → `/` FeaturedTournament. | Homepage is dynamic; save revalidates public/Admin routes. | Multiple featured flags or incorrect manual selection. |
| Early Entries | Confirmed `tournament_registrations`; public projection selects safe columns. | Homepage summary and `/registrations`; Admin preparation/review use protected detail. | Dynamic pages; public load failures degrade safely. | Never expose contact, payment, or review metadata publicly. |
| Online membership | Durable registration transaction can create a joining membership after independently verified payment. | Registration domain/quote and protected completion boundary. | Live Square completion is disabled. | A quote/selection must never be mistaken for paid membership. |
| Admin-created membership | `anglers` + `memberships`; `admin_create_member` RPC atomically writes both. | `/admin/members/new`; list/detail via Admin DAL/RPC. | Revalidates Members; dynamic. Duplicate response links to UUID detail. | First eligible tournament/season errors; incomplete types. |
| Member recognition during registration | Durable registration identity classification uses canonical anglers, strong identifiers, and conservative review rules. | Registration completion boundary and `/admin/registration-review`. | Review history persists; ambiguous matches remain pending. | Never merge on name/fuzzy match alone. |
| Admin Members | `anglers`, `memberships`, `seasons`, first-eligible `tournaments`; list RPC. | `/admin/members`, detail, export. | Dynamic; search URL resets page; action revalidation. | Active season context and registration records are separate. |
| Registrations | `tournament_registrations`; quote plus server-only durable completion/review transactions. | `/register`, `/registrations`, homepage summary, preparation, Registration Review. | Dynamic; registration eligibility calculated at request. | Live Square checkout/callback is not operational; no browser request may self-confirm payment. |
| Official field | Final WeighFish export is the source; Working Results and imported identity evidence preserve it. | Tournament Manager import/review/reconciliation. | Transactional import revalidates dependent Admin routes. | Staff must resolve source, roster, and identity discrepancies before verification. |
| WeighFish import | CSV parser → service-role-only `import_working_results` transaction → Working Results and audit evidence. | `/admin/tournament-manager/import`. | Selected-tournament replacement is transactional and repeatable; errors remain nonpublic. | Wrong/incomplete export or unresolved combined participant identity. |
| Working Results | `working_results`/current compatibility rows plus original imported JSON and correction audit. | Import workspace, reconciliation, payout preparation, publish readiness. | Dynamic; verified state gates downstream workflow. | Working rows must never appear publicly. |
| Payout and closeout | Verified import + Insurance result → payout/check assignments and `on_site_closeout` record. | Tournament Manager Insurance, Calculate Payouts, and `/closeout`. | Saved tournament-scoped evidence; zero difference completes the stage. | Missing payee/check, delivered-check reset, or unexplained reconciliation difference. |
| Published results | `publish_official_results` transaction writes immutable `official_result_entries`, publication snapshot, and public compatibility record. | Tournament Manager is the authoritative publisher; public Results DAL requires `result_status=official`. | Revalidates homepage, Results, and Admin. Authorized corrections rebuild in one transaction. | Pending identity/review/readiness or misuse of correction/reset controls. |
| Winner's Circle | Latest Official Results plus public compatibility/media data. | `getLatestPublishedTournamentResults` → homepage. | Dynamic; catches load failure and shows a safe empty state. | Wrong latest-event selection or media mismatch. |
| Results index | Same published tournament/result join. | `getPublishedTournamentResultsArchive` → `/results`. | `force-dynamic`; load error/empty states. | Published tournament without result is dropped by archive builder. |
| Results detail/archive | Same records; archive builder creates slug/UUID URLs. | `/results/[slug]` loads archive then matches URL. | Dynamic; not-found/empty handling. | Reads entire archive per detail request; slug/status inconsistency. |
| AOY calculation | Official Results → `lib/aoy-engine.ts` → immutable calculation run/current season projection. | Protected rebuild actions; public standings readers. | Idempotent fingerprinted runs; public routes revalidate after rebuild. | Unresolved historical eligibility or failure to review current projection. |
| Homepage AOY top five | Current published AOY projection. | Homepage AOY strip. | Dynamic; empty message. Visual placement does not change rank. | Stale projection or confusing display order with rank. |
| Standings page | Same current AOY projection. | `/standings`. | Dynamic; safe empty/error handling. | Must match homepage and calculation evidence. |
| Championship qualification | Official Results → `lib/championship-qualification.ts` → separate season projection. | Protected rebuild actions and Admin workflow evidence. | Rebuilt independently from AOY rank. | Unresolved eligibility/participation or treating AOY rank as qualification. |

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

## Current maintenance priorities

1. Verify effective hosted RLS, grants, RPC permissions, and Storage policies.
2. Complete live Square checkout/callback/recovery without weakening the
   durable registration boundary.
3. Exercise import, reconciliation, payouts, closeout, publication, AOY, and
   Championship end to end with disposable nonproduction data.
4. Preserve immutable Official Results and audited correction behavior.
