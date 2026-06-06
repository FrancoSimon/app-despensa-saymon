create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  notas text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint clientes_nombre_not_blank check (length(trim(nombre)) > 0),
  constraint clientes_telefono_not_blank check (
    telefono is null or length(trim(telefono)) > 0
  ),
  constraint clientes_email_not_blank check (
    email is null or length(trim(email)) > 0
  ),
  constraint clientes_notas_not_blank check (
    notas is null or length(trim(notas)) > 0
  )
);

create unique index if not exists clientes_email_lower_unique_idx
on public.clientes (lower(email))
where email is not null;

create index if not exists clientes_activo_nombre_idx
on public.clientes (activo, nombre);

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
before update on public.clientes
for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

drop policy if exists "clientes_select_staff" on public.clientes;
create policy "clientes_select_staff"
on public.clientes
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'vendedor')
  )
);

drop policy if exists "clientes_insert_staff" on public.clientes;
create policy "clientes_insert_staff"
on public.clientes
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'vendedor')
  )
);

drop policy if exists "clientes_update_admin" on public.clientes;
create policy "clientes_update_admin"
on public.clientes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.ventas
add column if not exists cliente_id uuid references public.clientes(id);

create index if not exists ventas_cliente_fecha_idx
on public.ventas(cliente_id, fecha desc)
where cliente_id is not null;

create or replace function public.confirmar_venta_mostrador(
  p_items jsonb,
  p_descuento_porcentaje numeric default 0,
  p_recargo_porcentaje numeric default 0,
  p_forma_pago public.forma_pago_venta default 'efectivo',
  p_cliente_id uuid default null
)
returns table (
  venta_id uuid,
  subtotal numeric,
  descuento_monto numeric,
  recargo_monto numeric,
  total numeric,
  fecha timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_caja_id uuid;
  v_cliente_id uuid;
  v_item jsonb;
  v_producto public.productos%rowtype;
  v_cantidad integer;
  v_subtotal numeric(12,2) := 0;
  v_descuento_monto numeric(12,2) := 0;
  v_recargo_monto numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_venta_id uuid;
  v_fecha timestamptz;
  v_stock_item record;
begin
  select *
  into v_profile
  from public.profiles
  where auth_user_id = (select auth.uid())
    and activo = true
    and rol in ('admin', 'vendedor')
  limit 1;

  if v_profile.id is null then
    raise exception 'No autorizado';
  end if;

  select c.id
  into v_caja_id
  from public.cajas c
  where c.perfil_id = v_profile.id
    and c.estado = 'abierta'
  order by c.abierta_at desc
  limit 1;

  if v_caja_id is null then
    raise exception 'Abri una caja antes de confirmar ventas';
  end if;

  if p_cliente_id is not null then
    select cl.id
    into v_cliente_id
    from public.clientes cl
    where cl.id = p_cliente_id
      and cl.activo = true
    limit 1;

    if v_cliente_id is null then
      raise exception 'Cliente no disponible';
    end if;
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La venta requiere al menos un producto';
  end if;

  if p_descuento_porcentaje < 0 or p_descuento_porcentaje > 100 then
    raise exception 'Descuento invalido';
  end if;

  if p_recargo_porcentaje < 0 or p_recargo_porcentaje > 100 then
    raise exception 'Recargo invalido';
  end if;

  create temporary table tmp_venta_items (
    producto_id uuid primary key,
    producto_nombre text not null,
    cantidad integer not null,
    precio_unitario numeric(12,2) not null,
    subtotal numeric(12,2) not null
  ) on commit drop;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_cantidad := (v_item->>'cantidad')::integer;

    if v_cantidad is null or v_cantidad <= 0 then
      raise exception 'Cantidad invalida';
    end if;

    select *
    into v_producto
    from public.productos
    where id = (v_item->>'productoId')::uuid
      and activo = true
    for update;

    if v_producto.id is null then
      raise exception 'Producto no disponible';
    end if;

    insert into tmp_venta_items (
      producto_id,
      producto_nombre,
      cantidad,
      precio_unitario,
      subtotal
    ) values (
      v_producto.id,
      v_producto.nombre,
      v_cantidad,
      v_producto.precio_mostrador,
      round(v_producto.precio_mostrador * v_cantidad, 2)
    )
    on conflict (producto_id) do update
    set
      cantidad = tmp_venta_items.cantidad + excluded.cantidad,
      subtotal = round(tmp_venta_items.precio_unitario * (tmp_venta_items.cantidad + excluded.cantidad), 2);
  end loop;

  for v_stock_item in
    select
      t.producto_nombre,
      t.cantidad,
      p.stock
    from tmp_venta_items t
    join public.productos p on p.id = t.producto_id
    for update of p
  loop
    if v_stock_item.stock < v_stock_item.cantidad then
      raise exception 'Stock insuficiente para %', v_stock_item.producto_nombre;
    end if;
  end loop;

  select coalesce(sum(t.subtotal), 0)
  into v_subtotal
  from tmp_venta_items t;

  v_descuento_monto := round(v_subtotal * p_descuento_porcentaje / 100, 2);
  v_recargo_monto := round((v_subtotal - v_descuento_monto) * p_recargo_porcentaje / 100, 2);
  v_total := round(v_subtotal - v_descuento_monto + v_recargo_monto, 2);

  insert into public.ventas (
    vendedor_id,
    caja_id,
    cliente_id,
    forma_pago,
    subtotal,
    descuento_porcentaje,
    recargo_porcentaje,
    total
  ) values (
    v_profile.id,
    v_caja_id,
    v_cliente_id,
    p_forma_pago,
    v_subtotal,
    p_descuento_porcentaje,
    p_recargo_porcentaje,
    v_total
  )
  returning ventas.id, ventas.fecha into v_venta_id, v_fecha;

  insert into public.venta_items (
    venta_id,
    producto_id,
    producto_nombre,
    cantidad,
    precio_unitario,
    subtotal
  )
  select
    v_venta_id,
    t.producto_id,
    t.producto_nombre,
    t.cantidad,
    t.precio_unitario,
    t.subtotal
  from tmp_venta_items t;

  insert into public.stock_movimientos (
    producto_id,
    admin_id,
    tipo,
    cantidad,
    stock_anterior,
    stock_nuevo,
    motivo,
    origen,
    referencia_id
  )
  select
    t.producto_id,
    v_profile.id,
    'salida'::public.tipo_movimiento_stock,
    t.cantidad,
    p.stock,
    p.stock - t.cantidad,
    'Venta mostrador',
    'venta_mostrador',
    v_venta_id
  from tmp_venta_items t
  join public.productos p on p.id = t.producto_id;

  update public.productos p
  set stock = p.stock - t.cantidad
  from tmp_venta_items t
  where p.id = t.producto_id;

  venta_id := v_venta_id;
  subtotal := v_subtotal;
  descuento_monto := v_descuento_monto;
  recargo_monto := v_recargo_monto;
  total := v_total;
  fecha := v_fecha;
  return next;
end;
$$;

grant execute on function public.confirmar_venta_mostrador(
  jsonb,
  numeric,
  numeric,
  public.forma_pago_venta,
  uuid
) to authenticated;
