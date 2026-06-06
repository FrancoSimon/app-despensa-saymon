alter table public.productos
add column if not exists costo_compra numeric(12,2) not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'productos_costo_compra_non_negative'
      and conrelid = 'public.productos'::regclass
  ) then
    alter table public.productos
    add constraint productos_costo_compra_non_negative
    check (costo_compra >= 0)
    not valid;

    alter table public.productos
    validate constraint productos_costo_compra_non_negative;
  end if;
end $$;

create table if not exists public.proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint proveedores_nombre_not_blank check (length(trim(nombre)) > 0),
  constraint proveedores_telefono_not_blank check (
    telefono is null or length(trim(telefono)) > 0
  ),
  constraint proveedores_notas_not_blank check (
    notas is null or length(trim(notas)) > 0
  )
);

create unique index if not exists proveedores_nombre_lower_unique_idx
on public.proveedores (lower(nombre));

create index if not exists proveedores_activo_nombre_idx
on public.proveedores (activo, nombre);

drop trigger if exists proveedores_set_updated_at on public.proveedores;
create trigger proveedores_set_updated_at
before update on public.proveedores
for each row execute function public.set_updated_at();

create table if not exists public.stock_compras (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id),
  proveedor_id uuid not null references public.proveedores(id),
  admin_id uuid not null references public.profiles(id),
  stock_movimiento_id uuid references public.stock_movimientos(id),
  cantidad integer not null,
  costo_unitario numeric(12,2) not null,
  costo_total numeric(12,2) generated always as (round(cantidad * costo_unitario, 2)) stored,
  fecha_compra date not null default current_date,
  comprobante text,
  notas text,
  created_at timestamptz not null default now(),
  constraint stock_compras_cantidad_positive check (cantidad > 0),
  constraint stock_compras_costo_unitario_non_negative check (costo_unitario >= 0),
  constraint stock_compras_comprobante_not_blank check (
    comprobante is null or length(trim(comprobante)) > 0
  ),
  constraint stock_compras_notas_not_blank check (
    notas is null or length(trim(notas)) > 0
  )
);

create index if not exists stock_compras_fecha_idx
on public.stock_compras(fecha_compra desc, created_at desc);

create index if not exists stock_compras_producto_fecha_idx
on public.stock_compras(producto_id, fecha_compra desc);

create index if not exists stock_compras_proveedor_fecha_idx
on public.stock_compras(proveedor_id, fecha_compra desc);

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'stock_movimientos_origen_check'
      and conrelid = 'public.stock_movimientos'::regclass
  ) then
    alter table public.stock_movimientos
    drop constraint stock_movimientos_origen_check;
  end if;

  alter table public.stock_movimientos
  add constraint stock_movimientos_origen_check
  check (origen in ('manual', 'venta_mostrador', 'pedido_mayorista', 'compra'));
end $$;

alter table public.proveedores enable row level security;
alter table public.stock_compras enable row level security;

drop policy if exists "proveedores_select_admin" on public.proveedores;
create policy "proveedores_select_admin"
on public.proveedores
for select
to authenticated
using (public.is_admin());

drop policy if exists "stock_compras_select_admin" on public.stock_compras;
create policy "stock_compras_select_admin"
on public.stock_compras
for select
to authenticated
using (public.is_admin());

create or replace function public.registrar_compra_stock(
  p_producto_id uuid,
  p_proveedor_id uuid default null,
  p_proveedor_nombre text default null,
  p_cantidad integer default 0,
  p_costo_unitario numeric default 0,
  p_fecha_compra date default current_date,
  p_comprobante text default null,
  p_notas text default null
)
returns table (
  compra_id uuid,
  proveedor_id uuid,
  movimiento_id uuid,
  producto_id uuid,
  stock_anterior integer,
  stock_nuevo integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_producto public.productos%rowtype;
  v_proveedor_id uuid;
  v_proveedor_nombre text;
  v_stock_nuevo integer;
  v_movimiento_id uuid;
  v_compra_id uuid;
begin
  select p.id
  into v_admin_id
  from public.profiles p
  where p.auth_user_id = (select auth.uid())
    and p.rol = 'admin'
    and p.activo = true
  limit 1;

  if v_admin_id is null then
    raise exception 'No autorizado';
  end if;

  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'Cantidad invalida';
  end if;

  if p_costo_unitario is null or p_costo_unitario < 0 then
    raise exception 'Costo unitario invalido';
  end if;

  if p_fecha_compra is null then
    raise exception 'Fecha de compra invalida';
  end if;

  select *
  into v_producto
  from public.productos
  where id = p_producto_id
  for update;

  if v_producto.id is null then
    raise exception 'Producto no encontrado';
  end if;

  if p_proveedor_id is not null then
    select pr.id
    into v_proveedor_id
    from public.proveedores pr
    where pr.id = p_proveedor_id
      and pr.activo = true
    for update;

    if v_proveedor_id is null then
      raise exception 'Proveedor no encontrado';
    end if;
  else
    v_proveedor_nombre := nullif(trim(p_proveedor_nombre), '');

    if v_proveedor_nombre is null then
      raise exception 'Selecciona o crea un proveedor';
    end if;

    insert into public.proveedores (nombre)
    values (v_proveedor_nombre)
    on conflict (lower(nombre)) do update
    set
      activo = true,
      updated_at = now()
    returning proveedores.id into v_proveedor_id;
  end if;

  v_stock_nuevo := v_producto.stock + p_cantidad;

  insert into public.stock_movimientos (
    producto_id,
    admin_id,
    tipo,
    cantidad,
    stock_anterior,
    stock_nuevo,
    motivo,
    origen
  ) values (
    p_producto_id,
    v_admin_id,
    'entrada'::public.tipo_movimiento_stock,
    p_cantidad,
    v_producto.stock,
    v_stock_nuevo,
    concat('Compra proveedor - ', coalesce(nullif(trim(p_comprobante), ''), 'sin comprobante')),
    'compra'
  )
  returning stock_movimientos.id into v_movimiento_id;

  insert into public.stock_compras (
    producto_id,
    proveedor_id,
    admin_id,
    stock_movimiento_id,
    cantidad,
    costo_unitario,
    fecha_compra,
    comprobante,
    notas
  ) values (
    p_producto_id,
    v_proveedor_id,
    v_admin_id,
    v_movimiento_id,
    p_cantidad,
    round(p_costo_unitario, 2),
    p_fecha_compra,
    nullif(trim(p_comprobante), ''),
    nullif(trim(p_notas), '')
  )
  returning stock_compras.id into v_compra_id;

  update public.stock_movimientos
  set referencia_id = v_compra_id
  where id = v_movimiento_id;

  update public.productos p
  set
    stock = v_stock_nuevo,
    costo_compra = round(p_costo_unitario, 2)
  where p.id = p_producto_id;

  compra_id := v_compra_id;
  proveedor_id := v_proveedor_id;
  movimiento_id := v_movimiento_id;
  producto_id := p_producto_id;
  stock_anterior := v_producto.stock;
  stock_nuevo := v_stock_nuevo;
  return next;
end;
$$;

grant execute on function public.registrar_compra_stock(
  uuid,
  uuid,
  text,
  integer,
  numeric,
  date,
  text,
  text
) to authenticated;
