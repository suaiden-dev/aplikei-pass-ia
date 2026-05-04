-- Allow admins to read and manage cases from user_services, including embedded profile data.

alter table public.user_services enable row level security;
alter table public.profiles enable row level security;

-- user_services: replace email-whitelist admin access with role-based access.
drop policy if exists "Admins can view all user services" on public.user_services;
drop policy if exists "Admins can update all user services" on public.user_services;
create policy "Admins can view all user services"
on public.user_services
for select
using (public.is_admin() or auth.uid() = user_id);

create policy "Admins can update all user services"
on public.user_services
for update
using (public.is_admin() or auth.uid() = user_id)
with check (public.is_admin() or auth.uid() = user_id);

-- Keep customer access intact, but make sure inserts remain possible for their own rows.
drop policy if exists "users can read own services" on public.user_services;
drop policy if exists "Usuários podem ver seus próprios serviços" on public.user_services;
create policy "users can read own services"
on public.user_services
for select
using (auth.uid() = user_id or public.is_admin());

create policy "Usuários podem ver seus próprios serviços"
on public.user_services
for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "users can insert own services" on public.user_services;
drop policy if exists "Usuários podem criar seus próprios serviços" on public.user_services;
drop policy if exists "Usuários podem inserir seus próprios serviços" on public.user_services;
create policy "users can insert own services"
on public.user_services
for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Usuários podem criar seus próprios serviços"
on public.user_services
for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Usuários podem inserir seus próprios serviços"
on public.user_services
for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Usuários podem atualizar seus próprios serviços" on public.user_services;
create policy "Usuários podem atualizar seus próprios serviços"
on public.user_services
for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

-- profiles: admin needs to read embedded profile rows in the cases query.
drop policy if exists "Usuários podem ver o próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar o próprio perfil" on public.profiles;
create policy "Usuários podem ver o próprio perfil"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "Usuários podem atualizar o próprio perfil"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());
