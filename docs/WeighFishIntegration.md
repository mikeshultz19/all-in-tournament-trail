# WeighFish Integration

Status: **Planned — not implemented.**

The authoritative registration, payment, and operational processes are defined in `docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md`. AITT will store confirmed Early Online Registrations after successful Square payment once persistence is implemented. WeighFish owns Tournament-Morning Registration, Cash or Card selection, the tournament-day roster, check-in, weigh-in, scoring, official results, and the official CSV export.

## Future Flow

```text
WeighFish
→ Export official tournament CSV
→ Upload through AITT's protected import workflow
→ Validate and preview
→ Associate with one tournament
→ Import official tournament data
→ Preserve source filename, import timestamp, and validation outcome
→ Store tournament results and Big Bass
→ Update standings, AOY, and tournament history
→ Import payment method when present
→ Publish
```

Unknown payment-method values remain available for review rather than being guessed. The workflow must detect duplicate imports and uncertain angler or team matches without automatically merging them. No real-time AITT, WeighFish, or Square synchronization is planned.

Authentication, persistence, and a protected Admin Portal do not yet exist, so no public upload endpoint is implemented. Post-tournament membership reconciliation remains a later phase.
