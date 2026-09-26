-- Governance decision: a person may have more than one registration in the
-- same tournament. Keep each paid registration valid and let the Tournament
-- Director handle any rare duplicate manually with the existing cancellation
-- workflow. This migration removes the final database-side duplicate guard
-- from the durable registration RPC.

do $remove_duplicate_guard$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'public.complete_durable_registration_core(uuid,text,jsonb,jsonb,text,text,text,jsonb)'::regprocedure
  )
  into function_definition;

  function_definition := regexp_replace(
    function_definition,
    $duplicate_guard$\s+select \* into v_existing\s+from public\.tournament_registrations\s+where tournament_id = p_tournament_id\s+and competitive_record_id = v_record\.id;\s+if found then\s+raise exception using errcode = '23505', message = 'AITT_REGISTRATION_ALREADY_EXISTS';\s+end if;$duplicate_guard$,
    E'\n',
    1
  );

  if function_definition = pg_get_functiondef(
    'public.complete_durable_registration_core(uuid,text,jsonb,jsonb,text,text,text,jsonb)'::regprocedure
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'AITT duplicate registration guard was not found';
  end if;

  execute function_definition;
end;
$remove_duplicate_guard$;
