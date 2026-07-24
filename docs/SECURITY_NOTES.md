# Security Notes

Updated: 2026-07-23

## Supabase keys

- A Supabase publishable/anonymous key may be used by public clients when Row
  Level Security is correctly designed and tested.
- A Supabase secret or service-role key bypasses normal protections and must
  never be exposed to browser code, committed files, screenshots, examples, or
  documentation.
- Real environment values, passwords, access tokens, email credentials, and
  payment credentials must not be committed.
- The server client currently reads `SUPABASE_URL` and
  `SUPABASE_ANON_KEY`.

## Current temporary exception

`public.tournaments` has RLS enabled and supports anonymous public reads. It
also has a temporary anonymous table-level `UPDATE` privilege and RLS policy so
Tournament Information work can proceed before authentication. This access is
not safe for production.

Before launch:

1. Implement Supabase Auth.
2. Protect Admin routes and server-side write actions.
3. Replace anonymous update access with policies requiring authenticated Admin
   users.
4. Verify logged-out users cannot update tournaments.
5. Confirm no privileged key is included in browser bundles.
6. Revoke the obsolete Resend credential if that has not already been done.

## Grants and RLS

Database grants and RLS policies are separate layers:

- Grants determine whether a role may attempt an operation on a schema/table.
- RLS policies determine which rows are visible or writable for that operation.

The current anonymous read fix grants schema usage and table `SELECT`; the
public read RLS policy then allows tournament rows to be returned. The current
development write path similarly requires table-level `UPDATE` and an update
policy. A permissive RLS policy does not replace a missing table privilege.

## Other planned security work

- Supabase Auth is not complete.
- Admin authentication and authorization are not complete.
- Supabase Storage and upload policies are not complete.
- Square payment creation and verification are not complete.
- Do not treat the current Admin Center URL as an access-control boundary.
