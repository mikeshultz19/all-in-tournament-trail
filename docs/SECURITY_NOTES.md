# Security Notes

Last updated: 2026-07-29

## Implemented application controls

- Supabase Auth provides normal persistent browser sessions.
- `proxy.ts` protects `/admin/:path*` and requires `role=admin` plus
  `active=true` in app metadata.
- current Admin Server Actions independently call `requireAdminUser()`.
- logout calls Supabase `signOut()` and returns to Admin login.
- the service-role client is imported from server-only modules.

## Production blocker: anonymous database writes

Legacy migrations still grant anonymous writes and permissive RLS policies for
one or more operations on `tournaments`, `news`, `tournament_registrations`,
`tournament_results`, and `tournament_aoy_points`. Authenticated UI protection
does not prevent direct use of those anonymous database privileges.

Before production:

1. Revoke anonymous INSERT/UPDATE/DELETE privileges and permissive policies.
2. Add least-privilege authenticated Admin or service-role access.
3. Verify logged-out direct writes fail table by table.
4. Verify Storage bucket read/write/delete policies.
5. Verify the service-role key is absent from client bundles.
6. Test all three manually provisioned Admin accounts and inactive/non-Admin
   denial paths.

Admin provisioning remains manual and is documented in
[ADMIN_AUTH_SETUP.md](ADMIN_AUTH_SETUP.md). No password-expiry, MFA,
invitation, recovery, or public-registration system is implemented.
