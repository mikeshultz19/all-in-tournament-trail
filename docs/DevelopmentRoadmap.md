# Development Roadmap

Last updated: 2026-08-25

Current readiness and blocker classifications are maintained in
[AITT Current State](CURRENT_STATE.md).

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

1. Remove the remaining permissive anonymous tournament-update policy, then
   verify effective production RLS, grants, RPC permissions, Storage policies,
   and secret boundaries against the complete migration chain.
2. Repeat the completed staging lifecycle with a clean disposable tournament,
   including an explicit competitive DQ case and responsive acceptance checks.
3. Roll out the implemented Square flow incrementally only after approved
   production configuration, recovery, confirmation-email, and smoke checks.
4. Resolve the remaining Wrangler remote/local metadata-drift warning without
   copying Cloudflare-generated metadata or changing healthy production
   behavior.
5. Continue accessibility, responsive, backup/restore, monitoring, and
   production smoke-test maintenance.

## Launch gate

Production public and Admin scope is live. Production Square enablement remains
gated on explicit approval, secure production configuration, recovery,
idempotency, confirmation, and smoke tests. Championship public registration
also remains gated on qualification enforcement.
