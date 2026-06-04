create type public.app_role as enum ('admin', 'vendedor', 'mayorista');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  nombre text not null,
  email text not null unique,
  rol public.app_role not null,
  localidad text,
  telefono text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_mayorista_localidad_required
    check (rol <> 'mayorista' or localidad is not null)
);

create index profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index profiles_rol_idx on public.profiles(rol);
create index profiles_activo_idx on public.profiles(activo);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and rol = 'admin'
      and activo = true
  );
$$;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  auth_user_id = auth.uid()
  or public.is_admin()
);

create policy "profiles_insert_admin"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_delete_admin"
on public.profiles
for delete
to authenticated
using (public.is_admin());

