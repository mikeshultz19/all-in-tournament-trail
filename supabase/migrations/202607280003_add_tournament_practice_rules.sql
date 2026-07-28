alter table public.tournaments
  add column if not exists non_member_practice_rule text,
  add column if not exists member_practice_rule text;

comment on column public.tournaments.non_member_practice_rule is
  'Official pre-tournament practice rule displayed to non-members.';

comment on column public.tournaments.member_practice_rule is
  'Official pre-tournament practice rule displayed to AITT members.';
