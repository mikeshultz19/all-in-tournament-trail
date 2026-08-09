# System Architecture

Last Updated: August 8, 2026

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

The durable registration and identity-review infrastructure exists. Live
Square checkout, verified Square payment completion, and production online
payment remain pending and must not be represented as operational. Resend is
used by the registration-interest flow when `RESEND_API_KEY` is configured;
Contact remains visitor-initiated email through Cloudflare Email Routing.
