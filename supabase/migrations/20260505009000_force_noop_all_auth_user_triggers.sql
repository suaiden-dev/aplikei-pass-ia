begin;

do $$
declare
  rec record;
  fn_schema text;
  fn_name text;
  fn_args text;
begin
  for rec in
    select distinct
      pn.nspname as fn_schema,
      p.proname as fn_name,
      pg_get_function_identity_arguments(p.oid) as fn_args
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    join pg_proc p on p.oid = t.tgfoid
    join pg_namespace pn on pn.oid = p.pronamespace
    where n.nspname = 'auth'
      and c.relname = 'users'
      and not t.tgisinternal
      and pn.nspname in ('public', 'aplikei')
  loop
    fn_schema := rec.fn_schema;
    fn_name := rec.fn_name;
    fn_args := rec.fn_args;

    execute format(
      'create or replace function %I.%I(%s)
       returns trigger
       language plpgsql
       security definer
       as $body$
       begin
         return new;
       end;
       $body$;',
      fn_schema,
      fn_name,
      fn_args
    );
  end loop;
end $$;

commit;
