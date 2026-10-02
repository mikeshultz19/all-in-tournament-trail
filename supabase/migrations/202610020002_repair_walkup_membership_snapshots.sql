-- Preserve the simple walk-up rule: once a current-member review is resolved,
-- finalize the membership snapshot as an active, eligible existing member.
-- Also repair already-resolved walk-ups created before this finalization path.

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

  v_definition := replace(v_definition, chr(13) || chr(10), chr(10));
  if position('membership_snapshot = (' in v_definition) > 0 then
    return;
  end if;

  v_patched := regexp_replace(
    v_definition,
    'competitive_record_id[[:space:]]*=[[:space:]]*[(]',
    $inject$membership_snapshot = (
          select coalesce(jsonb_agg(
            item || jsonb_build_object(
              'resolvedClassification', 'current',
              'status', 'active',
              'eligibleForTournament', true,
              'anglerId', case entries.ordinality
                when 1 then v_registration.angler1_id
                when 2 then v_registration.angler2_id
              end
            ) order by entries.ordinality
          ), '[]'::jsonb)
          from jsonb_array_elements(coalesce(v_registration.membership_snapshot, '[]'::jsonb))
            with ordinality as entries(item, ordinality)
        ),
        competitive_record_id = ($inject$,
    1,
    1
  );

  if v_patched = v_definition then
    raise exception 'Expected walk-up competitive-record finalization point is missing.';
  end if;
  execute v_patched;
end;
$$;

update public.tournament_registrations registration
set membership_snapshot = (
  select coalesce(jsonb_agg(
    item || jsonb_build_object(
      'resolvedClassification', 'current',
      'status', 'active',
      'eligibleForTournament', true,
      'anglerId', case entries.ordinality
        when 1 then registration.angler1_id
        when 2 then registration.angler2_id
      end
    ) order by entries.ordinality
  ), '[]'::jsonb)
  from jsonb_array_elements(coalesce(registration.membership_snapshot, '[]'::jsonb))
    with ordinality as entries(item, ordinality)
)
where registration.registration_source = 'walk_up'
  and registration.identity_review_status = 'resolved_existing'
  and jsonb_typeof(registration.membership_snapshot) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(registration.membership_snapshot) item
    where item->>'resolvedClassification' is null
  );
