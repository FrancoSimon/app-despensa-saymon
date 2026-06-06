alter type public.forma_pago_venta add value if not exists 'cuenta_corriente';

create table if not exists public.cliente_cuenta_movimientos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id),
  perfil_id uuid not null references public.profiles(id),
  venta_id uuid references public.ventas(id),
  tipo text not null,
  forma_pago public.forma_pago_venta,
  monto numeric(12,2) not null,
  nota text,
  created_at timestamptz not null default now(),
  constraint cliente_cuenta_movimientos_tipo_check check (tipo in ('venta', 'pago')),
  constraint cliente_cuenta_movimientos_monto_positive check (monto > 0),
  constraint cliente_cuenta_movimientos_pago_method_check check (
    (tipo = 'venta' and forma_pago is null) or
    (tipo = 'pago' and forma_pago is not null and forma_pago::text <> 'cuenta_corriente')
  ),
  constraint cliente_cuenta_movimientos_venta_ref_check check (
    (tipo = 'venta' and venta_id is not null) or tipo = 'pago'
  ),
  constraint cliente_cuenta_movimientos_nota_not_blank check (
    nota is null or length(trim(nota)) > 0
  )
);

create index if not exists cliente_cuenta_movimientos_cliente_fecha_idx
on public.cliente_cuenta_movimientos(cliente_id, created_at desc);

create index if not exists cliente_cuenta_movimientos_venta_idx
on public.cliente_cuenta_movimientos(venta_id)
where venta_id is not null;

alter table public.cliente_cuenta_movimientos enable row level security;

drop policy if exists "cliente_cuenta_movimientos_select_admin" on public.cliente_cuenta_movimientos;
create policy "cliente_cuenta_movimientos_select_admin"
on public.cliente_cuenta_movimientos
for select
to authenticated
using (public.is_admin());

create or replace function public.registrar_pago_cuenta_corriente(
  p_cliente_id uuid,
  p_monto numeric,
  p_forma_pago public.forma_pago_venta,
  p_nota text default null
)
returns table (
  pago_id uuid,
  cliente_id uuid,
  monto numeric,
  saldo numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid;
  v_cliente_id uuid;
  v_saldo_actual numeric(12,2);
  v_pago_id uuid;
  v_created_at timestamptz;
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

  if p_monto is null or p_monto <= 0 then
    raise exception 'Monto invalido';
  end if;

  if p_forma_pago is null or p_forma_pago::text = 'cuenta_corriente' then
    raise exception 'Forma de pago invalida';
  end if;

  select c.id
  into v_cliente_id
  from public.clientes c
  where c.id = p_cliente_id
    and c.activo = true
  limit 1;

  if v_cliente_id is null then
    raise exception 'Cliente no encontrado';
  end if;

  select coalesce(sum(
    case
      when m.tipo = 'venta' then m.monto
      when m.tipo = 'pago' then -m.monto
      else 0
    end
  ), 0)
  into v_saldo_actual
  from public.cliente_cuenta_movimientos m
  where m.cliente_id = p_cliente_id;

  if v_saldo_actual <= 0 then
    raise exception 'El cliente no tiene deuda pendiente';
  end if;

  if p_monto > v_saldo_actual then
    raise exception 'El pago supera la deuda pendiente';
  end if;

  insert into public.cliente_cuenta_movimientos (
    cliente_id,
    perfil_id,
    tipo,
    forma_pago,
    monto,
    nota
  ) values (
    p_cliente_id,
    v_admin_id,
    'pago',
    p_forma_pago,
    round(p_monto, 2),
    nullif(trim(p_nota), '')
  )
  returning id, cliente_cuenta_movimientos.created_at
  into v_pago_id, v_created_at;

  pago_id := v_pago_id;
  cliente_id := p_cliente_id;
  monto := round(p_monto, 2);
  saldo := round(v_saldo_actual - p_monto, 2);
  created_at := v_created_at;
  return next;
end;
$$;

grant execute on function public.registrar_pago_cuenta_corriente(
  uuid,
  numeric,
  public.forma_pago_venta,
  text
) to authenticated;

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

  if p_forma_pago::text = 'cuenta_corriente' and v_cliente_id is null then
    raise exception 'Selecciona un cliente para vender en cuenta corriente';
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

  if p_forma_pago::text = 'cuenta_corriente' then
    insert into public.cliente_cuenta_movimientos (
      cliente_id,
      perfil_id,
      venta_id,
      tipo,
      monto,
      nota
    ) values (
      v_cliente_id,
      v_profile.id,
      v_venta_id,
      'venta',
      v_total,
      'Venta mostrador en cuenta corriente'
    );
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

create or replace function public.cancelar_venta_mostrador(
  p_venta_id uuid,
  p_motivo text
)
returns table (
  venta_id uuid,
  estado text,
  anulada_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_sale public.ventas%rowtype;
  v_item record;
  v_motivo text;
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

  v_motivo := nullif(trim(p_motivo), '');

  if v_motivo is null then
    raise exception 'Ingresa el motivo de anulacion';
  end if;

  select *
  into v_sale
  from public.ventas
  where id = p_venta_id
  for update;

  if v_sale.id is null then
    raise exception 'Venta no encontrada';
  end if;

  if v_sale.tipo <> 'mostrador' then
    raise exception 'Solo se pueden anular ventas de mostrador';
  end if;

  if v_profile.rol <> 'admin' and v_sale.vendedor_id <> v_profile.id then
    raise exception 'No autorizado';
  end if;

  if v_sale.estado = 'anulada' then
    raise exception 'La venta ya esta anulada';
  end if;

  for v_item in
    select
      vi.producto_id,
      vi.producto_nombre,
      vi.cantidad,
      p.stock
    from public.venta_items vi
    join public.productos p on p.id = vi.producto_id
    where vi.venta_id = p_venta_id
    for update of p
  loop
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
      v_profile.id,
      'entrada'::public.tipo_movimiento_stock,
      v_item.cantidad,
      v_item.stock,
      v_item.stock + v_item.cantidad,
      'Anulacion venta mostrador: ' || v_motivo,
      'venta_mostrador',
      p_venta_id
    );
  end loop;

  update public.productos p
  set stock = p.stock + vi.cantidad
  from public.venta_items vi
  where p.id = vi.producto_id
    and vi.venta_id = p_venta_id;

  if v_sale.forma_pago::text = 'cuenta_corriente' then
    delete from public.cliente_cuenta_movimientos m
    where m.venta_id = p_venta_id
      and m.tipo = 'venta';
  end if;

  update public.ventas v
  set
    estado = 'anulada',
    anulada_at = now(),
    anulada_por = v_profile.id,
    motivo_anulacion = v_motivo
  where v.id = p_venta_id
  returning v.id, v.estado, v.anulada_at
  into venta_id, estado, anulada_at;

  return next;
end;
$$;

grant execute on function public.cancelar_venta_mostrador(uuid, text) to authenticated;
