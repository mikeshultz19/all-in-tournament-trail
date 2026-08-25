# AITT Launch Test Plan

> Reconciled 2026-08-25. [AITT Lifecycle and Operations](../AITT_LIFECYCLE_OPERATIONS.md)
> controls current business rules. Any older case below that assumes a featured
> flag controls registration, an automatic 9:00 PM close, standalone Insurance,
> or unavailable Square completion is superseded and must be executed using the
> current lifecycle.

## Purpose

This is an executable manual acceptance plan. Run every case in order against
disposable data. A build is not a substitute for this simulation.

## Test Environment

- A non-production Supabase project with all checked-in migrations applied.
- A production-like Next.js build using non-production credentials.
- Active Admin accounts for Mike, Sarah, and Brandon plus one inactive or
  non-Admin denial account.
- One disposable `2026–2027` season; two disposable regular-season tournaments.
- Fictional members/teams, representative WeighFish CSVs, and licensed test
  winner/Big Bass images.
- Browser coverage: mobile, tablet, laptop, and wide desktop.
- Record every created UUID and screenshot/evidence location.
- Cleanup only through tournament-scoped Reset and approved member cleanup.
  Never point the simulation at production or real historical Results.

Use `Pass`, `Fail`, or `Blocked` in every Pass/Fail field. A blocked required
case prevents launch.

## Simulation A — Pre-season and Memberships

### A-01 — Active Membership Season

- **Purpose:** Prove Settings alone controls the active season.
- **Preconditions:** Two seasons exist; Admin is signed in.
- **Test data:** `2026–2027`, `2027–2028`.
- **Steps:** Open Settings; select `2026–2027`; save; open Members and Add
  Member; refresh and sign out/in.
- **Expected Admin result:** Settings, Members, and Add Member use `2026–2027`;
  no duplicate selector appears elsewhere.
- **Expected public result:** No unrelated public tournament/result change.
- **Database or record verification:** Exactly one `seasons.is_active=true`.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### A-02 — Admin-created membership

- **Purpose:** Prove atomic member/membership creation and eligibility fields.
- **Preconditions:** A-01 passes; Tournament One is regular season.
- **Test data:** Avery Test, unique email/phone; Effective Date July 1; First
  Eligible Tournament = Tournament One.
- **Steps:** Add Member; submit once; immediately double-click attempt; search,
  open detail, export CSV, refresh.
- **Expected Admin result:** One member, Active status, correct season, Effective
  Date and First Eligible Tournament; duplicate submission does not create two.
- **Expected public result:** No AOY/team/result is created.
- **Database or record verification:** One angler and one membership linked;
  no team/AOY/registration row.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### A-03 — Existing member recognition

- **Purpose:** Prove registration recognizes the stable member.
- **Preconditions:** A-02 passes.
- **Test data:** Avery's exact and alternate-case contact information.
- **Steps:** Start public registration as existing member; enter matching
  identity; request quote/continue.
- **Expected Admin result:** Existing UUID is reused; no new angler.
- **Expected public result:** Member status is recognized correctly.
- **Database or record verification:** No additional angler/membership.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### A-04 — New online membership

- **Purpose:** Prove a supported public membership purchase becomes a durable
  membership only after confirmed payment.
- **Preconditions:** Payment sandbox configured.
- **Test data:** Morgan Test, unique contact data.
- **Steps:** Choose purchase membership; complete sandbox payment; reload Admin
  Members and registration.
- **Expected Admin result:** One angler/membership with explicit First Eligible
  Tournament and one registration.
- **Expected public result:** Confirmation appears once; retry does not duplicate.
- **Database or record verification:** Atomic payment/reference, membership,
  and registration records.
- **Pass/Fail:** **Expected Blocked** — live Square checkout and verified public
  payment finalization are not operational. **Notes:** ___ **Defect ID:** ___

### A-05 — Renewal/expired behavior

- **Purpose:** Prove old-season membership does not grant current eligibility.
- **Preconditions:** Same person has prior-season membership only.
- **Test data:** Riley Test; old and active seasons.
- **Steps:** Search Members; attempt current registration; perform approved
  renewal; retry.
- **Expected Admin result:** Prior record retained and current season membership
  created without duplicate person.
- **Expected public result:** Ineligible before renewal; eligible from selected
  First Eligible Tournament afterward.
- **Database or record verification:** One angler, one membership per season.
- **Pass/Fail:** **Expected Blocked** — renewal UI/process is absent.
  **Notes:** ___ **Defect ID:** ___

