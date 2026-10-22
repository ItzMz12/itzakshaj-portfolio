-- ItzAkshaj private messages: run this in Supabase SQL Editor.
-- Security model:
--   * Any authenticated visitor may insert a message only as themselves.
--   * Only IDs explicitly placed in portfolio_admins can read/update/delete messages.
--   * The portfolio_admins table has RLS enabled and no browser-facing policies.
-- Never put a service_role key in frontend files.

create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create table if not exists public.portfolio_messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_email text,
  body text not null check (char_length(body) between 5 and 3000),
  created_at timestamptz not null default now()
);

alter table public.portfolio_messages enable row level security;
revoke all on public.portfolio_messages from anon, authenticated;
grant select, insert, delete on public.portfolio_messages to authenticated;
grant usage, select on sequence public.portfolio_messages_id_seq to authenticated;

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.portfolio_admins a
    where a.user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

drop policy if exists "Authenticated users can send as themselves" on public.portfolio_messages;
create policy "Authenticated users can send as themselves"
on public.portfolio_messages for insert to authenticated
with check (sender_id = (select auth.uid()));

drop policy if exists "Only portfolio owner can read messages" on public.portfolio_messages;
create policy "Only portfolio owner can read messages"
on public.portfolio_messages for select to authenticated
using (public.is_portfolio_admin());

drop policy if exists "Only portfolio owner can delete messages" on public.portfolio_messages;
create policy "Only portfolio owner can delete messages"
on public.portfolio_messages for delete to authenticated
using (public.is_portfolio_admin());

-- Optional: sender_email is for display convenience, not proof of identity.
-- It is populated from the authenticated session in the frontend; do not use it for authorization.
