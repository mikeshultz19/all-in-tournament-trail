# Results, AOY, and Championship

## Draft and imported results

The WeighFish CSV import creates tournament-scoped draft result rows. Staff
must verify finishing order, team names, fish count, total weight, Big Bass,
standard payout, Bronze, Silver, Gold, and prize information before publishing.
Imported rows are not Official Results until publication.

## Official Results and publication

Official Results preserve the complete finishing order, weights, names, Big
Bass, and payouts. Membership never filters or reorders them. Once published,
they must be immutable.

The current software can upsert published Results and also retains a second
legacy Results editor. Therefore immutability is a required business rule that
the current implementation does not yet enforce. Do not use the system for a
live launch until this is corrected and tested.

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

## Current implementation gap

The existing `tournament_aoy_points` public reader groups individual display
names, keeps each name's best five stored point values, sorts by total points,
and uses alphabetical order for equal totals. It does not implement the stable
team, eligibility, reranking, participation, or approved tie-breaker algorithm.
No code currently proves how authoritative AOY rows are generated.

## Homepage and Standings

The homepage shows up to five live published AOY records above Winner's Circle
in display order 2nd, 3rd, 1st, 4th, 5th. First place is centered. The full
Standings page uses the same data reader and ranking. Both must agree.

## Championship qualification

Qualification is separate from AOY rank. A stable eligible team needs five
qualifying participations. The registered pair or either registered partner
fishing alone counts. No-show, disqualification, different partner, or failed
membership eligibility does not count. Championship does not award AOY points.

Championship calculation and persistence are not implemented. This is a launch
stop condition.

## What to Verify

- Admin draft equals the WeighFish export.
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