### A-06 — First Eligible Tournament versus Effective Date

- **Purpose:** Prove only First Eligible Tournament controls eligibility.
- **Preconditions:** Two ordered tournaments in active season.
- **Test data:** Effective Date before Tournament One; First Eligible =
  Tournament Two.
- **Steps:** Create member; evaluate Tournament One and Tournament Two
  registration/member benefits/AOY qualification.
- **Expected Admin result:** Both dates display accurately.
- **Expected public result:** No eligibility for Tournament One; eligibility
  begins Tournament Two.
- **Database or record verification:** Helper decision follows first eligible
  tournament date, not Effective Date.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

## Simulation B — Early Registration

### B-01 — Public early registration

- **Purpose:** Prove confirmed registration persistence and public Entries.
- **Preconditions:** Tournament One registration open.
- **Test data:** Team Alpha, solo Beta, member/non-member options.
- **Steps:** Complete each public flow; retry one confirmation URL; refresh
  Entries/Admin.
- **Expected Admin result:** One durable row per successful payment.
- **Expected public result:** Counts/list update once without private fields.
- **Database or record verification:** Unique registration references and
  correct tournament UUID.
- **Pass/Fail:** **Expected Blocked** — the quote and durable server boundary
  exist, but live Square checkout and its public verified completion path are
  not operational. **Notes:** ___ **Defect ID:** ___

### B-02 — Admin-created registration

- **Purpose:** Prove staff can enter a confirmed operational registration.
- **Preconditions:** Registration open; Admin signed in.
- **Test data:** Team Gamma.
- **Steps:** Locate Admin registration control; create entry; verify public list.
- **Expected Admin result:** Validated, tournament-scoped registration.
- **Expected public result:** Entry/count updates.
- **Database or record verification:** One row with Admin provenance.
- **Pass/Fail:** **Expected Blocked** — no Admin-created registration route.
  **Notes:** ___ **Defect ID:** ___

### B-03 — Waitlist/external import

- **Purpose:** Verify any claimed alternative pre-event entry path.
- **Preconditions:** None.
- **Test data:** Team Delta.
- **Steps:** Search approved Admin routes and operator controls; execute only if
  present.
- **Expected Admin result:** No unsupported path is advertised.
- **Expected public result:** No phantom entry.
- **Database or record verification:** None unless a supported path exists.
- **Pass/Fail:** Pass if correctly documented as unsupported; fail if UI claims
  it works. **Notes:** ___ **Defect ID:** ___

### B-04 — Registration reconciliation

- **Purpose:** Reconcile Entries, Admin records, membership status, and field.
- **Preconditions:** Supported confirmed registration records exist. Live
  Square checkout remains out of scope until it is operational.
- **Test data:** All Simulation B teams plus one duplicate attempt.
- **Steps:** Compare counts/names/UUIDs; close registration; attempt late entry.
- **Expected Admin result:** No unintended duplicates; official-field
  preparation is complete.
- **Expected public result:** Entries accurate; late submission prevented by
  registration page.
- **Database or record verification:** Counts equal; no cross-tournament rows.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

## Simulation C — Tournament One

### C-01 — Reset and prepare

- **Purpose:** Prove scoped clean start and public tournament consistency.
- **Preconditions:** Disposable Tournament One contains disposable activity.
- **Test data:** Typed confirmation using exact name.
- **Steps:** Preview reset; verify counts; confirm; complete setup; select
  featured; open registration.
- **Expected Admin result:** Ready for Registration, activity removed, setup/
  season retained.
- **Expected public result:** Featured Tournament and registration information
  match saved values.
- **Database or record verification:** Other tournament, members, seasons
  unchanged; reset log records Admin/counts.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### C-02 — Field and WeighFish import

- **Purpose:** Prove complete official field import.
- **Preconditions:** Registration closed; final WeighFish event complete.
- **Test data:** Five teams including a walk-in, non-member winner, eligible
  zero-weight team, and Big Bass.
- **Steps:** Compare early entries to WeighFish; export/import CSV; review rows.
- **Expected Admin result:** Row count/order/weights/payout categories match.
- **Expected public result:** Nothing published yet.
- **Database or record verification:** Selected-tournament draft rows only;
  imported flag/time set.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### C-03 — Identity, payouts, checks, and closeout

- **Purpose:** Prove the live payout workflow can pay anglers promptly from
  verified source results.
- **Preconditions:** C-02 imported; registration and identity reviews resolved.
- **Test data:** Verified payout categories, Insurance entries/winners,
  collection totals, and place-by-place payees.
