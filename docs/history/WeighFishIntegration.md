Version: 1.0
Last Updated: July 27, 2026

# WeighFish Integration

> **Historical / Superseded:** This file preserves the early planned import
> boundary. Use
> [technical/OFFICIAL_RESULTS_WORKFLOW.md](../technical/OFFICIAL_RESULTS_WORKFLOW.md)
> and the Staff Knowledge Base for the implemented workflow.

Status: **Partially implemented — identity reconciliation and authoritative AOY generation remain incomplete.**

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

AITT Admin Center now has authenticated, tournament-scoped CSV import,
result-entry persistence, review, insurance/photo, and publication screens.
Imported names are not yet reconciled to stable angler/team UUIDs, so
post-tournament membership reconciliation, authoritative AOY, and Championship
qualification remain incomplete.


---
For an overview of the project, begin with **00_START_HERE.md**.
