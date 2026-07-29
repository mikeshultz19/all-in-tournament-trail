# System Architecture

> Current-state note (2026-07-29): This is a simplified intended flow.
> Registration finalization, stable identity reconciliation, atomic immutable
> publication, authoritative AOY, and Championship qualification remain gaps.

Version: 1.0
Last Updated: July 27, 2026

Tournament Director
    |
Admin Center
    |
Select Tournament
    |
WeighFish Import
    |
Insurance Review
    |
Winner Photos
    |
Publish Tournament
    |
Supabase
    |
Public Website

The public website reads published information from Supabase. The Admin Center writes and manages that information.
