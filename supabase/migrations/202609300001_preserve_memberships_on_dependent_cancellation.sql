-- Preserve a purchased membership when another active registration still
-- depends on it. Cancelling one registration must not invalidate another
-- tournament entry for the same angler.

create or replace function public.admin_cancel_registration_atomic(
  p_registration_id uuid,
  p_tournament_id uuid,
  p_admin_user_id uuid,
  p_admin_display_name text,
  p_cancellation_note text,
  p_manual_refund_status text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_registration public.tournament_registrations;
  v_membership_ids uuid[] := array[]::uuid[];
  v_membership_count integer := 0;
  v_revoked_labels text;
begin
  if p_admin_user_id is null
    or nullif(btrim(p_cancellation_note), '') is null
    or length(btrim(p_cancellation_note)) > 500
    or p_manual_refund_status not in ('pending', 'completed') then
    raise exception using errcode = '22023', message = 'AITT_REGISTRATION_CANCELLATION_INVALID';
  end if;

  select * into v_registration
  from public.tournament_registrations
  where id = p_registration_id
    and tournament_id = p_tournament_id
    and registration_status = 'active'
  for update;
  if not found then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_NOT_ACTIVE';
  end if;

  -- Only revoke memberships purchased by this registration when no other
  -- active registration snapshot references the same membership record.
  select coalesce(array_agg((snapshot ->> 'membershipId')::uuid), array[]::uuid[])
  into v_membership_ids
  from jsonb_array_elements(coalesce(v_registration.membership_snapshot, '[]'::jsonb)) snapshot
  where ((snapshot ->> 'submittedClassification') = 'joining'
     or (snapshot ->> 'resolvedClassification') = 'joining')
    and nullif(snapshot ->> 'membershipId', '') is not null
    and not exists (
      select 1
      from public.tournament_registrations other_registration
      where other_registration.id <> v_registration.id
        and other_registration.registration_status = 'active'
        and exists (
          select 1
          from jsonb_array_elements(coalesce(other_registration.membership_snapshot, '[]'::jsonb)) other_snapshot
          where other_snapshot ->> 'membershipId' = snapshot ->> 'membershipId'
        )
    );

  v_membership_count := coalesce(array_length(v_membership_ids, 1), 0);
  if v_membership_count > 0 then
    if (select count(*) from public.memberships membership
        where membership.id = any(v_membership_ids)
          and membership.payment_reference = v_registration.payment_reference
          and membership.status = 'active') <> v_membership_count then
      raise exception using errcode = '23514', message = 'AITT_PURCHASED_MEMBERSHIP_EVIDENCE_INVALID';
    end if;

    select string_agg(coalesce(angler.display_name, 'Angler'), ', ' order by membership.id::text)
    into v_revoked_labels
    from public.memberships membership
    join public.anglers angler on angler.id = membership.angler_id
    where membership.id = any(v_membership_ids);

    update public.memberships
    set status = 'cancelled',
        admin_notes = concat_ws(' ',
          'Membership revoked with cancelled registration',
          v_registration.registration_key,
          'by', coalesce(nullif(btrim(p_admin_display_name), ''), p_admin_user_id::text),
          '.'),
        updated_at = now()
    where id = any(v_membership_ids)
      and status = 'active'
      and payment_reference = v_registration.payment_reference;
  end if;

  update public.tournament_registrations
  set registration_status = 'cancelled',
      cancelled_at = now(),
      cancelled_by_admin_id = p_admin_user_id,
      admin_notes = concat_ws(E'\n', admin_notes,
        'Cancellation reason: ' || btrim(p_cancellation_note),
        'Manual refund status: ' || p_manual_refund_status,
        'Cancellation admin: ' || coalesce(nullif(btrim(p_admin_display_name), ''), p_admin_user_id::text),
        'Memberships revoked through cancellation: ' || coalesce(v_revoked_labels, 'None; preserved if another active registration depended on them')),
      updated_at = now()
  where id = v_registration.id
    and registration_status = 'active';

  if not found then
    raise exception using errcode = '23503', message = 'AITT_REGISTRATION_NOT_ACTIVE';
  end if;
  return true;
end;
$$;

revoke all on function public.admin_cancel_registration_atomic(uuid,uuid,uuid,text,text,text)
  from public, anon, authenticated;
grant execute on function public.admin_cancel_registration_atomic(uuid,uuid,uuid,text,text,text)
  to service_role;
