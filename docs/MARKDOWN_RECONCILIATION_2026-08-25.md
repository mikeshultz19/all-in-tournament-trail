# Markdown Reconciliation — 2026-08-25

Status: **Dated documentation audit.** This file records the reconciliation
inventory; it is not the business-rule authority. Use
[AITT Tournament Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md).

## Classification key

- **Authoritative:** controls the named subject.
- **Supporting:** current detail that must defer to the primary lifecycle or
  Official Rules.
- **Historical:** retained context; never current instructions.
- **Current:** substantially accurate before reconciliation.
- **Stale/conflicting:** contained at least one superseded active statement.

## Relevant Markdown inventory

| File | Purpose | Pre-reconciliation state | Role | Action |
| --- | --- | --- | --- | --- |
| `AGENTS.md` | Repository operating constraints | Conflicting payout/Square statements | Supporting | UPDATE |
| `README.md` | Developer setup and project summary | Stale implementation summary | Supporting | UPDATE |
| `docs/00_START_HERE.md` | Compatibility entry pointer | Current | Supporting | KEEP |
| `docs/ADMIN_AUTH_SETUP.md` | Admin authentication setup | Current | Supporting | KEEP |
| `docs/ADMIN_CENTER_WORKFLOW.md` | Abbreviated Admin workflow | Stale stage/workflow language | Supporting | UPDATE |
| `docs/AITT_COMPETITION_RULES.md` | Internal computational rules | Substantially current | Authoritative for calculations beneath Official Rules | KEEP/REFERENCE |
| `docs/AITT_LIFECYCLE_OPERATIONS.md` | Full implemented lifecycle | Missing | Primary authority | CREATE |
| `docs/AOY_SPECIFICATION.md` | Detailed AOY specification | Current but verbose/duplicative | Supporting technical | KEEP/REFERENCE |
| `docs/CHANGELOG.md` | Dated implementation history | Historical entries, missing reconciliation milestone | Supporting history | UPDATE |
| `docs/CURRENT_STATE.md` | Current readiness/status | Stale after staging lifecycle | Supporting current status | UPDATE |
| `docs/DecisionLog.md` | Durable dated decisions | Contains superseded payout/featured decisions | Supporting decision history | UPDATE with superseding decision |
| `docs/DevelopmentRoadmap.md` | Remaining work | Stale completion state | Supporting planning | UPDATE |
| `docs/DOCUMENTATION-INDEX.md` | Canonical documentation entry point | Stale hierarchy/version/status | Authoritative index | UPDATE |
| `docs/MARKDOWN_RECONCILIATION_2026-08-25.md` | Inventory and audit evidence | Missing | Historical/supporting audit | CREATE |
| `docs/MasterSiteMap.md` | Approved route authority | Current | Authoritative routes | KEEP |
| `docs/ONLINE_REGISTRATION_WORKFLOW.md` | Registration/payment lifecycle | Stale deadline and Square boundary | Supporting | UPDATE/REFERENCE |
| `docs/PAYMENT_OPERATIONS.md` | Payment and payout operations | Conflicting public payout total | Supporting | UPDATE/REFERENCE |
| `docs/PROJECT_DEPLOYMENT_CHECKLIST.md` | Deployment/migration procedure | Broadly current; needs environment/release order emphasis | Supporting | UPDATE |
| `docs/RepositoryMap.md` | Code/data ownership map | Missing new lifecycle authority/current components | Supporting | UPDATE |
| `docs/SECURITY_NOTES.md` | Security constraints | Current | Supporting | KEEP |
| `docs/SUPABASE_EXPLAINED.md` | Plain-language database explanation | Stale Championship status | Supporting | UPDATE |
| `docs/SUPABASE_SETUP.md` | Supabase setup and grants | Current, needs environment IDs/reference | Supporting | UPDATE |
| `docs/SYSTEM_ARCHITECTURE.md` | Technical architecture | Broadly current | Supporting | UPDATE/REFERENCE |
| `docs/TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md` | Long-form operations | Duplicative and partly stale deadline/workflow | Supporting | CONSOLIDATE into primary/reference |
| `docs/TOURNAMENT_RULES.md` | Canonical Official Rules | Current competition rules; stale automatic close wording/contact omission | Official authority | UPDATE with matching public copy |
| `docs/UI_STYLE_GUIDE.md` | UI vocabulary/layout | Stale Insurance abbreviation/mobile specifics | Supporting | UPDATE/REFERENCE |
| `docs/knowledge-base/START-HERE.md` | Staff knowledge-base entry | Current hierarchy needs primary link | Supporting | UPDATE |
| `docs/knowledge-base/01-ABOUT-AITT.md` | Business overview | Current | Supporting | KEEP/REFERENCE |
| `docs/knowledge-base/02-RUNNING-A-TOURNAMENT.md` | Tournament checklist | Stale standalone Insurance/six-stage flow | Supporting | UPDATE |
| `docs/knowledge-base/03-MEMBERSHIPS-AND-REGISTRATION.md` | Membership/registration guide | Stale featured coupling | Supporting | UPDATE |
| `docs/knowledge-base/04-RESULTS-AOY-AND-CHAMPIONSHIP.md` | Results and season engines | Conflicting payout total/old closeout | Supporting | UPDATE |
| `docs/knowledge-base/05-ADMIN-CENTER-GUIDE.md` | Route-by-route Admin guide | Stale Tournament Manager stages | Supporting | UPDATE |
| `docs/knowledge-base/06-TROUBLESHOOTING.md` | Operational troubleshooting | Stale featured/public payout checks | Supporting | UPDATE |
| `docs/knowledge-base/AITT-LAUNCH-TEST-PLAN.md` | Staging test plan | Useful but missing final lifecycle/DQ/mobile checks | Supporting | UPDATE |
| `docs/knowledge-base/APPENDIX-GLOSSARY.md` | Operational terms | Featured definition/payout language stale | Supporting | UPDATE |
| `docs/technical/2026_2027_SEASON_SCHEDULE.md` | Immutable season structure | Current | Supporting technical | KEEP |
| `docs/technical/AOY_ENGINE.md` | Implemented AOY engine | Current | Supporting technical | UPDATE/REFERENCE |
| `docs/technical/CHAMPIONSHIP_QUALIFICATION_ENGINE.md` | Implemented qualification engine | Current engine; missing registration-gate status | Supporting technical | UPDATE |
| `docs/technical/COMPETITIVE_RECORD_FOUNDATION.md` | Stable Team/Solo identity | Current | Supporting technical | KEEP |
| `docs/technical/DURABLE_REGISTRATION.md` | Atomic registration transaction | Stale deferred-payment wording | Supporting technical | UPDATE |
| `docs/technical/DYNAMIC-DATA-MAP.md` | Source/consumer map | Stale featured and payout sources | Supporting technical | UPDATE |
| `docs/technical/IDENTITY_RECONCILIATION_FOUNDATION.md` | Imported identity reconciliation | Current | Supporting technical | KEEP |
| `docs/technical/IMMUTABLE_TOURNAMENT_NUMBERING.md` | Season event numbering | Current | Supporting technical | KEEP |
| `docs/technical/OFFICIAL_RESULTS_HISTORICAL_SNAPSHOT.md` | Historical eligibility evidence | Current | Supporting technical | KEEP |
| `docs/technical/OFFICIAL_RESULTS_WORKFLOW.md` | Publication state machine | Missing active-only blocker/duplicate protection | Supporting technical | UPDATE |
| `docs/technical/REGISTRATION_IDENTITY_REVIEW_QUEUE.md` | Corrective identity review | Current, needs final action labels/reference | Supporting technical | UPDATE |
| `public/docs/TOURNAMENT_RULES.md` | Served Official Rules copy | Must mirror canonical source | Official served copy | UPDATE identically |
| `docs/history/README.md` | History index | Current | Historical index | KEEP |
| `docs/history/AI_RELEARN.md` | Earlier AI handoff | Stale by design | Historical | MARK HISTORICAL |
| `docs/history/CURRENT_STATE_AUDIT_2026-07-29.md` | Dated state audit | Stale by date | Historical | MARK HISTORICAL |
| `docs/history/DATABASE_DESIGN.md` | Original database proposal | Superseded | Historical | MARK HISTORICAL |
| `docs/history/DataModel.md` | Early data model | Superseded | Historical | MARK HISTORICAL |
| `docs/history/HOW_DYNAMIC_CONTENT_WORKS.md` | Early dynamic-data primer | Superseded | Historical | MARK HISTORICAL |
| `docs/history/HOW_THE_WEBSITE_WORKS.md` | Early/Vercel primer | Superseded | Historical | MARK HISTORICAL |
| `docs/history/ProjectStatus.md` | July status log | Superseded | Historical | MARK HISTORICAL |
| `docs/history/RepositoryAudit.md` | July repository audit | Superseded | Historical | MARK HISTORICAL |
| `docs/history/UI-Standards.md` | Early UI checklist | Superseded | Historical | MARK HISTORICAL |
| `docs/history/VersionHistory.md` | Early release plan | Superseded | Historical | MARK HISTORICAL |
| `docs/history/WeighFishIntegration.md` | Planned import flow | Superseded | Historical | MARK HISTORICAL |

## Reviewed but outside lifecycle reconciliation

These Markdown files were reviewed and intentionally left unchanged because
they do not redefine the requested lifecycle rules:

- `CLAUDE.md` — collaboration guidance.
- `docs/LIABILITY_WAIVER.md` and `public/docs/LIABILITY_WAIVER.md` — legal
  waiver source/served copy.
- `public/brands/README.md` — third-party asset attribution.

## Consolidation outcome

No Markdown file was deleted. Long-form supporting documents remain useful for
technical or route-specific detail, but now defer to the primary lifecycle
authority. Dated decisions and historical files remain available for audit
without controlling current behavior.
