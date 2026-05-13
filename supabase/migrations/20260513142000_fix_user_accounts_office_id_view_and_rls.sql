-- Fix user_accounts office_id visibility and self-read RLS
-- Context:
-- Older migrations recreated public.user_accounts as a view over public.users_accounts
-- without exposing office_id. This makes authService map officeId as null.

DO $$
DECLARE
  v_user_accounts_kind "char";
  v_users_accounts_kind "char";
  v_users_accounts_has_office_id boolean := false;
BEGIN
  SELECT c.relkind
    INTO v_user_accounts_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'user_accounts'
  LIMIT 1;

  SELECT c.relkind
    INTO v_users_accounts_kind
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'users_accounts'
  LIMIT 1;

  IF v_users_accounts_kind = 'r' THEN
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users_accounts'
        AND column_name = 'office_id'
    )
    INTO v_users_accounts_has_office_id;
  END IF;

  -- If user_accounts is a VIEW backed by users_accounts, ensure office_id is projected.
  IF v_user_accounts_kind = 'v' AND v_users_accounts_kind = 'r' THEN
    IF v_users_accounts_has_office_id THEN
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
          office_id
        from public.users_accounts
      ';
    ELSE
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
          null::uuid as office_id
        from public.users_accounts
      ';
    END IF;

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
              updated_at = now()
        where id = old.id;
        return new;
      end;
      $fn$
    ';
  END IF;

  -- If user_accounts is a TABLE, ensure office_id exists there too.
  IF v_user_accounts_kind = 'r' THEN
    EXECUTE 'alter table public.user_accounts add column if not exists office_id uuid references public.offices(id) on delete set null';
    EXECUTE 'create index if not exists idx_user_accounts_office_id on public.user_accounts(office_id)';
  END IF;

  -- RLS hardening (table-only).
  IF v_user_accounts_kind = 'r' THEN
    EXECUTE 'alter table public.user_accounts enable row level security';
    EXECUTE 'drop policy if exists "user_accounts_select_own" on public.user_accounts';
    EXECUTE 'create policy "user_accounts_select_own" on public.user_accounts for select to authenticated using (id = auth.uid())';
  END IF;

  IF v_users_accounts_kind = 'r' THEN
    EXECUTE 'alter table public.users_accounts enable row level security';
    EXECUTE 'drop policy if exists "users_accounts_select_own" on public.users_accounts';
    EXECUTE 'create policy "users_accounts_select_own" on public.users_accounts for select to authenticated using (id = auth.uid())';
  END IF;
END $$;
