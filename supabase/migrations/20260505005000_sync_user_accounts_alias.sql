begin;

drop trigger if exists trg_users_accounts_alias_iud on public.users_accounts;
drop function if exists public.users_accounts_alias_iud();
drop view if exists public.users_accounts;

do $$
declare
  col_name text;
  col_profile text;
  col_phone text;
begin
  select case
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='full_name') then 'full_name'
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='name') then 'name'
    else null end into col_name;

  select case
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='avatar_url') then 'avatar_url'
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='profile_url') then 'profile_url'
    else null end into col_profile;

  select case
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='phone_number') then 'phone_number'
    when exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='phone') then 'phone'
    else null end into col_phone;

  execute format(
    'create view public.users_accounts as
     select
       id,
       email,
       %s as name,
       %s as profile_url,
       %s as phone,
       passport_photo_url,
       role,
       is_active,
       avatar_offset_x,
       avatar_offset_y,
       avatar_zoom,
       created_at,
       updated_at
     from public.user_accounts',
    coalesce(col_name, 'null::text'),
    coalesce(col_profile, 'null::text'),
    coalesce(col_phone, 'null::text')
  );
end $$;

create or replace function public.users_accounts_alias_iud()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_full_name boolean;
  has_name boolean;
  has_avatar_url boolean;
  has_profile_url boolean;
  has_phone_number boolean;
  has_phone boolean;
begin
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='full_name') into has_full_name;
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='name') into has_name;
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='avatar_url') into has_avatar_url;
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='profile_url') into has_profile_url;
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='phone_number') into has_phone_number;
  select exists (select 1 from information_schema.columns where table_schema='public' and table_name='user_accounts' and column_name='phone') into has_phone;

  if tg_op = 'INSERT' then
    if has_full_name and has_avatar_url and has_phone_number then
      execute '
        insert into public.user_accounts
        (id,email,full_name,avatar_url,phone_number,passport_photo_url,role,is_active,avatar_offset_x,avatar_offset_y,avatar_zoom,created_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,coalesce($12,now()),coalesce($13,now()))
        on conflict (id) do update
          set email=excluded.email, full_name=excluded.full_name, avatar_url=excluded.avatar_url,
              phone_number=excluded.phone_number, passport_photo_url=excluded.passport_photo_url,
              role=excluded.role, is_active=excluded.is_active, avatar_offset_x=excluded.avatar_offset_x,
              avatar_offset_y=excluded.avatar_offset_y, avatar_zoom=excluded.avatar_zoom, updated_at=now()
      ' using new.id,new.email,new.name,new.profile_url,new.phone,new.passport_photo_url,new.role,new.is_active,new.avatar_offset_x,new.avatar_offset_y,new.avatar_zoom,new.created_at,new.updated_at;
    else
      execute '
        insert into public.user_accounts
        (id,email,name,profile_url,phone,passport_photo_url,role,is_active,avatar_offset_x,avatar_offset_y,avatar_zoom,created_at,updated_at)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,coalesce($12,now()),coalesce($13,now()))
        on conflict (id) do update
          set email=excluded.email, name=excluded.name, profile_url=excluded.profile_url,
              phone=excluded.phone, passport_photo_url=excluded.passport_photo_url,
              role=excluded.role, is_active=excluded.is_active, avatar_offset_x=excluded.avatar_offset_x,
              avatar_offset_y=excluded.avatar_offset_y, avatar_zoom=excluded.avatar_zoom, updated_at=now()
      ' using new.id,new.email,new.name,new.profile_url,new.phone,new.passport_photo_url,new.role,new.is_active,new.avatar_offset_x,new.avatar_offset_y,new.avatar_zoom,new.created_at,new.updated_at;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if has_full_name and has_avatar_url and has_phone_number then
      execute '
        update public.user_accounts
           set email=$1, full_name=$2, avatar_url=$3, phone_number=$4,
               passport_photo_url=$5, role=$6, is_active=$7, avatar_offset_x=$8,
               avatar_offset_y=$9, avatar_zoom=$10, updated_at=now()
         where id=$11
      ' using new.email,new.name,new.profile_url,new.phone,new.passport_photo_url,new.role,new.is_active,new.avatar_offset_x,new.avatar_offset_y,new.avatar_zoom,old.id;
    else
      execute '
        update public.user_accounts
           set email=$1, name=$2, profile_url=$3, phone=$4,
               passport_photo_url=$5, role=$6, is_active=$7, avatar_offset_x=$8,
               avatar_offset_y=$9, avatar_zoom=$10, updated_at=now()
         where id=$11
      ' using new.email,new.name,new.profile_url,new.phone,new.passport_photo_url,new.role,new.is_active,new.avatar_offset_x,new.avatar_offset_y,new.avatar_zoom,old.id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    delete from public.user_accounts where id = old.id;
    return old;
  end if;

  return null;
end;
$$;

create trigger trg_users_accounts_alias_iud
instead of insert or update or delete
on public.users_accounts
for each row
execute function public.users_accounts_alias_iud();

grant select, insert, update, delete on public.users_accounts to anon, authenticated, service_role;

commit;
