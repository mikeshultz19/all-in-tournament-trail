# System Architecture

Last Updated: August 25, 2026

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

The durable registration, verified Square payment boundary, and identity-review
infrastructure exist. Production payment enablement remains an explicitly
controlled release step. Resend is
used by the registration-interest flow when `RESEND_API_KEY` is configured;
Contact remains visitor-initiated email through Cloudflare Email Routing.