- **Steps:** Verify import; resolve identities; calculate/save Insurance Pot;
  calculate payouts; assign checks; reconcile collections; track delivery;
  complete closeout.
- **Expected Admin result:** Every payout has one explainable payee/check,
  closeout difference is zero, and payout workflow is complete.
- **Expected public result:** Nothing is published yet.
- **Database or record verification:** Verified import evidence, Insurance
  calculation/winners, check assignments, and one tournament-scoped closeout.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### C-04 — Images and Official Results publication

- **Purpose:** Prove verified results publish only after payout closeout.
- **Preconditions:** C-03 complete; correct winner/Big Bass images ready.
- **Test data:** Winner/Big Bass images and completed closeout.
- **Steps:** Upload/replace images; review public preview; publish once; refresh.
- **Expected Admin result:** One Official Results publication and completed
  readiness state; unauthorized direct mutation is unavailable.
- **Expected public result:** Winner's Circle, homepage, Results index/detail
  show matching values.
- **Database or record verification:** One durable Official Results snapshot;
  working rows remain nonpublic.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### C-05 — AOY and Championship

- **Purpose:** Prove separate season calculations.
- **Preconditions:** C-04 succeeds; identities/memberships reconciled.
- **Test data:** C-02 field.
- **Steps:** Recalculate AOY and Championship qualification; manually verify
  eligible reranking/points, best-five selection, and participation counts.
- **Expected Admin result:** Explainable stable-team awards and participation.
- **Expected public result:** Homepage top five equals Standings; Official
  Results remain unchanged.
- **Database or record verification:** Versioned tournament AOY evidence and
  separate qualification contribution.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

## Simulation D — Tournament Two

### D-01 — Second event and history

- **Purpose:** Prove new publication does not damage Tournament One.
- **Preconditions:** All Simulation C cases pass.
- **Test data:** Overlapping teams, one new pairing, one original partner solo,
  seven-event-capable scoring fixture where practical.
- **Steps:** Repeat reset/setup/registration/import/reconcile/images/publish.
- **Expected Admin result:** Tournament Two records remain correctly scoped;
  stable original team gets solo continuity; new pairing is new team.
- **Expected public result:** Winner's Circle changes to Tournament Two; Results
  archive contains both events.
- **Database or record verification:** Tournament One rows byte-for-byte/
  field-for-field unchanged.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### D-02 — Aggregate AOY and qualification

- **Purpose:** Prove multi-event aggregation.
- **Preconditions:** D-01 passes.
- **Test data:** Expected points/tie-break/participation worksheet.
- **Steps:** Recalculate; compare each event, totals, rank, homepage five,
  Standings, and qualification count.
- **Expected Admin result:** Only published events included; new pairing
  inherits nothing.
- **Expected public result:** Homepage and Standings agree; first place appears
  in center display position without changing rank.
- **Database or record verification:** Separate immutable event contributions;
  qualification independent of AOY.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

## Simulation E — Failure and Recovery

### Required clean-staging DQ case

- **Purpose:** Prove competitive disqualification is not confused with invalid
  import correction.
- **Steps:** In the next clean disposable staging tournament, disqualify one
  otherwise valid participating entry through the supported audited control;
  complete payout, publication, AOY, and Championship processing.
- **Pass:** `participation_status`, Official Results presentation, zero payout,
  zero AOY credit, no Championship participation credit, and audit history all
  agree. Legitimate entries remain unchanged.
- **Stop:** Do not perform this test against production or use DQ merely to
  remove synthetic/import data.

### E-01 — Duplicate and invalid registration

- **Purpose:** Ensure duplicate/invalid input does not create partial rows.
- **Preconditions:** Registration open and one existing entry.
- **Test data:** Same reference/email; malformed angler; missing acceptance.
- **Steps:** Submit duplicates/invalid requests.
- **Expected Admin result:** No duplicate/partial registration or member.
- **Expected public result:** Clear error; existing Entry unchanged.
- **Database or record verification:** Counts unchanged.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-02 — Registration after closure

- **Purpose:** Prove registration page controls availability.
- **Preconditions:** Configured close time has passed.
- **Test data:** Valid new team.
- **Steps:** Open homepage then registration; attempt submission/API quote.
- **Expected Admin result:** No new row.
- **Expected public result:** Homepage remains informational; registration page
  explains closure and prevents submission.
- **Database or record verification:** Count unchanged.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-03 — Malformed and duplicate import

