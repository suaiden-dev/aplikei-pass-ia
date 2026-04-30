begin;

-- ─── Schema dedicado da aplicação Aplikei ────────────────────────────────────
-- Isola todas as tabelas, funções, triggers e policies em um schema próprio
-- para coexistir com qualquer estrutura legada já presente em `public`.

create schema if not exists aplikei;

grant usage on schema aplikei to anon, authenticated, service_role;

alter default privileges in schema aplikei
  grant select, insert, update, delete on tables to authenticated, service_role;

alter default privileges in schema aplikei
  grant select on tables to anon;

alter default privileges in schema aplikei
  grant usage, select on sequences to authenticated, service_role;

alter default privileges in schema aplikei
  grant execute on functions to anon, authenticated, service_role;

commit;
