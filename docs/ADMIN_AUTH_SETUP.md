# AITT Admin Auth Setup

AITT uses Supabase Auth email/password accounts and the standard persistent
Supabase browser session. There are exactly three Version 1 administrators:

- Mike: `mike@aitt.local`
- Sarah: `sarah@aitt.local`
- Brandon: `brandon@aitt.local`

All three administrators have identical permissions. Credentials must not be
stored in this repository or committed to source control.

## Create the Admin Users

For each administrator:

1. Open the linked project in Supabase Dashboard.
2. Go to **Authentication → Users**.
3. Select **Add user → Create new user**.
4. Enter the administrator's email address shown above.
5. Enter the initial password supplied through the private AITT credential
   handoff.
6. Enable automatic confirmation when creating the account. AITT does not use
   an email-verification workflow in Version 1.
7. Save the user.
8. Open the new user and set **App Metadata** to the corresponding values:

   ```json
   {
     "role": "admin",
     "active": true,
     "display_name": "Mike"
   }
   ```

   Use `Sarah` or `Brandon` for `display_name` on their accounts.

The `role` and `active` values are both required. An authenticated user without
both values is denied access to AITT Administration.

## Login and Session Behavior

Administrators sign in at `/admin/login` using either their short username
(`mike`, `sarah`, or `brandon`) or full Supabase email address.

AITT uses Supabase's standard persistent browser session and token refresh
behavior. It does not add password expiration, forced password changes,
password-management screens, custom short session limits, MFA, invitations, or
public registration.

Logout clears the current browser session and redirects to `/admin/login`.
