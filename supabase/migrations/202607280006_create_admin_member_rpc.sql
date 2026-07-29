create or replace function public.admin_create_member(
  p_first_name text,
  p_last_name text,
  p_display_name text,
  p_normalized_name text,
  p_email text,
  p_phone text,
  p_season_id uuid,
  p_status text,
  p_effective_date date,
  p_first_eligible_tournament_id uuid
)
returns table (
  angler_id uuid,
  membership_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_angler_id uuid;
  v_membership_id uuid;
  v_existing_angler_id uuid;
  v_email text := nullif(lower(btrim(p_email)), '');
  v_phone text := nullif(btrim(p_phone), '');
begin
  if nullif(btrim(p_first_name), '') is null
    or nullif(btrim(p_last_name), '') is null
    or nullif(btrim(p_display_name), '') is null
    or nullif(btrim(p_normalized_name), '') is null then
    raise exception using errcode = '22023', message = 'AITT_INVALID_MEMBER_NAME';
  end if;

  if p_status not in ('active', 'cancelled', 'refunded') then
    raise exception using errcode = '22023', message = 'AITT_INVALID_MEMBERSHIP_STATUS';
  end if;

  if not exists (
    select 1
    from public.seasons
    where id = p_season_id
  ) then
    raise exception using errcode = '23503', message = 'AITT_SEASON_NOT_FOUND';
  end if;

  if not exists (
    select 1
    from public.tournaments
    where id = p_first_eligible_tournament_id
      and season_id = p_season_id
  ) then
    raise exception using errcode = '23503', message = 'AITT_ELIGIBLE_TOURNAMENT_NOT_FOUND';
  end if;

  if v_email is not null then
    perform pg_advisory_xact_lock(hashtextextended('member-email:' || v_email, 0));

    select id into v_existing_angler_id
    from public.anglers
    where lower(btrim(email)) = v_email
      and merged_into_angler_id is null
    limit 1;

    if v_existing_angler_id is not null then
      raise exception using
        errcode = 'P0001',
        message = 'AITT_DUPLICATE_EMAIL:' || v_existing_angler_id::text;
    end if;
  end if;

  if v_phone is not null then
    perform pg_advisory_xact_lock(hashtextextended('member-phone:' || v_phone, 0));

    select id into v_existing_angler_id
    from public.anglers
    where btrim(phone) = v_phone
      and merged_into_angler_id is null
    limit 1;

    if v_existing_angler_id is not null then
      raise exception using
        errcode = 'P0001',
        message = 'AITT_DUPLICATE_PHONE:' || v_existing_angler_id::text;
    end if;
  end if;

  insert into public.anglers (
    first_name,
    last_name,
    display_name,
    normalized_name,
    email,
    phone
  )
  values (
    btrim(p_first_name),
    btrim(p_last_name),
    btrim(p_display_name),
    btrim(p_normalized_name),
    nullif(btrim(p_email), ''),
    v_phone
  )
  returning id into v_angler_id;

  insert into public.memberships (
    angler_id,
    season_id,
    status,
    effective_date,
    first_eligible_tournament_id,
    source
  )
  values (
    v_angler_id,
    p_season_id,
    p_status,
    p_effective_date,
    p_first_eligible_tournament_id,
    'physical_form'
  )
  returning id into v_membership_id;

  return query select v_angler_id, v_membership_id;
end;
$$;

revoke all on function public.admin_create_member(
  text, text, text, text, text, text, uuid, text, date, uuid
) from public, anon, authenticated;

grant execute on function public.admin_create_member(
  text, text, text, text, text, text, uuid, text, date, uuid
) to service_role;

comment on function public.admin_create_member(
  text, text, text, text, text, text, uuid, text, date, uuid
) is
  'Service-role-only atomic creation of one angler and one season membership after application-level Admin authorization.';
