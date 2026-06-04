create table public.productos (
  id uuid primary key default gen_random_uuid(),
  codigo_barras text,
  nombre text not null,
  categoria text not null default 'General',
  precio_mostrador numeric(12,2) not null,
  precio_mayorista_fijo numeric(12,2) not null,
  precio_mayorista_especial numeric(12,2),
  cantidad_especial integer not null default 0,
  stock integer not null default 0,
  stock_minimo integer not null default 5,
  habilitado_mayorista boolean not null default false,
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint productos_nombre_not_blank check (length(trim(nombre)) > 0),
  constraint productos_categoria_not_blank check (length(trim(categoria)) > 0),
  constraint productos_precio_mostrador_non_negative check (precio_mostrador >= 0),
  constraint productos_precio_mayorista_fijo_non_negative check (precio_mayorista_fijo >= 0),
  constraint productos_precio_mayorista_especial_non_negative check (
    precio_mayorista_especial is null or precio_mayorista_especial >= 0
  ),
  constraint productos_cantidad_especial_non_negative check (cantidad_especial >= 0),
  constraint productos_stock_non_negative check (stock >= 0),
  constraint productos_stock_minimo_non_negative check (stock_minimo >= 0),
  constraint productos_precio_especial_requires_quantity check (
    precio_mayorista_especial is null or cantidad_especial > 0
  )
);

create unique index productos_codigo_barras_unique_idx
on public.productos (codigo_barras)
where codigo_barras is not null;

create index productos_activo_nombre_idx
on public.productos (activo, nombre);

create index productos_categoria_idx
on public.productos (categoria);

create index productos_habilitado_mayorista_idx
on public.productos (habilitado_mayorista)
where activo = true;

create index productos_stock_bajo_idx
on public.productos (stock, stock_minimo)
where activo = true;

create trigger productos_set_updated_at
before update on public.productos
for each row
execute function public.set_updated_at();

alter table public.productos enable row level security;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.rol
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
    and p.activo = true
  limit 1;
$$;

create policy "productos_select_role"
on public.productos
for select
to authenticated
using (
  public.is_admin()
  or (
    activo = true
    and (select public.current_app_role()) = 'vendedor'
  )
  or (
    activo = true
    and habilitado_mayorista = true
    and (select public.current_app_role()) = 'mayorista'
  )
);

create policy "productos_insert_admin"
on public.productos
for insert
to authenticated
with check (public.is_admin());

create policy "productos_update_admin"
on public.productos
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "productos_delete_admin"
on public.productos
for delete
to authenticated
using (public.is_admin());

