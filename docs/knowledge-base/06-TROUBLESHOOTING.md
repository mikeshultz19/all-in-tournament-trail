# Troubleshooting

Use only safe corrective actions. Never “fix” a mismatch by editing published
Official Results or creating duplicate people.

## Registration will not open

- **Symptom:** Registration page says closed/unavailable.
- **Likely causes:** Wrong featured/selected tournament, status/window, missing
  tournament, or incomplete payment/persistence implementation.
- **Checks:** Compare Admin tournament ID, dates, status, and registration page.
- **Safe corrective action:** Correct the selected tournament configuration
  before entries exist; refresh and retry.
- **Stop:** If the public flow quotes but cannot persist/finalize payment, seek
  technical help. This is a known launch blocker.

## Featured Tournament is wrong

- **Symptom:** Homepage shows another event or no event.
- **Likely causes:** Wrong featured/homepage flags or load failure.
- **Checks:** Open Tournament Information and compare UUID, name, date, flags.
- **Safe corrective action:** Save the intended event and refresh.
- **Stop:** Multiple featured rows, database error, or Admin/public disagreement.

## Early Entries count is wrong

- **Symptom:** Public count/list differs from confirmed registrations.
- **Likely causes:** Wrong tournament, duplicate/missing persisted row, or load
  fallback.
- **Checks:** Compare public list with tournament-scoped saved registrations.
- **Safe corrective action:** Reconcile before closing registration.
- **Stop:** Never expose payment reference/admin notes or edit unrelated events.

## Existing member is not recognized

- **Symptom:** Registration treats a known member as new/non-member.
- **Likely causes:** No current-season membership, inactive/cancelled status,
  spelling/contact mismatch, or unsupported automatic recognition.
- **Checks:** Search Members by name, email, and phone; verify season and First
  Eligible Tournament.
- **Safe corrective action:** Use the stable existing person; correct only
  confirmed administrative data.
- **Stop:** Uncertain identity or automatic matching not available.

## Duplicate member or registration

- **Symptom:** Same person/team appears twice.
- **Likely causes:** Repeated submission, alternate spelling/email, or retry
  after uncertain response.
- **Checks:** Compare UUID/reference, contact identity, tournament, and time.
- **Safe corrective action:** Do not merge/delete when history exists; retain
  evidence and seek an approved correction.
- **Stop:** Silent merge or published-history involvement.

## Admin Members does not match registration

- **Symptom:** Registration says member but Members lacks the expected record.
- **Likely causes:** Registration option is not a created membership, wrong
  season, or unimplemented online-membership persistence.
- **Checks:** Inspect Members and the registration record separately.
- **Safe corrective action:** Create membership only from confirmed source
  paperwork/payment and choose First Eligible Tournament explicitly.
- **Stop:** Never infer membership from a registration checkbox alone.

## Tournament field is wrong

- **Symptom:** Final roster differs from early entries or WeighFish.
- **Likely causes:** Walk-ins, withdrawals, duplicates, wrong export.
- **Checks:** Reconcile every early entry with final WeighFish field.
- **Safe corrective action:** Correct WeighFish before final export/import.
- **Stop:** Unresolved person/team identity or field count.

## WeighFish import fails

- **Symptom:** CSV rejected or no rows imported.
- **Likely causes:** Wrong export, missing required headers, malformed quotes,
  empty rows, wrong tournament.
- **Checks:** Re-export official file; verify selected event and required result
  columns.
- **Safe corrective action:** Fix at source and re-import.
- **Stop:** Do not hand-edit totals to force acceptance.

## Imported totals look wrong

- **Symptom:** Weights or payout totals disagree with WeighFish.
- **Likely causes:** Payout labels not recognized, wrong file, duplicate import,
  or standard/side-pot confusion.
- **Checks:** Compare each row/category. Public total is Bronze + Silver + Gold
  + Insurance only.
- **Safe corrective action:** Correct WeighFish labels/source or manual
  Insurance before publication.
- **Stop:** Unexplained difference.

## Winner or Big Bass image is wrong

- **Symptom:** Preview/public photo shows wrong person/event.
- **Checks:** Verify selected tournament and local file before upload.
- **Safe corrective action:** Before publication, replace and reload preview.
- **Stop:** After publication, use a documented authorized correction; do not
  alter Official Results.

## Publication fails

- **Symptom:** Error, partial public state, or status/result disagreement.
- **Likely causes:** missing import/photos/review, network/database failure, or
  current non-atomic write behavior.
- **Checks:** Do not retry blindly. Check tournament status, result record, and
  public pages.
- **Safe corrective action:** Stop traffic/workflow and obtain technical review.
- **Stop:** Any partial publication is a launch blocker.

## Winner's Circle is wrong

- **Symptom:** Wrong event, winner, Big Bass, payout, or photo.
- **Checks:** Compare latest Results Published tournament and its saved Results.
- **Safe corrective action:** Before launch simulation, correct draft/source.
- **Stop:** Never edit published values merely to make the homepage agree.

## Results page is missing the tournament

- **Symptom:** Published event absent from index/archive.
- **Checks:** Confirm status exactly Results Published, one Results record, and
  valid slug.
- **Safe corrective action:** Resolve publication consistency technically.
- **Stop:** Do not republish until duplicate/partial-write risk is understood.

## Homepage AOY does not match Standings

- **Checks:** Compare identical team/name, points, rank, and published-event
  set. Remember homepage visual order is 2nd, 3rd, 1st, 4th, 5th.
- **Safe corrective action:** Refresh both; then inspect the shared AOY source.
- **Stop:** Do not hand-edit one display.

## AOY calculation looks wrong

- **Likely cause:** Current code is name-based and lacks the authoritative
  stable-team engine.
- **Checks:** Recalculate manually from published Official Results using the AOY
  Specification.
- **Safe corrective action:** Record a defect and stop publication.
- **Stop:** Current authoritative AOY implementation is a launch blocker.

## Championship qualification looks wrong

- **Likely cause:** Calculation is not implemented.
- **Checks:** Manually list stable eligible participations separately from AOY.
- **Safe corrective action:** Record the expected result and defect.
- **Stop:** Do not publish qualification until implemented and simulated.

## Stale VS Code TypeScript diagnostic

- **Symptom:** Editor reports an error although command-line checks pass.
- **Checks:** Save files, confirm branch, run `npx tsc --noEmit`.
- **Safe corrective action:** Restart the TypeScript server/window.
- **Stop:** If command-line TypeScript fails, treat it as real.

## Public page has an empty or error state

- **Likely causes:** No qualifying data, Supabase configuration/permission
  failure, unpublished event, or network error.
- **Checks:** Confirm authoritative row/status and review server logs.
- **Safe corrective action:** Restore source/configuration; empty state is not
  proof that records do not exist.
- **Stop:** Private error details or contact/payment data exposed publicly.

## Related Documents

- [Running a Tournament](02-RUNNING-A-TOURNAMENT.md)
- [Admin Center Guide](05-ADMIN-CENTER-GUIDE.md)
