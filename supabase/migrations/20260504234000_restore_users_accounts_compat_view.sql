begin;

do $$
declare
  col_name text;
  col_profile text;
  col_phone text;
begin
  -- If the old relation name is missing, create a compatibility view so
  -- legacy policies/functions still work while the codebase is normalized.
  if to_regclass('public.users_accounts') is null then
    select
      case
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'full_name'
        ) then 'full_name'
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'name'
        ) then 'name'
        else null
      end
      into col_name;

    select
      case
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'avatar_url'
        ) then 'avatar_url'
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'profile_url'
        ) then 'profile_url'
        else null
      end
      into col_profile;

    select
      case
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'phone_number'
        ) then 'phone_number'
        when exists (
          select 1 from information_schema.columns
          where table_schema = 'public' and table_name = 'user_accounts' and column_name = 'phone'
        ) then 'phone'
        else null
      end
      into col_phone;

    execute format($v$
      create view public.users_accounts as
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
      from public.user_accounts
    $v$,
      coalesce(col_name, 'null::text'),
      coalesce(col_profile, 'null::text'),
      coalesce(col_phone, 'null::text')
    );
  end if;
end $$;

commit;
