# Changelog

## 2026-07-23

### Domain and Infrastructure

- Registered `allintrail.com`.
- Confirmed GitHub connection.
- Selected Vercel, Cloudflare, and Supabase architecture.
- Chose free tiers for initial launch.

### Tournament Information

- Connected the Tournament Information form to live Supabase data.
- Verified successful tournament updates.
- Verified saved values persist after refresh.
- Added the temporary anon table-level UPDATE privilege required by the current
  unauthenticated development workflow.

### Contact and Email

- Enabled Cloudflare Email Routing for `allintrail.com`.
- Created and tested `info@allintrail.com` forwarding.
- Removed the Resend dependency.
- Removed the feedback email API route.
- Removed Resend environment-variable requirements.
- Updated the Contact page to `info@allintrail.com`.
- Converted the floating Contact widget to use the visitor's email application.
- Verified the new contact workflow.

### Security Follow-up

- Replace anonymous database writes with authenticated Supabase Admin policies
  before production.
- Revoke any obsolete Resend credential.
- Do not deploy until Admin authentication and production RLS are verified.
