# Development Roadmap

Last updated: 2026-07-29

## Completed application foundations

- Public tournament, registration, announcements, Results, and standings views.
- Authenticated Admin Center and tournament operations workflow.
- Membership seasons, members, stable-team schema, and member administration.
- Tournament-scoped Reset, WeighFish import, payout review, image upload, and
  public publication interfaces.

## Next implementation order

1. Remove all anonymous database writes and verify production RLS/Storage.
2. Consolidate publication into one atomic, immutable Results workflow; retire
   the legacy editor only after migration and operational verification.
3. Reconcile imported participants to stable angler/team identities.
4. Implement the authoritative AOY engine from published Official Results.
5. Implement Championship qualification separately from AOY.
6. Run the complete workflow against a disposable tournament, including reset,
   registration, import, reconciliation, publication, AOY, and qualification.
7. Complete deployment, DNS, responsive/accessibility, and production smoke
   testing.

## Launch gate

Launch requires no anonymous writes, one immutable publication path, atomic
closeout, correct stable-team AOY/Championship behavior, verified backup/reset
behavior, passing validation, and end-to-end production-environment tests.
