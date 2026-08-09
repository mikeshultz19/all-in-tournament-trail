# Results, AOY, and Championship

## Draft and imported results

The WeighFish CSV import creates tournament-scoped draft result rows. Staff
must verify finishing order, team names, fish count, total weight, Big Bass,
standard payout, Bronze, Silver, Gold, and prize information before publishing.
Imported rows are not Official Results until publication.

Import immediately after weigh-in, while the official source and Tournament
Director are available. Resolve registration and identity reviews, then mark
the imported results verified before calculating any payout.

## Live-event payout and closeout priority

Verified results feed the Insurance Pot and Calculate Payouts stages. Complete
the place-by-place payout assignments, generate checks, reconcile collections,
track delivery, and finish tournament financial closeout before spending time
on website photos or public publication. Anglers waiting to be paid are the
first priority.

The Insurance Pot uses a true 1-in-5 payout, with a minimum of one paid place
whenever there are Insurance Pot entries. Payouts begin with the first eligible
team outside the Tournament Entry payout. Use Tournament Manager to save the
calculation and winners; consult the Official Tournament Rules for governing
eligibility language.

## Official Results and publication

Official Results preserve the complete finishing order, weights, names, Big
Bass, and payouts. Membership never filters or reorders them. Tournament
Manager publishes the verified working results as the official historical
record. After publication, use only the authorized audited correction/reset
workflow; never directly rewrite the public record to fix a display.

## Winner's Circle and Results pages

Winner's Circle displays the latest published tournament, winner, leading
finishers, payout summaries, Big Bass, and saved photos. Results index displays
the newest published event and archive links. `/results/[slug]` displays a
published archive record. Unpublished tournaments must not appear.

## Payout rule

`TOTAL PAID OUT TO ANGLERS` is exactly:

**Bronze + Silver + Gold + Insurance**

It excludes standard tournament payout, Big Bass, sponsor/contingency awards,
merchandise, and non-cash prizes. Standard tournament and Big Bass payouts may
still appear in their own locations. WeighFish Side Pots 1–3 map to Bronze,
Silver, and Gold. Insurance is entered manually.

## Authoritative AOY business calculation

The approved rule is:

1. Start with the complete published Official Results.
2. Determine stable-team and membership eligibility.
3. Remove ineligible entries from the AOY calculation only.
4. Preserve Official Results unchanged.
5. Rerank eligible teams in original relative order.
6. Award 200 points to AOY first, 199 to AOY second, then decrease by one.
7. An eligible participating zero-weight team receives 10 participation points.
8. No-show and disqualified teams receive 0.
9. Retain every tournament score; sum only each team's best five for season
   AOY.
10. Rank ties by wins, Top 10s, total eligible-season official weight, then the
    most recent regular-season AOY finish working backward.

Wins and Top 10s use reranked AOY finish. Total tie-break weight uses all
AOY-eligible appearances, not only best five.

### Worked example

Fictional Official Results:

| Official finish | Team | Eligibility | Weight |
| --- | --- | --- | --- |
| 1 | Pine / Reed | Not eligible | 24.50 |
| 2 | Lake / Stone | Eligible | 23.80 |
| 3 | Hill / Brooks | Eligible | 22.10 |
| 4 | Creek / West | Not eligible | 21.75 |
| 5 | North / Fields | Eligible | 0.00 |

AOY Results:

- Lake / Stone becomes AOY 1st and earns 200.
- Hill / Brooks becomes AOY 2nd and earns 199.
- North / Fields participated with zero weight and receives 10.
- Pine / Reed and Creek / West remain unchanged in Official Results and earn
  no AOY points.

If Lake / Stone later has seven scores of 200, 197, 194, 190, 186, 180, and
175, its AOY total is the five highest: **967**. All seven remain visible.

## AOY processing

The AOY engine builds a persisted, rebuildable projection from published
Official Results and stable Competitive Records. After publishing a Regular
Season event, run the approved AOY recalculation, review the changed points and
standings, and confirm the current projection before relying on public displays.
The Regular Season has eight tournaments, and each eligible entry's five
highest point totals determine its final AOY score. Membership is required.

## Homepage and Standings

The homepage shows up to five live published AOY records above Winner's Circle
in display order 2nd, 3rd, 1st, 4th, 5th. First place is centered. The full
Standings page uses the same data reader and ranking. Both must agree.

## Championship qualification

Qualification is separate from AOY rank. A stable eligible member team must
compete in five of the eight Regular Season tournaments. The registered pair
or either registered partner fishing alone counts for the original team.
No-show, disqualification, different partner, or failed membership eligibility
does not count. Championship does not award AOY points.

The Championship qualification engine stores a separate rebuildable
projection. Recalculate it after the appropriate Official Results publication
or authorized correction, then verify participation counts independently from
AOY points and rank.

## What to Verify

- Admin draft equals the WeighFish export.
- All required imported-result identity reviews are resolved.
- Payout checks and financial closeout are complete before website work.
- Published Results preserve every official entry and finish.
- Winner's Circle, Results index/detail, and photos agree.
- Public payout total follows the locked formula.
- AOY uses only published events and stable eligible teams.
- Homepage AOY and Standings show the same ranks/points.
- Championship progress counts qualifying appearances, not AOY rank.

## Related Documents

- [AOY Specification](../AOY_SPECIFICATION.md)
- [Official Tournament Rules](../TOURNAMENT_RULES.md)
- [Troubleshooting](06-TROUBLESHOOTING.md)
