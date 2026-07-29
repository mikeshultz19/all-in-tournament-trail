# AITT Documentation Index

Last reconciled: 2026-07-29

## Operations Reading Path

For the four-person AITT operating team:

1. [Knowledge Base — Start Here](knowledge-base/START-HERE.md)
2. [About AITT](knowledge-base/01-ABOUT-AITT.md)
3. [Running a Tournament](knowledge-base/02-RUNNING-A-TOURNAMENT.md)
4. [Memberships and Registration](knowledge-base/03-MEMBERSHIPS-AND-REGISTRATION.md)
5. [Results, AOY, and Championship](knowledge-base/04-RESULTS-AOY-AND-CHAMPIONSHIP.md)
6. [Admin Center Guide](knowledge-base/05-ADMIN-CENTER-GUIDE.md)
7. [Troubleshooting](knowledge-base/06-TROUBLESHOOTING.md)
8. [Glossary](knowledge-base/APPENDIX-GLOSSARY.md)
9. [Launch Test Plan](knowledge-base/AITT-LAUNCH-TEST-PLAN.md)

Business authorities:

- [Official Tournament Rules](TOURNAMENT_RULES.md)
- [AOY Specification](AOY_SPECIFICATION.md)
- [Payment Operations](PAYMENT_OPERATIONS.md)
- [Liability Waiver](LIABILITY_WAIVER.md) — draft pending legal review

## Technical Reading Path

For developers and technical maintenance:

1. [Current Project Status](ProjectStatus.md)
2. [Current-State Audit](CURRENT_STATE_AUDIT_2026-07-29.md)
3. [Dynamic Data Map](technical/DYNAMIC-DATA-MAP.md)
4. [Repository Map](RepositoryMap.md)
5. [System Architecture](SYSTEM_ARCHITECTURE.md)
6. [Supabase Setup](SUPABASE_SETUP.md)
7. [Security Notes](SECURITY_NOTES.md)
8. [Database Design](DATABASE_DESIGN.md) — blueprint sections are labeled
9. [WeighFish Integration](WeighFishIntegration.md)
10. [Admin Auth Setup](ADMIN_AUTH_SETUP.md)
11. [Development Roadmap](DevelopmentRoadmap.md)
12. [Decision Log](DecisionLog.md)

## Document classification

| Document/group | Classification | Note |
| --- | --- | --- |
| `knowledge-base/*` | Current operator documentation | Plain-language operating source. |
| `TOURNAMENT_RULES.md`, `AOY_SPECIFICATION.md`, `PAYMENT_OPERATIONS.md` | Current operator/business authority | Do not change casually. |
| `LIABILITY_WAIVER.md` | Needs owner/legal confirmation | Explicit draft. |
| `ProjectStatus.md`, `CURRENT_STATE_AUDIT_2026-07-29.md`, `technical/DYNAMIC-DATA-MAP.md`, `RepositoryMap.md` | Current technical documentation | Current implementation evidence. |
| `ADMIN_AUTH_SETUP.md`, `SECURITY_NOTES.md`, `SUPABASE_SETUP.md`, `SUPABASE_EXPLAINED.md` | Current technical documentation | Security/setup; current notes identify remaining policy gaps. |
| `DATABASE_DESIGN.md`, `ONLINE_REGISTRATION_WORKFLOW.md` | Current design authority with future/blueprint sections | Do not treat every section as implemented. |
| `ADMIN_CENTER_WORKFLOW.md`, `HOW_DYNAMIC_CONTENT_WORKS.md`, `SYSTEM_ARCHITECTURE.md`, `WeighFishIntegration.md` | Current technical overview needing audit cross-reference | Simplified; current audit wins on conflicts. |
| `TOURNAMENT_OPERATIONS_AND_REGISTRATION_PROCESS.md` | Current business/process authority with implementation notes | Rules remain authoritative; software gaps are labeled. |
| `RepositoryAudit.md` | Historical project snapshot | Already labeled historical. |
| `CHANGELOG.md`, `VersionHistory.md` | Historical project snapshots | Preserve dates; not current-state proof. |
| `DevelopmentRoadmap.md`, `PROJECT_DEPLOYMENT_CHECKLIST.md` | Current planning/checklist | Incomplete items are not features. |
| `00_START_HERE.md`, `README.md`, `AI_RELEARN.md` | Current technical navigation/context | Operations start in Knowledge Base. |
| `UI_STYLE_GUIDE.md`, `UI-Standards.md` | Current technical/design documentation | Similar but complementary terminology/visual scope. |
| `MasterSiteMap.md` | Current approved route authority | Implementation differences require approval. |
| `HOW_THE_WEBSITE_WORKS.md` | Needs reconciliation | Contains stale implementation claims; current audit supersedes them. |
| Root `README.md`, `AGENTS.md`, `CLAUDE.md` | Current technical/repository instructions | Maintainer entry points; not operator procedures. |
| `public/brands/README.md` | Current asset guidance | Apple Pay fallback instructions. |

Historical statements about deleted `components/AOYStandings.tsx` in
`RepositoryAudit.md` remain as dated evidence. The current AOY module is
`lib/aoy-standings.ts`; the deleted component must not be recreated.
