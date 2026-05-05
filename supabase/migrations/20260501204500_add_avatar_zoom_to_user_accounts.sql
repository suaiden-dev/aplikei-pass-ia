do $$
begin
  if to_regclass('public.users_accounts') is not null then
    execute '
      alter table public.users_accounts
        add column if not exists avatar_zoom numeric(4,2) not null default 1.00
    ';

    execute '
      alter table public.users_accounts
        drop constraint if exists users_accounts_avatar_zoom_check,
        add constraint users_accounts_avatar_zoom_check check (avatar_zoom between 0.80 and 2.50)
    ';

    execute '
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
        avatar_zoom
      from public.users_accounts
    ';

    execute '
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
              updated_at = now()
        where id = old.id;
        return new;
      end;
      $fn$
    ';
  end if;
end $$;
