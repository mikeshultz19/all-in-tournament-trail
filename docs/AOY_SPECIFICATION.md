# AITT AOY SYSTEM SPECIFICATION

> **Supporting technical specification.** The Official Rules control AOY
> competition policy, and
> [AITT Tournament Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md)
> controls current operational/public behavior.

> **Constitutional precedence (July 29, 2026):**
> [AITT Competition Rules Version 1.0](AITT_COMPETITION_RULES.md) is the
> authoritative business specification for Competitive Records, AOY, and
> Championship qualification. Any conflicting Team-only, solo-continuity,
> eligibility, schedule, or result-finality language in this earlier
> implementation specification is superseded and must not be implemented.

This document remains an implementation-planning reference for AITT Membership,
Team Identity, Angler of the Year (AOY), and Championship qualification where
it does not conflict with the Competition Rules.

## 1. Purpose

1. The AOY system calculates season-long team standings from official published
   AITT tournament results.
2. Official tournament results and AOY results are separate.
3. Official results must never be reordered, filtered, or changed because of
   membership or AOY eligibility.
4. AOY calculations use official results as their source, then independently
   determine eligibility, rerank eligible teams, and award AOY points.

## 2. Official Results Workflow

The tournament-day workflow is:

1. Online registrations may already exist in AITT.
2. Walk-in teams may be entered only in WeighFish.
3. AITT staff separately records membership purchases.
4. After the tournament, the official WeighFish CSV is imported.
5. The imported CSV becomes the complete official tournament field.
6. Imported anglers are matched against AITT membership records.
7. AOY eligibility is determined.
8. Official Results are published.
9. AOY tournament points are generated separately.

Membership status must not alter official tournament finishing positions,
payouts, weights, Big Bass results, or public tournament results.

## 3. Membership Eligibility

Only current AITT members may earn:

- AOY points
- Championship qualification credit
- Member Side Pot eligibility
- Season-long member awards

Both anglers on a two-person team must be current AITT members for that team to
be AOY eligible.

Non-member teams:

- remain in official tournament results
- remain eligible for standard tournament payouts
- remain eligible for Big Bass
- do not earn AOY points
- do not earn Championship qualification credit
- do not receive member-only benefits

Membership eligibility must be determined using AITT membership records, not
assumptions based on WeighFish names or registration selections.

Membership is not retroactive. Eligibility begins on the membership's effective
date. Membership remains active through the Championship and expires when the
season concludes after the Championship is completed.

## 4. Team Identity

1. AOY belongs to a stable registered team.
2. A normal team consists of two identified anglers.
3. Partner order does not create a different team.
4. Team identity must rely on stable angler records rather than display-name
   strings whenever possible.

Example:

- `John Smith / Mike Jones`
- `Mike Jones / John Smith`

These represent the same team.

## 5. Fishing Alone

1. If one registered partner is unable to attend, the remaining partner may
   fish alone.
2. A solo appearance by either registered partner remains an appearance by the
   original team.
3. The solo angler must be a current AITT member.
4. The absent partner does not need to be physically present for the original
   team to retain its identity.

Fishing alone counts toward:

- AOY points
- Championship qualification
- Member Side Pots, when otherwise eligible
- season participation records

## 6. Different Partner Creates a New Team

1. Substitute partners are not recognized as continuations of an existing
   team.
2. If an angler fishes with someone other than the angler's registered team
   partner, that pairing is treated as a new team entry.

Example:

Original team:

- `John Smith / Mike Jones`

Tournament entry:

- `John Smith / Steve Brown`

`John Smith / Steve Brown` is a new team.

That tournament:

- appears normally in official results
- does not earn AOY points for `John Smith / Mike Jones`
- does not count toward Championship qualification for
  `John Smith / Mike Jones`
- does not provide Member Side Pot eligibility to the original team
- may establish its own team record when otherwise eligible

This rule exists because AOY uses a best-five format and Championship
qualification requires only five tournaments. Allowing replacement partners
would create an unfair competitive advantage.

When both anglers are eligible, a new two-person pairing immediately creates
its own new AOY team. The new team inherits no AOY points, participation credit,
or Championship qualification credit from either angler's other teams.

## 7. Tournament AOY Calculation

After official results are available:

1. Begin with the complete official finishing order.
2. Determine each entry's membership and team eligibility.
3. Remove AOY-ineligible teams from the AOY calculation only.
4. Preserve the official results unchanged.
5. Rerank the remaining AOY-eligible teams in their original relative finishing
   order.
6. Award AOY points using the reranked AOY position.

Example:

Official finish:

1. Non-member team
2. Eligible member team
3. Non-member team
4. Eligible member team

AOY finish:

1. Official second-place team
2. Official fourth-place team

The official finish remains unchanged.

## 8. AOY Points Schedule

AOY points begin at 200 points for first place and decrease by one point per
eligible AOY position.

