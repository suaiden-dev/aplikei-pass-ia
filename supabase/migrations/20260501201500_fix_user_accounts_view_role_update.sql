-- Ensure role changes through the user_accounts view are persisted.

create or replace function public.update_user_accounts_view()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  update public.users_accounts
     set role = coalesce(nullif(new.role, '')::public.user_account_role, old.role),
         name = new.full_name,
         phone = new.phone_number,
         profile_url = new.avatar_url,
         passport_photo_url = new.passport_photo_url,
         updated_at = now()
   where id = old.id;
  return new;
end;
$function$;
