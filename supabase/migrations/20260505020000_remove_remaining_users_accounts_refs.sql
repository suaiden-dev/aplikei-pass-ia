create or replace function public.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_phone text;
begin
  v_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  );
  v_phone := coalesce(
    new.raw_user_meta_data ->> 'phone_number',
    new.raw_user_meta_data ->> 'phone'
  );

  insert into public.user_accounts (id, email, full_name, phone_number)
  values (new.id, new.email, v_name, v_phone)
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.user_accounts.full_name),
        phone_number = coalesce(excluded.phone_number, public.user_accounts.phone_number),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.update_user_accounts_view()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_role public.user_account_role;
begin
  next_role := case
    when new.role is null or new.role = '' then old.role::public.user_account_role
    else new.role::public.user_account_role
  end;

  update public.user_accounts
     set role = next_role,
         is_active = coalesce(new.is_active, old.is_active),
         full_name = coalesce(new.full_name, new.name, old.full_name, old.name),
         name = coalesce(new.name, new.full_name, old.name, old.full_name),
         phone_number = coalesce(new.phone_number, new.phone, old.phone_number, old.phone),
         phone = coalesce(new.phone, new.phone_number, old.phone, old.phone_number),
         avatar_url = coalesce(new.avatar_url, new.profile_url, old.avatar_url, old.profile_url),
         profile_url = coalesce(new.profile_url, new.avatar_url, old.profile_url, old.avatar_url),
         avatar_offset_x = coalesce(new.avatar_offset_x, old.avatar_offset_x),
         avatar_offset_y = coalesce(new.avatar_offset_y, old.avatar_offset_y),
         avatar_zoom = coalesce(new.avatar_zoom, old.avatar_zoom),
         passport_photo_url = coalesce(new.passport_photo_url, old.passport_photo_url),
         updated_at = now()
   where id = old.id;

  return new;
end;
$$;