- 1st AOY place: 200 points
- 2nd AOY place: 199 points
- 3rd AOY place: 198 points
- Each following position receives one point fewer than the preceding position.

The AOY position, not the official tournament position, determines the points
awarded.

## 9. Zero Weight, No-Show, and Disqualification

1. A registered and eligible member team that participates but records zero
   tournament weight receives 10 participation points.
2. A no-show receives 0 points.
3. A disqualified team receives 0 points.
4. A team must have actually participated to receive the 10-point zero-weight
   participation award.
5. Official results remain unchanged regardless of the AOY points awarded.

## 10. Best Five Rule

1. Every eligible tournament AOY score must be retained in the tournament-level
   AOY history.
2. Season AOY standings use only the team's five highest AOY tournament scores.
3. Scores outside the best five remain visible but do not contribute to the
   season AOY total.
4. There is no minimum tournament requirement to win AOY.
5. The team with the highest final best-five AOY total wins AOY, subject to the
   tie-breaker rules.

Examples:

- A team fishes four eligible tournaments: all four scores count.
- A team fishes five eligible tournaments: all five scores count.
- A team fishes seven eligible tournaments: only the five highest scores count.

## 11. Championship Qualification

Championship qualification is separate from AOY standings.

1. A team must record five qualifying tournament participations to qualify for
   the Championship.
2. Championship qualification should be derived from qualifying tournament
   participation records unless a future operational need requires a stored
   snapshot.
3. Championship qualification is locked after the final qualifying tournament.
4. The Championship is the final event of the season and is a two-day
   tournament.
5. The Championship does not award AOY points.
6. AOY is finalized after the final regular-season tournament.
7. Membership remains active through the Championship.
8. The season officially ends after the Championship is completed.

The season begins with the first official regular-season tournament.

A qualifying participation includes:

- the registered team fishing together
- either registered partner fishing alone

A qualifying participation does not include:

- a no-show
- a disqualification
- an entry using a different partner
- a team that fails membership eligibility requirements

A team may:

- win AOY with fewer than five tournaments
- lead AOY without yet qualifying for the Championship
- qualify for the Championship without finishing near the top of AOY standings

## 12. AOY Tie Breakers

Season AOY ties are resolved in this order:

1. Most tournament wins
2. Most Top 10 finishes
3. Highest total official season weight
4. Best finish in the most recent tournament relevant to the tied teams

The implementation must apply tie breakers consistently and must retain enough
tournament-level data to explain the outcome publicly.

For the fourth tie breaker, compare the tied teams' AOY finishes beginning with
the most recent regular-season tournament and continue backward through
regular-season tournaments until the tie is broken.

## 13. Wins and Top 10s

1. Wins and Top 10s are based on AOY finish among eligible teams, not official
   tournament finish.
2. A win means first place in the reranked AOY-eligible field.
3. A Top 10 means an AOY finish from first through tenth place.
4. Zero-weight participation points do not count as a Top 10 unless the team's
   actual reranked AOY finish is within the Top 10.

## 14. Total Season Weight

1. Total Season Weight for tie-breaking purposes is the sum of the team's
   official tournament weights from all AOY-eligible tournament appearances
   during the season.
2. Total Season Weight is not restricted to only the five tournaments that
   count toward the AOY points total unless this rule is changed later by AITT.
3. No-show and disqualified entries contribute zero weight.

## 15. AOY Public Standings

The public AOY standings page should display:

- Rank
- Team
- AOY Points
- Events
- Wins
- Top 10s

AOY Points means the sum of the team's best five AOY tournament scores.

Events means the number of AOY-eligible qualifying tournament appearances, not
merely the number of scores included in the best five.

The page may later display Championship qualification status, but that status
must remain conceptually separate from AOY rank.

## 16. AOY Team Detail

Each team should have a public AOY detail view containing:

- Tournament
- Official Finish
- AOY Finish
- AOY Points
- Total Weight
- Counts toward Best Five

The Counts column should clearly show whether each tournament score contributes
to the best-five AOY total.

The page should display the team's Best Five AOY Total.

It may also display:

- total eligible events
- wins
- Top 10s
- Championship qualification progress

## 17. Membership Administration

AITT requires an Admin membership-management system that supports:

- searching anglers
- creating an angler
- adding a membership
- renewing a membership
- correcting spelling
- reviewing membership status
- recording membership season
- recording membership purchase source
- preserving membership history
- identifying possible duplicates
- merging confirmed duplicate angler records

Membership belongs to the individual angler, not to a WeighFish team-name
string.

Merging duplicate anglers must preserve memberships, team relationships,
tournament participation, and AOY history.

## 18. Identity Reconciliation

WeighFish imports may contain names that differ from AITT records. The system
must support matching imported participant names to stable angler records.

Potential issues include:

- First Last versus Last, First
- punctuation differences
- spacing differences
- suffixes
- nicknames
- misspellings
- partner order
- solo entries
- duplicate people with similar names

