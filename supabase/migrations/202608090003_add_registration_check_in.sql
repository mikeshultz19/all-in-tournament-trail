alter table public.tournament_registrations
  add column if not exists checked_in_at timestamptz,
  add column if not exists checked_in_by_admin_id uuid;

alter table public.tournament_registrations
  drop constraint if exists tournament_registrations_check_in_pair_check,
  add constraint tournament_registrations_check_in_pair_check check (
    (checked_in_at is null) = (checked_in_by_admin_id is null)
  );

comment on column public.tournament_registrations.checked_in_at is
  'Operational timestamp recording when a pre-registered entry arrived at tournament-morning check-in.';

comment on column public.tournament_registrations.checked_in_by_admin_id is
  'Admin Auth user who most recently marked the registration checked in; cleared when check-in is undone.';
