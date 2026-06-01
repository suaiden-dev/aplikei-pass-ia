-- ── RLS: Allow sellers and office owners to update coupons ──

drop policy if exists "coupon_office_owner_update" on public.discount_coupons;
create policy "coupon_office_owner_update" on public.discount_coupons
  for update to authenticated
  using (
    exists (
      select 1 from public.offices
      where offices.id = discount_coupons.office_id
        and offices.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.offices
      where offices.id = office_id
        and offices.owner_id = auth.uid()
    )
  );

drop policy if exists "coupon_seller_update" on public.discount_coupons;
create policy "coupon_seller_update" on public.discount_coupons
  for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
