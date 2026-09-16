# System Architecture

Last Updated: September 15, 2026

Business and operational behavior is defined in
[AITT Lifecycle and Operations](AITT_LIFECYCLE_OPERATIONS.md).

AITT is a Next.js 16, React 19, and TypeScript application deployed to
Cloudflare Workers through OpenNext and Wrangler. `wrangler.jsonc` is the
source-controlled Worker configuration and declares the `allintrail.com`
Custom Domain. Supabase provides PostgreSQL, Auth, and Storage.

```text
Public browser ───────► Next.js on Cloudflare Workers ───────► Supabase
                              │                                  PostgreSQL
Admin browser ────────► middleware + Admin Auth                   Auth
                              │                                  Storage
                              ▼
                    protected server actions
                              │
WeighFish CSV ───────► Working Results and reconciliation
                              │
                              ▼
                    payout and financial closeout
                              │
                              ▼
                    immutable Official Results
                              │
                              ├──► public Results/Winner's Circle
                              ├──► AOY projection
                              └──► Championship qualification
```

The elevated Supabase client is server-only and reads `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY`. In production, the service-role value remains a
Cloudflare Secret. Browser/Auth clients use only the public Supabase URL and
anonymous key; elevated credentials must never use a `NEXT_PUBLIC_*` name.

The durable registration, verified Square payment boundary, recovery path, and
identity-review infrastructure exist. Production payment enablement remains an
explicitly controlled environment and rollout decision. Resend supports both
registration-interest acknowledgments and durable paid-registration
confirmation delivery. Confirmation delivery uses a persisted outbox, retry
state, idempotency, and staging recipient restrictions. Contact remains
visitor-initiated email through Cloudflare Email Routing.

Tournament Information is the database-backed authority for public tournament
display values. The active-season loader supplies Schedule and Admin selectors;
the selected Featured Tournament is adapted from the same tournament record.
Logic-dependent morning registration time is stored as `HH:mm`, validated on
save, and consumed through fail-safe public operations logic.

The staging Supabase project is kept active by a daily, read-only GitHub Actions
job. It validates the exact staging project origin and explicitly refuses the
production project before issuing a single-row `GET`.
