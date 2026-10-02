-- Repair registrations whose review rows are already resolved but whose
-- parent registration was left in review_required by the older walk-up path.

do $$
declare
  v_registration record;
  v_record public.teams;
  v_angler_ids uuid[];
begin
  for v_registration in
    select r.*
    from public.tournament_registrations r
    where r.identity_review_status = 'review_required'
      and r.registration_status = 'active'
      and r.competitive_record_id is null
      and r.angler1_id is not null
      and (r.registration_type = 'solo' or r.angler2_id is not null)
      and not exists (
        select 1
        from public.anglers inactive_angler
        where inactive_angler.id = any (
          case when r.registration_type = 'team'
            then array[r.angler1_id, r.angler2_id]
            else array[r.angler1_id]
          end
        )
        and (not inactive_angler.is_active or inactive_angler.merged_into_angler_id is not null)
      )
      and not exists (
        select 1 from public.registration_identity_reviews review
        where review.registration_id = r.id
          and review.review_status = 'review_required'
      )
      and not exists (
        select 1 from public.registration_identity_reviews approved_review
        where approved_review.registration_id = r.id
          and (approved_review.review_status = 'approved_new'
            or approved_review.resolution_method = 'admin_approved_new')
      )
  loop
    v_angler_ids := case when v_registration.registration_type = 'team'
      then array[v_registration.angler1_id, v_registration.angler2_id]
      else array[v_registration.angler1_id]
    end;

    select * into v_record
    from public.create_competitive_record(
      (select season_id from public.tournaments where id = v_registration.tournament_id),
      v_registration.registration_type,
      v_angler_ids,
      concat_ws(' / ', v_registration.angler1_name, v_registration.angler2_name)
    );

    update public.tournament_registrations
    set competitive_record_id = v_record.id,
        identity_review_status = 'resolved_existing',
        updated_at = now()
    where id = v_registration.id;
  end loop;
end;
$$;
