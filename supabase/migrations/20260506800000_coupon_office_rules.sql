-- ── 1. Link discount_coupons to office ───────────────────────────────────────

alter table public.discount_coupons
  add column if not exists office_id uuid references public.offices(id) on delete set null;

create index if not exists idx_discount_coupons_office_id on public.discount_coupons(office_id);
create index if not exists idx_discount_coupons_created_by  on public.discount_coupons(created_by);

-- ── 2. Trigger function: enforce discount_rules on seller coupon insert ───────

create or replace function public.enforce_seller_coupon_rules()
returns trigger
language plpgsql
security definer
as $$
declare
  v_role       text;
  v_office_id  uuid;
  v_rules      jsonb;

  v_max_pct       numeric;
  v_max_fixed     numeric;
  v_allow_pct     boolean;
  v_allow_fixed   boolean;
  v_max_coupons   integer;
  v_max_uses      integer;
  v_min_purchase  numeric;

  v_existing_count integer;
begin
  -- Only apply rules when created_by is set (i.e. a logged-in user is inserting)
  if new.created_by is null then
    return new;
  end if;

  -- Fetch the creator's role
  select role into v_role
  from public.user_accounts
  where id = new.created_by;

  -- Only enforce for sellers
  if v_role <> 'seller' then
    return new;
  end if;

  -- Resolve office_id from the seller's user_accounts.office_id
  select office_id into v_office_id
  from public.user_accounts
  where id = new.created_by;

  if v_office_id is null then
    raise exception 'Seller não está vinculado a nenhum escritório.';
  end if;

  -- Stamp the coupon with the office_id
  new.office_id := v_office_id;

  -- Fetch discount rules for this office
  select coalesce(discount_rules, '{}'::jsonb) into v_rules
  from public.offices
  where id = v_office_id;

  -- Parse rule values (null = unlimited / no restriction)
  v_allow_pct    := coalesce((v_rules->>'seller_allow_percentage')::boolean, true);
  v_allow_fixed  := coalesce((v_rules->>'seller_allow_fixed')::boolean, false);
  v_max_pct      := (v_rules->>'seller_max_pct')::numeric;
  v_max_fixed    := (v_rules->>'seller_max_fixed')::numeric;
  v_max_coupons  := (v_rules->>'seller_max_coupons')::integer;
  v_max_uses     := (v_rules->>'seller_max_uses')::integer;
  v_min_purchase := (v_rules->>'seller_min_purchase_usd')::numeric;

  -- ── Validations ──────────────────────────────────────────────────────────

  -- Discount type allowed?
  if new.discount_type = 'percentage' and not v_allow_pct then
    raise exception 'Desconto percentual não é permitido pelas regras do escritório.';
  end if;

  if new.discount_type = 'fixed' and not v_allow_fixed then
    raise exception 'Desconto fixo não é permitido pelas regras do escritório.';
  end if;

  -- Max percentage
  if new.discount_type = 'percentage' and v_max_pct is not null and new.discount_value > v_max_pct then
    raise exception 'Desconto de %s%% excede o limite máximo de %s%% permitido.',
      new.discount_value, v_max_pct;
  end if;

  -- Max fixed amount
  if new.discount_type = 'fixed' and v_max_fixed is not null and new.discount_value > v_max_fixed then
    raise exception 'Desconto de US$ %s excede o limite máximo de US$ %s permitido.',
      new.discount_value, v_max_fixed;
  end if;

  -- Max uses per coupon
  if v_max_uses is not null and new.max_uses is not null and new.max_uses > v_max_uses then
    raise exception 'Limite de usos %s excede o máximo de %s permitido por cupom.',
      new.max_uses, v_max_uses;
  end if;

  -- If office restricts max_uses, force it on coupons with no limit set
  if v_max_uses is not null and new.max_uses is null then
    new.max_uses := v_max_uses;
  end if;

  -- Min purchase override (take the higher of the two values)
  if v_min_purchase is not null then
    new.min_purchase_usd := greatest(coalesce(new.min_purchase_usd, 0), v_min_purchase);
  end if;

  -- Max coupons per seller
  if v_max_coupons is not null then
    select count(*) into v_existing_count
    from public.discount_coupons
    where created_by = new.created_by
      and office_id  = v_office_id;

    if v_existing_count >= v_max_coupons then
      raise exception 'Você atingiu o limite de % cupons permitidos pelo seu escritório.',
        v_max_coupons;
    end if;
  end if;

  return new;
end;
$$;

-- ── 3. Attach trigger ─────────────────────────────────────────────────────────

drop trigger if exists trg_enforce_seller_coupon_rules on public.discount_coupons;
create trigger trg_enforce_seller_coupon_rules
  before insert on public.discount_coupons
  for each row
  execute function public.enforce_seller_coupon_rules();

-- ── 4. RLS: seller can only see/create coupons for their office ───────────────

alter table public.discount_coupons enable row level security;

-- Drop old broad policies
drop policy if exists "Admin full access" on public.discount_coupons;
drop policy if exists "coupon_select_all"  on public.discount_coupons;

-- Admins and office owners see all
create policy "coupon_admin_all" on public.discount_coupons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- admin_lawyer sees coupons for their office
create policy "coupon_office_owner_select" on public.discount_coupons
  for select to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id  = discount_coupons.office_id
        and offices.owner_id = auth.uid()
    )
  );

create policy "coupon_office_owner_insert" on public.discount_coupons
  for insert to authenticated
  with check (
    exists (
      select 1 from public.offices
      where offices.id  = office_id
        and offices.owner_id = auth.uid()
    )
    or public.is_admin()
  );

-- Seller sees and creates only their own coupons (office enforced via trigger)
create policy "coupon_seller_select" on public.discount_coupons
  for select to authenticated
  using (created_by = auth.uid());

create policy "coupon_seller_insert" on public.discount_coupons
  for insert to authenticated
  with check (created_by = auth.uid());
