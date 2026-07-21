# WeighFish Integration

Status: **Planned — not implemented.**

The authoritative registration and operational process is defined in
`docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md`. The website stores
registrations, but it does not verify or track the manual entry of anglers into
WeighFish.

## Future Flow

```text
WeighFish CSV
→ Upload
→ Validate
→ Parse
→ Store tournament results
→ Store Big Bass with that tournament
→ Update standings and AOY
→ Update tournament history
→ Store supported payout information
→ Publish
```

This import uses the official WeighFish CSV exported after the tournament.
Post-tournament membership reconciliation is a separate later implementation
phase and is not performed by this planned CSV import.
