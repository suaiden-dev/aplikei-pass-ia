-- Preserve manual activation state when auth.users is updated on login.

create or replace function public.sync_auth_user_to_users_accounts()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.users_accounts
  set
    email = new.email,
    name = coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      public.users_accounts.name
    ),
    profile_url = coalesce(
      nullif(new.raw_user_meta_data ->> 'profile_url', ''),
      nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
      public.users_accounts.profile_url
    ),
    phone = coalesce(
      nullif(new.raw_user_meta_data ->> 'phone', ''),
      nullif(new.raw_user_meta_data ->> 'phone_number', ''),
      public.users_accounts.phone
    ),
    last_sign_in_at = new.last_sign_in_at
  where id = new.id;

  return new;
end;
$function$;
