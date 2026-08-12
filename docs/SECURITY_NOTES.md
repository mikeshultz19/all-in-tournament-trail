# Security Notes

Last updated: 2026-08-10

## Implemented application controls

- Supabase Auth provides normal persistent browser sessions.
- `middleware.ts` protects `/admin/:path*`, fails closed when required Auth
  configuration is missing/invalid, and requires `role=admin` plus
  `active=true` in app metadata.
- Current Admin server actions independently call `requireAdminUser()`.
- Logout calls Supabase `auth.signOut()`, replaces the route with
  `/admin/login`, and refreshes the protected session state.
- The elevated Supabase client is guarded by `server-only` and reads
  `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY`.
- Browser/Auth code uses `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`; elevated credentials never belong in a
  `NEXT_PUBLIC_*` variable.

## Database and secret controls

Later migrations revoke the former anonymous write grants and policies for
`news`, `tournament_registrations`, `tournament_results`, and
`tournament_aoy_points`. The checked-in chain does not revoke the permissive
`Temporary admin tournament updates` policy created for `tournaments` in
`202607230001_create_tournaments.sql`. Authenticated UI protection does not
prevent direct use of that remaining anonymous database privilege. Effective
hosted grants and policies still require direct verification.

Maintain and periodically verify:

1. Revoke anonymous INSERT/UPDATE/DELETE privileges and permissive policies.
2. Add least-privilege authenticated Admin or service-role access.
3. Verify logged-out direct writes fail table by table.
4. Verify Storage bucket read/write/delete policies.
5. Keep `SUPABASE_SERVICE_ROLE_KEY` as a Cloudflare Secret in production and a
   local-only `.env.local` value for development; never write it to
   `wrangler.jsonc` or commit it.
6. Verify the service-role key is absent from client bundles and logs.
7. Test all manually provisioned Admin accounts and inactive/non-Admin
   denial paths.

Admin provisioning remains manual and is documented in
[ADMIN_AUTH_SETUP.md](ADMIN_AUTH_SETUP.md). No application-managed
password-expiry, MFA, invitation, or recovery workflow is implemented. Durable
registration and identity review exist, but live Square checkout/payment is
not operational.
