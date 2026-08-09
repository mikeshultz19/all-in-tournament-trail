# Development Roadmap

Last updated: 2026-08-08

## Completed application foundations

- Public tournament, registration, announcements, Results, and standings views.
- Authenticated Admin Center and tournament operations workflow.
- Membership seasons, members, stable-team schema, and member administration.
- Tournament-scoped Reset, WeighFish import, payout review, image upload, and
  public publication interfaces.
- Registration identity review and imported-result reconciliation.
- Transactional Working Results import and immutable Official Results workflow.
- Payout calculation, place-by-place checks, and tournament financial closeout.
- Persisted AOY and Championship qualification engines.
- Cloudflare Workers production deployment through OpenNext and Wrangler.

## Next implementation order

1. Verify effective production RLS, grants, RPC permissions, Storage policies,
   and secret boundaries against the complete migration chain.
2. Run the complete implemented workflow against disposable nonproduction data:
   preparation, registration review, import, reconciliation, Insurance,
   payouts/checks, closeout, publication, AOY, and Championship qualification.
3. Implement and verify live Square sandbox checkout, callbacks, recovery,
   confirmation, and payment email before enabling production payment.
4. Resolve the remaining Wrangler remote/local metadata-drift warning without
   copying Cloudflare-generated metadata or changing healthy production
   behavior.
5. Continue accessibility, responsive, backup/restore, monitoring, and
   production smoke-test maintenance.

## Launch gate

Production public and Admin scope is live. Live Square payment remains gated on
verified sandbox-to-production payment behavior, secure secrets, recovery,
idempotency, and end-to-end tests. Operational workflows remain gated on clean
identity, payout, closeout, Official Results, AOY, and Championship evidence.
