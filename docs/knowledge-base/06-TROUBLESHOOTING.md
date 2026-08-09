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
- **Stop:** Live Square checkout is not operational. Do not use a quote or
  browser step as proof of completed payment; use only supported confirmed
  records.

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
- **Stop:** If identity remains uncertain, leave it in Registration Review or
  imported-result reconciliation and obtain supporting information.

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

## Payout checks or closeout do not balance

- **Symptom:** A place has no payee, a check is duplicated, or the closeout
  difference is not zero.
- **Likely causes:** Missing payout assignment, incorrect collection amount,
  Insurance Pot not completed, or source payout category mismatch.
- **Checks:** Compare verified WeighFish rows, Insurance winners, every
  place/category, payee, check amount, and delivery status.
- **Safe corrective action:** Correct the verified source or pre-publication
  payout assignment, then recalculate and save closeout.
- **Stop:** Do not publish or leave the payout station with an unexplained
  difference or unpaid angler.

## Winner or Big Bass image is wrong

- **Symptom:** Preview/public photo shows wrong person/event.
- **Checks:** Verify selected tournament and local file before upload.
- **Safe corrective action:** Before publication, replace and reload preview.
- **Stop:** After publication, use a documented authorized correction; do not
  alter Official Results.

## Publication fails

- **Symptom:** Error, partial public state, or status/result disagreement.
- **Likely causes:** missing verification, incomplete payout closeout,
  incomplete Insurance winners/photos, or network/database failure.
- **Checks:** Do not retry blindly. Check tournament status, result record, and
  public pages.
- **Safe corrective action:** Stop traffic/workflow and obtain technical review.
- **Stop:** Any partial or contradictory public state requires technical review
  before retrying.

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

- **Likely causes:** Unresolved identity/membership eligibility, wrong Official
  Results set, stale current projection, or incorrect expected worksheet.
- **Checks:** Confirm eight Regular Season events, published inputs, stable
  Competitive Records, eligibility, each event score, and the five highest
  totals using the AOY Specification.
- **Safe corrective action:** Correct only the authorized source/reconciliation
  issue, then rebuild and verify the AOY projection.
- **Stop:** Do not hand-edit public standings or publish an unexplained total.

## Championship qualification looks wrong

- **Likely causes:** Unresolved identity/membership eligibility, missing
  Official Result participation, stale projection, or confusion with AOY rank.
- **Checks:** List eligible member-team participations from the eight Regular
  Season events; five are required. Exclude no-show, disqualification, and
  ineligible appearances according to the Official Rules.
- **Safe corrective action:** Correct the authorized source issue, rebuild the
  separate qualification projection, and verify it again.
- **Stop:** Never infer Championship eligibility from AOY points or rank.

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
