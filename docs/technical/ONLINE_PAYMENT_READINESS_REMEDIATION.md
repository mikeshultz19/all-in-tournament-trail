# Online Payment Readiness Remediation

Updated September 25, 2026 after the AITT Claude audit.

## Closed findings

- **C1 — Square CSP:** the registration Content Security Policy now selects Square Sandbox or production origins from `SQUARE_ENVIRONMENT`. Staging remains Sandbox; production must explicitly set `SQUARE_ENVIRONMENT=production`.
- **H1 — duplicate team angler:** server validation rejects a Team whose two anglers have the same normalized name and matching email or phone before a payment attempt is created.
- **H2 — paid without registration:** Admin now has **Payment Recovery** at `/admin/payment-recovery`. It lists `reconciliation_required` online payment attempts with the amount, Square payment ID, anglers, and failure note. Staff must review the Square payment and must not charge the customer again for the same attempt.
- **H3 — production deploy guard:** production deployment now requires Supabase, Square, webhook, and email configuration; rejects Sandbox Square settings and IDs; requires the production email environment; and requires the HTTPS production Square webhook URL.

## Verification

- Focused payment-readiness tests: passing.
- Full local test suite: 1,073 tests passing.
- Next build: passing.
- Staging deployment: version `28ac04cd-4186-4a80-9258-47e1405f4a77`.
- Production was not changed.

## Still required before live payments

Populate `.env.production.local` and the production Worker secrets with the real production Square, Supabase, webhook, and email values. The production deploy guard is intentionally expected to refuse deployment until those values are present and consistent.

