-- Keep inactive historical angler records from hijacking a new walk-up.
-- If the current-member review fallback has no remaining review rows, finish
-- the registration so it can be published and closed out normally.

do $$
declare
  v_definition text;
  v_patched text;
  v_signature text;
begin
  foreach v_signature in array array[
    'public.complete_durable_registration_core(uuid,text,jsonb,jsonb,text,text,text,jsonb)',
    'public.admin_create_walkup_registration(uuid,text,jsonb,integer,jsonb,text,integer,uuid)'
  ] loop
    select pg_get_functiondef(p.oid)
      into v_definition
    from pg_proc p
    where p.oid = v_signature::regprocedure;

    if v_definition is null then
      raise exception 'Required registration function is missing: %', v_signature;
    end if;

    v_patched := regexp_replace(
      v_definition,
      $$(where lower\(btrim\(email\)\) = v_email\s+and )merged_into_angler_id is null$$,
      $$\1is_active = true and merged_into_angler_id is null$$,
      'g'
    );
    if v_patched = v_definition then
      raise exception 'Expected inactive-email match in registration function: %', v_signature;
    end if;
    execute v_patched;
  end loop;
end;
$$;

do $$
declare
  v_definition text;
  v_patched text;
begin
  select pg_get_functiondef(p.oid)
    into v_definition
  from pg_proc p
  where p.oid = 'public.admin_create_current_member_review_walkup(uuid,text,jsonb,jsonb,text,integer,uuid)'::regprocedure;

  if v_definition is null then
    raise exception 'Required current-member walk-up function is missing.';
  end if;

  v_patched := replace(
    v_definition,
    '  update public.tournament_registrations set boat_number = v_next_boat_number,',
    $inject$
  if v_registration.identity_review_status = 'review_required'
    and not exists (
      select 1
      from public.registration_identity_reviews pending_review
      where pending_review.registration_id = v_registration.id
        and pending_review.review_status = 'review_required'
    ) then
    update public.tournament_registrations registration
    set competitive_record_id = (
          select created_record.id
          from public.create_competitive_record(
            (select season_id from public.tournaments where id = p_tournament_id),
            p_registration_type,
            case when p_registration_type = 'team'
              then array[v_registration.angler1_id, v_registration.angler2_id]
              else array[v_registration.angler1_id]
            end,
            concat_ws(' / ', v_registration.angler1_name, v_registration.angler2_name)
          ) created_record
        ),
        identity_review_status = 'resolved_existing',
        updated_at = now()
    where registration.id = v_registration.id
    returning registration.* into v_registration;
  end if;

  update public.tournament_registrations set boat_number = v_next_boat_number,$inject$,
  );

  if v_patched = v_definition then
    raise exception 'Expected current-member walk-up finalization point is missing.';
  end if;
  execute v_patched;
end;
$$;
