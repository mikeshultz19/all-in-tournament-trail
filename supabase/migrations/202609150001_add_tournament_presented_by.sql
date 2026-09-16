alter table public.tournaments
  add column if not exists presented_by text not null default 'AITT';
