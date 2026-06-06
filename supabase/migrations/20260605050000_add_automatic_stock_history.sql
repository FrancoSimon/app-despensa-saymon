alter table public.stock_movimientos
add column if not exists origen text not null default 'manual';

alter table public.stock_movimientos
add column if not exists referencia_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'stock_movimientos_origen_check'
      and conrelid = 'public.stock_movimientos'::regclass
  ) then
    alter table public.stock_movimientos
    add constraint stock_movimientos_origen_check
    check (origen in ('manual', 'venta_mostrador', 'pedido_mayorista'));
  end if;
end $$;

create index if not exists stock_movimientos_origen_fecha_idx
on public.stock_movimientos(origen, created_at desc);

create index if not exists stock_movimientos_referencia_idx
on public.stock_movimientos(referencia_id);

create or replace function public.confirmar_venta_mostrador(
  p_items jsonb,
  p_descuento_porcentaje numeric default 0,
  p_recargo_porcentaje numeric default 0,
  p_forma_pago public.forma_pago_venta default 'efectivo'
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
    forma_pago,
    subtotal,
    descuento_porcentaje,
    recargo_porcentaje,
    total
  ) values (
    v_profile.id,
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

create or replace function public.confirmar_pedido_mayorista(
  p_pedido_id uuid,
  p_fecha_entrega_asignada date
)
returns table (
  pedido_id uuid,
  estado public.estado_pedido_mayorista,
  fecha_entrega_asignada date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_order public.pedidos_mayoristas%rowtype;
  v_item record;
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

  if p_fecha_entrega_asignada is null then
    raise exception 'Selecciona una fecha de entrega';
  end if;

  if extract(dow from p_fecha_entrega_asignada) <> 6 then
    raise exception 'La fecha asignada debe ser un sabado';
  end if;

  select *
  into v_order
  from public.pedidos_mayoristas
  where id = p_pedido_id
  for update;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order.estado <> 'pendiente' then
    raise exception 'El pedido ya fue procesado';
  end if;

  for v_item in
    select
      pmi.producto_id,
      pmi.producto_nombre,
      pmi.cantidad,
      p.stock
    from public.pedido_mayorista_items pmi
    join public.productos p on p.id = pmi.producto_id
    where pmi.pedido_id = p_pedido_id
    for update of p
  loop
    if v_item.stock < v_item.cantidad then
      raise exception 'Stock insuficiente para %: disponible %, requerido %',
        v_item.producto_nombre,
        v_item.stock,
        v_item.cantidad;
    end if;

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
    ) values (
      v_item.producto_id,
      v_admin_id,
      'salida'::public.tipo_movimiento_stock,
      v_item.cantidad,
      v_item.stock,
      v_item.stock - v_item.cantidad,
      'Pedido mayorista confirmado',
      'pedido_mayorista',
      p_pedido_id
    );
  end loop;

  update public.productos p
  set stock = p.stock - pmi.cantidad
  from public.pedido_mayorista_items pmi
  where p.id = pmi.producto_id
    and pmi.pedido_id = p_pedido_id;

  update public.pedidos_mayoristas pm
  set
    estado = 'confirmado',
    fecha_entrega_asignada = p_fecha_entrega_asignada,
    motivo_rechazo = null
  where pm.id = p_pedido_id
  returning pm.id, pm.estado, pm.fecha_entrega_asignada
  into pedido_id, estado, fecha_entrega_asignada;

  return next;
end;
$$;

grant execute on function public.confirmar_venta_mostrador(
  jsonb,
  numeric,
  numeric,
  public.forma_pago_venta
) to authenticated;

grant execute on function public.confirmar_pedido_mayorista(uuid, date) to authenticated;