- **Purpose:** Prove safe import rejection/retry.
- **Preconditions:** Existing valid draft rows.
- **Test data:** Empty CSV, missing headers, unclosed quote, repeated valid CSV.
- **Steps:** Import each; inspect draft after every attempt.
- **Expected Admin result:** Friendly errors; valid duplicate import produces
  one set.
- **Expected public result:** Unchanged before publication.
- **Database or record verification:** Failed import must not erase prior valid
  draft.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-04 — Partial publication

- **Purpose:** Prove rollback across Results and status.
- **Preconditions:** Valid closeout; controlled database failure injected
  between writes.
- **Test data:** Tournament One draft.
- **Steps:** Trigger publish with injected second-write failure; inspect all
  pages/records; retry once after repair.
- **Expected Admin result:** Entire operation rolls back; one later success.
- **Expected public result:** No partial Results/Winner's Circle/AOY.
- **Database or record verification:** Zero-or-one complete publication.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-05 — Image correction and stale cache

- **Purpose:** Prove safe pre-publication replacement and refreshed public data.
- **Preconditions:** Wrong test image uploaded before publication.
- **Test data:** Wrong then correct winner/Big Bass images.
- **Steps:** Replace; refresh Admin; publish; open public pages in new session.
- **Expected Admin result:** Correct previews persist.
- **Expected public result:** Only correct images; no stale previous event data.
- **Database or record verification:** Final published URLs match selected event;
  temporary files are not permanent records.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-06 — Attempted published-result modification

- **Purpose:** Prove immutability.
- **Preconditions:** Published Tournament One.
- **Test data:** Changed winner weight/name.
- **Steps:** Attempt through every Admin path and direct authorized action.
- **Expected Admin result:** Modification rejected; correction requires separate
  approved audited process.
- **Expected public result:** Unchanged.
- **Database or record verification:** Original row unchanged.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

### E-07 — Missing public data

- **Purpose:** Prove safe empty/error states without private leakage.
- **Preconditions:** Disposable unpublished event; simulated read failure.
- **Test data:** No Results/AOY plus denied query.
- **Steps:** Load homepage, Results, detail, Standings, Entries.
- **Expected Admin result:** Diagnostic remains available to staff/logs.
- **Expected public result:** Neutral empty/error message; no crash or raw
  credentials/private contacts.
- **Database or record verification:** No fallback rows created.
- **Pass/Fail:** ___ **Notes:** ___ **Defect ID:** ___

## Final Cross-System Reconciliation

Record the actual expected value and compare every applicable surface.

| Value | WeighFish/source | Admin draft | Published record | Homepage/Featured | Winner's Circle | Results index/detail | AOY homepage | Standings | Members | Championship | Match? / Defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tournament identity | ___ | ___ | ___ | ___ | ___ | ___ | N/A | ___ | N/A | ___ | ___ |
| Registration count | ___ | ___ | N/A | ___ | N/A | N/A | N/A | N/A | N/A | N/A | ___ |
| Official field count | ___ | ___ | ___ | N/A | ___ | ___ | N/A | N/A | N/A | ___ | ___ |
| Winner | ___ | ___ | ___ | ___ | ___ | ___ | N/A | N/A | N/A | N/A | ___ |
| Winning weight | ___ | ___ | ___ | N/A | ___ | ___ | ___ | ___ | N/A | N/A | ___ |
| Big Bass | ___ | ___ | ___ | N/A | ___ | ___ | N/A | N/A | N/A | N/A | ___ |
| Payouts | ___ | ___ | ___ | N/A | ___ | ___ | N/A | N/A | N/A | N/A | ___ |
| Member status | N/A | ___ | snapshot ___ | N/A | N/A | N/A | affects ___ | affects ___ | ___ | affects ___ | ___ |
| First Eligible Tournament | N/A | ___ | snapshot ___ | N/A | N/A | N/A | affects ___ | affects ___ | ___ | affects ___ | ___ |
| AOY points | N/A | ___ | derived ___ | ___ | N/A | N/A | ___ | ___ | N/A | separate | ___ |
| AOY rank | N/A | ___ | derived ___ | ___ | N/A | N/A | ___ | ___ | N/A | separate | ___ |
| Championship status | N/A | ___ | separate ___ | optional ___ | N/A | N/A | separate | optional ___ | N/A | ___ | ___ |

## Launch decision

Launch requires every required case for the enabled production scope to pass.
Verified Square completion must remain disabled in production until its
production payment, persistence, recovery, and confirmation cases pass. Any unexplained identity, payout, closeout,
Official Results, AOY, or Championship discrepancy is a no-launch decision for
that affected workflow.
