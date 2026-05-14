-- Migration: Add has_completed_onboarding to user_accounts
-- Created At: 2026-05-13 19:25:00

-- Migration: Add has_completed_onboarding to user_accounts
-- Created At: 2026-05-13 19:25:00

DO $$
DECLARE
  v_user_accounts_kind "char";
  v_users_accounts_kind "char";
BEGIN
  -- Check user_accounts type
  SELECT c.relkind INTO v_user_accounts_kind
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'user_accounts' LIMIT 1;

  -- Check users_accounts type
  SELECT c.relkind INTO v_users_accounts_kind
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'users_accounts' LIMIT 1;

  -- 1. If users_accounts is a table, add the column there
  IF v_users_accounts_kind = 'r' THEN
    EXECUTE 'alter table public.users_accounts add column if not exists has_completed_onboarding boolean not null default false';
  END IF;

  -- 2. If user_accounts is a table, add the column there
  IF v_user_accounts_kind = 'r' THEN
    EXECUTE 'alter table public.user_accounts add column if not exists has_completed_onboarding boolean not null default false';
  END IF;

  -- 3. If user_accounts is a view backed by users_accounts, recreate the view
  IF v_user_accounts_kind = 'v' AND v_users_accounts_kind = 'r' THEN
    EXECUTE '
      create or replace view public.user_accounts as
      select
        id,
        role::text as role,
        email,
        name as full_name,
        phone as phone_number,
        profile_url as avatar_url,
        passport_photo_url,
        null::text as preferred_language,
        is_active,
        terms_accepted_at,
        last_sign_in_at,
        created_at,
        updated_at,
        avatar_offset_x,
        avatar_offset_y,
        avatar_zoom,
        office_id,
        has_completed_onboarding
      from public.users_accounts
    ';

    -- Also update the instead-of trigger function if it exists
    EXECUTE '
      create or replace function public.update_user_accounts_view()
      returns trigger
      language plpgsql
      security definer
      set search_path to ''public''
      as $fn$
      declare
        next_role public.user_account_role;
      begin
        next_role := case
          when new.role is null or new.role = '''' then old.role::public.user_account_role
          else new.role::public.user_account_role
        end;

        update public.users_accounts
          set role = next_role,
              is_active = coalesce(new.is_active, old.is_active),
              name = new.full_name,
              phone = new.phone_number,
              profile_url = new.avatar_url,
              avatar_offset_x = coalesce(new.avatar_offset_x, old.avatar_offset_x),
              avatar_offset_y = coalesce(new.avatar_offset_y, old.avatar_offset_y),
              avatar_zoom = coalesce(new.avatar_zoom, old.avatar_zoom),
              passport_photo_url = new.passport_photo_url,
              office_id = coalesce(new.office_id, old.office_id),
              has_completed_onboarding = coalesce(new.has_completed_onboarding, old.has_completed_onboarding),
              updated_at = now()
        where id = old.id;
        return new;
      end;
      $fn$
    ';
  END IF;
END $$;
