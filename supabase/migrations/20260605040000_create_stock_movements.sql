do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'tipo_movimiento_stock'
      and n.nspname = 'public'
  ) then
    create type public.tipo_movimiento_stock as enum ('entrada', 'salida');
  end if;
end $$;

create table if not exists public.stock_movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.productos(id),
  admin_id uuid not null references public.profiles(id),
  tipo public.tipo_movimiento_stock not null,
  cantidad integer not null,
  stock_anterior integer not null,
  stock_nuevo integer not null,
  motivo text,
  created_at timestamptz not null default now(),
  constraint stock_movimientos_cantidad_positive check (cantidad > 0),
  constraint stock_movimientos_stock_anterior_non_negative check (stock_anterior >= 0),
  constraint stock_movimientos_stock_nuevo_non_negative check (stock_nuevo >= 0),
  constraint stock_movimientos_motivo_not_blank check (
    motivo is null or length(trim(motivo)) > 0
  )
);

create index if not exists stock_movimientos_producto_fecha_idx
on public.stock_movimientos(producto_id, created_at desc);

create index if not exists stock_movimientos_fecha_idx
on public.stock_movimientos(created_at desc);

alter table public.stock_movimientos enable row level security;

drop policy if exists "stock_movimientos_select_admin"
on public.stock_movimientos;

create policy "stock_movimientos_select_admin"
on public.stock_movimientos
for select
to authenticated
using (public.is_admin());

create or replace function public.registrar_movimiento_stock(
  p_producto_id uuid,
  p_tipo public.tipo_movimiento_stock,
  p_cantidad integer,
  p_motivo text default null
)
returns table (
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
  v_stock_nuevo integer;
  v_movimiento_id uuid;
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

  select *
  into v_producto
  from public.productos
  where id = p_producto_id
  for update;

  if v_producto.id is null then
    raise exception 'Producto no encontrado';
  end if;

  if p_tipo = 'entrada' then
    v_stock_nuevo := v_producto.stock + p_cantidad;
  elsif p_tipo = 'salida' then
    if v_producto.stock < p_cantidad then
      raise exception 'Stock insuficiente para %', v_producto.nombre;
    end if;

    v_stock_nuevo := v_producto.stock - p_cantidad;
  else
    raise exception 'Tipo de movimiento invalido';
  end if;

  update public.productos p
  set stock = v_stock_nuevo
  where p.id = p_producto_id;

  insert into public.stock_movimientos (
    producto_id,
    admin_id,
    tipo,
    cantidad,
    stock_anterior,
    stock_nuevo,
    motivo
  ) values (
    p_producto_id,
    v_admin_id,
    p_tipo,
    p_cantidad,
    v_producto.stock,
    v_stock_nuevo,
    nullif(trim(p_motivo), '')
  )
  returning stock_movimientos.id
  into v_movimiento_id;

  movimiento_id := v_movimiento_id;
  producto_id := p_producto_id;
  stock_anterior := v_producto.stock;
  stock_nuevo := v_stock_nuevo;
  return next;
end;
$$;

grant execute on function public.registrar_movimiento_stock(
  uuid,
  public.tipo_movimiento_stock,
  integer,
  text
) to authenticated;
