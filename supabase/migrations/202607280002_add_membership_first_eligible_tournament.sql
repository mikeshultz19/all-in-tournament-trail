alter table public.memberships
  add column if not exists first_eligible_tournament_id uuid;

alter table public.memberships
  drop constraint if exists memberships_first_eligible_tournament_id_fkey,
  add constraint memberships_first_eligible_tournament_id_fkey
    foreign key (first_eligible_tournament_id)
    references public.tournaments(id)
    on delete restrict;

create index if not exists memberships_first_eligible_tournament_id_idx
  on public.memberships (first_eligible_tournament_id);

comment on column public.memberships.first_eligible_tournament_id is
  'Stored first tournament where this membership becomes eligible for AOY, Championship qualification, and member benefits. This value is assigned administratively and is not calculated by the Members List.';
