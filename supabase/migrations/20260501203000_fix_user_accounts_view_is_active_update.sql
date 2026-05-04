-- Persist is_active changes coming from the user_accounts view.

create or replace function public.update_user_accounts_view()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  next_role public.user_account_role;
begin
  next_role := case
    when new.role is null or new.role = '' then old.role::public.user_account_role
    else new.role::public.user_account_role
  end;

  update public.users_accounts
     set role = next_role,
         is_active = coalesce(new.is_active, old.is_active),
         name = new.full_name,
         phone = new.phone_number,
         profile_url = new.avatar_url,
         passport_photo_url = new.passport_photo_url,
         updated_at = now()
   where id = old.id;
  return new;
end;
$function$;
