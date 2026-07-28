alter table public.tournaments
  add column if not exists practice_information text;

update public.tournaments
set practice_information = nullif(
  concat_ws(
    E'\n\n',
    nullif(btrim(non_member_practice_rule), ''),
    nullif(btrim(member_practice_rule), '')
  ),
  ''
)
where nullif(btrim(practice_information), '') is null
  and (
    nullif(btrim(non_member_practice_rule), '') is not null
    or nullif(btrim(member_practice_rule), '') is not null
  );

comment on column public.tournaments.practice_information is
  'Official free-form tournament practice and off-limits information.';
