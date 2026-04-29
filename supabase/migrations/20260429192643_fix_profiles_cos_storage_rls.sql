begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'profiles',
  'profiles',
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

drop policy if exists "profiles_cos_select_public" on storage.objects;
create policy "profiles_cos_select_public"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'profiles'
    and (storage.foldername(name))[2] = 'cos'
  );

drop policy if exists "profiles_cos_insert_own_folder" on storage.objects;
create policy "profiles_cos_insert_own_folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (storage.foldername(name))[2] = 'cos'
  );

drop policy if exists "profiles_cos_update_own_folder" on storage.objects;
create policy "profiles_cos_update_own_folder"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (storage.foldername(name))[2] = 'cos'
  )
  with check (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (storage.foldername(name))[2] = 'cos'
  );

drop policy if exists "profiles_cos_delete_own_folder" on storage.objects;
create policy "profiles_cos_delete_own_folder"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profiles'
    and (storage.foldername(name))[1] = auth.uid()::text
    and (storage.foldername(name))[2] = 'cos'
  );

commit;
