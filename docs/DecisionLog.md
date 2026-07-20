# Decision Log

Use this document to record approved project decisions that affect architecture, routes, design, data, integrations, or maintenance.

## Decision Template

### YYYY-MM-DD — Decision Title

- **Status:** Proposed | Approved | Superseded
- **Context:** Describe the issue or choice being considered.
- **Decision:** Record the approved direction.
- **Reasoning:** Explain why this direction was selected.
- **Impact:** List the routes, components, data, workflows, or documentation affected.
- **Follow-up:** Record any required next steps.

## Decisions

### 2026-07-20 — Separate event, result, and AOY data by responsibility

- **Status:** Approved
- **Context:** Tournament facts were duplicated across the schedule, homepage feature, AOY schedule, and a mixed winner placeholder module.
- **Decision:** Use one tournament slug for both pre-event information and its post-event result relationship. Keep public event facts in `data/tournaments.ts`, tournament results (including Big Bass) in `data/tournamentResults.ts`, and AOY standings in `data/aoyStandings.ts`.
- **Reasoning:** Stable slug relationships and separate typed modules remove duplicated facts while keeping each data concern replaceable by a future admin or WeighFish workflow.
- **Impact:** Homepage tournament components, Schedule, Results, result detail routes, and static data ownership now share the same event identity without merging result or AOY values into event records.
- **Follow-up:** Preserve these boundaries when implementing real result publication, AOY calculations, registration, or WeighFish imports.
