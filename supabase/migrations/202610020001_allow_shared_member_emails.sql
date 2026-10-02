-- Shared email addresses are valid member data (for example, spouses or
-- family members). Email is contact information, not a unique member key.
-- Keep phone duplicate handling unchanged; remove only the email uniqueness
-- guard from the admin member-create RPC.

do $migration$
declare
  v_definition text;
  v_patched text;
begin
  select pg_get_functiondef(p.oid)
    into v_definition
  from pg_proc p
  where p.oid = 'public.admin_create_member(text,text,text,text,text,text,uuid,text,date,uuid)'::regprocedure;

  if v_definition is null then
    raise exception 'Required admin member function is missing.';
  end if;

  -- Normalize CRLF definitions before matching the removable block.
  v_definition := replace(v_definition, chr(13) || chr(10), chr(10));

  if position('if v_email is not null then' in v_definition) = 0 then
    return;
  end if;

  v_patched := replace(
    v_definition,
    $remove_email$
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

$remove_email$,
    ''
  );

  if v_patched = v_definition then
    raise exception 'Expected shared-email guard was not found in admin member function.';
  end if;

  execute v_patched;
end;
$migration$;