The system must not silently guess when a match is uncertain.

Uncertain matches should be presented for Admin review before AOY publication.

Once confirmed, the relationship should be reusable in future imports where
practical.

## 19. Publication and Recalculation

AOY awards should be generated only from official published tournament results
after required membership and identity reconciliation is complete.

The calculation should preserve:

- the source tournament result
- official finish
- AOY finish
- eligibility decision
- membership eligibility snapshot
- points awarded
- calculation version
- whether the score counts toward the current best five

If official results, identity matches, or eligible membership records are
corrected, an authorized Admin must be able to recalculate AOY.

Recalculation must be deterministic and must not silently alter official
tournament results.

## 20. Administrative Exceptions

The Tournament Director may approve documented exceptions in extraordinary
circumstances.

Exceptions must:

- be explicitly approved
- include an Admin note explaining the reason
- identify the person who approved the exception
- include the approval date
- remain auditable

The software must not automatically assume an exception.

Director exceptions may resolve documented identity or operational issues.
They may not override membership requirements except to correct a documented
administrative error.

## 21. Source-of-Truth Principles

The system must maintain:

- one stable angler identity
- one stable team identity
- one official published tournament result
- one membership source of truth
- one AOY calculation method
- one Championship qualification method

Display strings must not replace stable database identities.

Official results and AOY calculations must remain separate.

## 22. Initial Implementation Scope

The first implementation should prioritize only what is required to operate
AITT:

- stable anglers
- memberships by season
- stable two-person teams
- solo continuity
- imported-result participant matching
- AOY eligibility
- tournament AOY point awards
- best-five standings
- Championship participation count
- public standings
- team detail
- basic Admin membership management

Avoid unnecessary complexity such as:

- substitute-partner inheritance
- automatic nickname guessing
- complicated roster histories not required by AITT rules
- speculative features unrelated to current tournament operations

## 23. Open Decisions

The initial season-lifecycle, membership-retroactivity, new-team, Director
exception, and fourth tie-breaker questions have been resolved in this
specification. No unresolved Open Decisions remain for this foundation phase.

## 24. Acceptance Examples

### 24.1 Two Members Fishing Together

Registered team `John Smith / Mike Jones` fishes together. Both anglers are
current members. The team is AOY eligible, may receive Championship
qualification credit, and may receive Member Side Pot eligibility when all
other requirements are satisfied. Its official result remains unchanged.

### 24.2 One Registered Partner Fishing Alone

Mike Jones cannot attend, so John Smith fishes alone. John is a current member.
The solo appearance remains attached to the registered
`John Smith / Mike Jones` team and may earn AOY points, Championship
qualification credit, Member Side Pot eligibility when otherwise eligible, and
season participation credit.

### 24.3 One Angler Fishing With a Different Partner

John Smith fishes with Steve Brown instead of registered partner Mike Jones.
`John Smith / Steve Brown` is a new team. Its official result is published
normally, but the appearance provides no AOY points or Championship
qualification credit to `John Smith / Mike Jones`. The new pairing may establish
its own eligible team record when the applicable requirements are satisfied.

### 24.4 A Non-Member Team Wins the Official Tournament

A non-member team finishes first officially. An eligible member team finishes
second officially. The non-member team remains the official winner and retains
its standard tournament and Big Bass eligibility. For AOY only, the non-member
team is removed and the officially second-place eligible team becomes first in
the reranked AOY field and receives 200 AOY points.

### 24.5 An Eligible Team Records Zero Weight

An eligible member team checks in and participates but records zero tournament
weight. The team receives 10 AOY participation points. If it did not participate,
or if it was disqualified, it would receive 0 points. Its official result is not
changed by the AOY award.

### 24.6 Seven Events With Only the Best Five Counting

An eligible team earns AOY scores in seven tournaments. All seven scores remain
in its tournament-level history. Only its five highest scores contribute to its
season AOY total, and the other two are visibly marked as not counting toward
the Best Five AOY Total.

### 24.7 Leading AOY Without Championship Qualification

An eligible team has the highest AOY total after four events. Because there is
no minimum event requirement to win or lead AOY, it ranks first in AOY. Because
it has only four qualifying participations, it is not yet qualified for the
Championship.

### 24.8 Championship Qualification Without Winning AOY

An eligible team records five qualifying participations but earns fewer AOY
points than the leading team. It qualifies for the Championship because it has
five qualifying participations, even though it does not win or lead AOY.

### 24.9 Specification Consistency Confirmation

This specification confirms that:

1. Official Results and AOY Results remain separate.
2. Solo participation by either registered partner remains attached to the
   original team.
3. Fishing with a different partner creates a new team.
4. Championship qualification remains separate from AOY standings.
5. No minimum event count is required to win AOY.
6. Only the five highest AOY tournament scores contribute to the season AOY
   total.
