-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─── Team invite links ───────────────────────────────────────────────────────
create table if not exists public.team_invite_links (
  id          uuid        primary key default gen_random_uuid(),
  token       text        unique not null default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  office_id   uuid        not null references public.offices(id) on delete cascade,
  role        text        not null check (role in ('seller', 'manager')),
  created_by  uuid        not null references auth.users(id),
  used_at     timestamptz,
  used_by     uuid        references auth.users(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

alter table public.team_invite_links enable row level security;

-- admin_lawyer (office owner) can read their own links
drop policy if exists "team_invite_links_select_owner" on public.team_invite_links;
create policy "team_invite_links_select_owner" on public.team_invite_links
  for select to authenticated
  using (
    office_id in (
      select id from public.offices where owner_id = auth.uid()
    )
  );

-- admin_lawyer (office owner) can create links for their office
drop policy if exists "team_invite_links_insert_owner" on public.team_invite_links;
create policy "team_invite_links_insert_owner" on public.team_invite_links
  for insert to authenticated
  with check (
    office_id in (
      select id from public.offices where owner_id = auth.uid()
    )
    and created_by = auth.uid()
  );

-- ─── get_invite_info ─────────────────────────────────────────────────────────
-- Public function: returns safe invite metadata for a token without auth.
drop function if exists public.get_invite_info(text);
create function public.get_invite_info(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link  team_invite_links;
  v_oname text;
begin
  select l.* into v_link
  from public.team_invite_links l
  where l.token = p_token;

  if not found then
    return json_build_object('valid', false, 'error', 'Link não encontrado.');
  end if;

  if v_link.used_at is not null then
    return json_build_object('valid', false, 'error', 'Este link já foi utilizado.');
  end if;

  if v_link.expires_at < now() then
    return json_build_object('valid', false, 'error', 'Este link expirou.');
  end if;

  select name into v_oname from public.offices where id = v_link.office_id;

  return json_build_object(
    'valid',       true,
    'role',        v_link.role,
    'office_id',   v_link.office_id::text,
    'office_name', coalesce(v_oname, 'Escritório')
  );
end;
$$;

grant execute on function public.get_invite_info(text) to anon, authenticated;

-- ─── redeem_invite ───────────────────────────────────────────────────────────
-- Called right after sign-up. Atomically sets role/office_id/is_active=false
-- and marks the token as consumed.
drop function if exists public.redeem_invite(text, uuid);
create function public.redeem_invite(p_token text, p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link team_invite_links;
begin
  select * into v_link
  from public.team_invite_links
  where token = p_token
  for update;

  if not found then
    return json_build_object('success', false, 'error', 'Link não encontrado.');
  end if;

  if v_link.used_at is not null then
    return json_build_object('success', false, 'error', 'Este link já foi utilizado.');
  end if;

  if v_link.expires_at < now() then
    return json_build_object('success', false, 'error', 'Este link expirou.');
  end if;

  update public.user_accounts
  set role      = v_link.role,
      office_id = v_link.office_id,
      is_active = false
  where id = p_user_id;

  update public.team_invite_links
  set used_at = now(),
      used_by = p_user_id
  where token = p_token;

  return json_build_object('success', true, 'role', v_link.role, 'office_id', v_link.office_id::text);
end;
$$;

grant execute on function public.redeem_invite(text, uuid) to anon, authenticated;

-- ─── RLS: admin_lawyer can read office team members ──────────────────────────
drop policy if exists "user_accounts_admin_lawyer_office_select" on public.user_accounts;
create policy "user_accounts_admin_lawyer_office_select" on public.user_accounts
  for select to authenticated
  using (
    office_id in (
      select id from public.offices where owner_id = auth.uid()
    )
  );

-- admin_lawyer can activate/deactivate office members
drop policy if exists "user_accounts_admin_lawyer_office_update" on public.user_accounts;
create policy "user_accounts_admin_lawyer_office_update" on public.user_accounts
  for update to authenticated
  using (
    office_id in (
      select id from public.offices where owner_id = auth.uid()
    )
  )
  with check (
    office_id in (
      select id from public.offices where owner_id = auth.uid()
    )
  );
