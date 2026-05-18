do $$
begin
  if to_regclass('public.users_accounts') is not null then
    execute $sql$
      update public.users_accounts
      set role = 'manager'::public.user_account_role
      where lower(email) = 'admin@aplikei.com'
    $sql$;
  end if;

  if to_regclass('public.user_accounts') is not null then
    execute $sql$
      update public.user_accounts
      set role = 'manager'
      where lower(email) = 'admin@aplikei.com'
    $sql$;
  end if;
end
$$;
