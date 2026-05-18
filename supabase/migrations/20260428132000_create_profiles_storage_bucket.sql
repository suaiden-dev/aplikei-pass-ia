begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'aplikei-profiles',
  'aplikei-profiles',
  true,
  52428800,
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  updated_at = timezone('utc', now());

drop policy if exists "aplikei_profiles_select_public" on storage.objects;
create policy "aplikei_profiles_select_public"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'aplikei-profiles');

drop policy if exists "aplikei_profiles_insert_own_or_admin" on storage.objects;
create policy "aplikei_profiles_insert_own_or_admin"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'aplikei-profiles'
    and (
      aplikei.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "aplikei_profiles_update_own_or_admin" on storage.objects;
create policy "aplikei_profiles_update_own_or_admin"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'aplikei-profiles'
    and (
      aplikei.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  )
  with check (
    bucket_id = 'aplikei-profiles'
    and (
      aplikei.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

drop policy if exists "aplikei_profiles_delete_own_or_admin" on storage.objects;
create policy "aplikei_profiles_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'aplikei-profiles'
    and (
      aplikei.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

commit;
