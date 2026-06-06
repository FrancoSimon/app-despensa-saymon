create table if not exists public.cajas (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.profiles(id),
  estado text not null default 'abierta',
  abierta_at timestamptz not null default now(),
  cerrada_at timestamptz,
  efectivo_inicial numeric(12,2) not null default 0,
  efectivo_ventas numeric(12,2) not null default 0,
  efectivo_esperado numeric(12,2) not null default 0,
  efectivo_real numeric(12,2),
  diferencia_efectivo numeric(12,2),
  qr_total numeric(12,2) not null default 0,
  tarjeta_credito_total numeric(12,2) not null default 0,
  tarjeta_debito_total numeric(12,2) not null default 0,
  transferencia_total numeric(12,2) not null default 0,
  total_ventas numeric(12,2) not null default 0,
  cantidad_ventas integer not null default 0,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cajas_estado_check check (estado in ('abierta', 'cerrada')),
  constraint cajas_efectivo_inicial_non_negative check (efectivo_inicial >= 0),
  constraint cajas_efectivo_real_non_negative check (
    efectivo_real is null or efectivo_real >= 0
  ),
  constraint cajas_cierre_state_check check (
    (estado = 'abierta' and cerrada_at is null and efectivo_real is null and diferencia_efectivo is null)
    or
    (estado = 'cerrada' and cerrada_at is not null and efectivo_real is not null and diferencia_efectivo is not null)
  )
);

alter table public.ventas
add column if not exists caja_id uuid references public.cajas(id);

create unique index if not exists cajas_perfil_abierta_uidx
on public.cajas(perfil_id)
where estado = 'abierta';

create index if not exists cajas_estado_abierta_idx
on public.cajas(estado, abierta_at desc);

create index if not exists cajas_perfil_abierta_idx
on public.cajas(perfil_id, abierta_at desc);

create index if not exists ventas_caja_fecha_idx
on public.ventas(caja_id, fecha desc);

drop trigger if exists cajas_set_updated_at on public.cajas;

create trigger cajas_set_updated_at
before update on public.cajas
for each row
execute function public.set_updated_at();

alter table public.cajas enable row level security;

drop policy if exists "cajas_select_admin_or_own" on public.cajas;

create policy "cajas_select_admin_or_own"
on public.cajas
for select
to authenticated
using (
  public.is_admin()
  or perfil_id = (
    select p.id
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'vendedor')
    limit 1
  )
);

create or replace function public.abrir_caja(
  p_efectivo_inicial numeric default 0
)
returns table (
  caja_id uuid,
  estado text,
  abierta_at timestamptz,
  efectivo_inicial numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
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

  if p_efectivo_inicial is null or p_efectivo_inicial < 0 then
    raise exception 'Efectivo inicial invalido';
  end if;

  if exists (
    select 1
    from public.cajas c
    where c.perfil_id = v_profile.id
      and c.estado = 'abierta'
  ) then
    raise exception 'Ya tenes una caja abierta';
  end if;

  insert into public.cajas (
    perfil_id,
    efectivo_inicial,
    efectivo_esperado
  ) values (
    v_profile.id,
    round(p_efectivo_inicial, 2),
    round(p_efectivo_inicial, 2)
  )
  returning cajas.id, cajas.estado, cajas.abierta_at, cajas.efectivo_inicial
  into caja_id, estado, abierta_at, efectivo_inicial;

  return next;
end;
$$;

create or replace function public.cerrar_caja(
  p_caja_id uuid,
  p_efectivo_real numeric,
  p_observaciones text default null
)
returns table (
  caja_id uuid,
  estado text,
  cerrada_at timestamptz,
  efectivo_esperado numeric,
  efectivo_real numeric,
  diferencia_efectivo numeric,
  total_ventas numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_caja public.cajas%rowtype;
  v_efectivo_ventas numeric(12,2);
  v_qr_total numeric(12,2);
  v_tarjeta_credito_total numeric(12,2);
  v_tarjeta_debito_total numeric(12,2);
  v_transferencia_total numeric(12,2);
  v_total_ventas numeric(12,2);
  v_cantidad_ventas integer;
  v_efectivo_esperado numeric(12,2);
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

  if p_efectivo_real is null or p_efectivo_real < 0 then
    raise exception 'Efectivo real invalido';
  end if;

  select *
  into v_caja
  from public.cajas
  where id = p_caja_id
  for update;

  if v_caja.id is null then
    raise exception 'Caja no encontrada';
  end if;

  if v_profile.rol <> 'admin' and v_caja.perfil_id <> v_profile.id then
    raise exception 'No autorizado';
  end if;

  if v_caja.estado <> 'abierta' then
    raise exception 'La caja ya esta cerrada';
  end if;

  select
    coalesce(sum(v.total) filter (where v.forma_pago = 'efectivo'), 0),
    coalesce(sum(v.total) filter (where v.forma_pago = 'qr'), 0),
    coalesce(sum(v.total) filter (where v.forma_pago = 'tarjeta_credito'), 0),
    coalesce(sum(v.total) filter (where v.forma_pago = 'tarjeta_debito'), 0),
    coalesce(sum(v.total) filter (where v.forma_pago = 'transferencia'), 0),
    coalesce(sum(v.total), 0),
    count(*)::integer
  into
    v_efectivo_ventas,
    v_qr_total,
    v_tarjeta_credito_total,
    v_tarjeta_debito_total,
    v_transferencia_total,
    v_total_ventas,
    v_cantidad_ventas
  from public.ventas v
  where v.caja_id = p_caja_id
    and coalesce(v.estado, 'activa') = 'activa';

  v_efectivo_esperado := round(v_caja.efectivo_inicial + v_efectivo_ventas, 2);

  update public.cajas c
  set
    estado = 'cerrada',
    cerrada_at = now(),
    efectivo_ventas = round(v_efectivo_ventas, 2),
    efectivo_esperado = v_efectivo_esperado,
    efectivo_real = round(p_efectivo_real, 2),
    diferencia_efectivo = round(p_efectivo_real - v_efectivo_esperado, 2),
    qr_total = round(v_qr_total, 2),
    tarjeta_credito_total = round(v_tarjeta_credito_total, 2),
    tarjeta_debito_total = round(v_tarjeta_debito_total, 2),
    transferencia_total = round(v_transferencia_total, 2),
    total_ventas = round(v_total_ventas, 2),
    cantidad_ventas = v_cantidad_ventas,
    observaciones = nullif(trim(p_observaciones), '')
  where c.id = p_caja_id
  returning
    c.id,
    c.estado,
    c.cerrada_at,
    c.efectivo_esperado,
    c.efectivo_real,
    c.diferencia_efectivo,
    c.total_ventas
  into
    caja_id,
    estado,
    cerrada_at,
    efectivo_esperado,
    efectivo_real,
    diferencia_efectivo,
    total_ventas;

  return next;
end;
$$;

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
  v_caja_id uuid;
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
    forma_pago,
    subtotal,
    descuento_porcentaje,
    recargo_porcentaje,
    total
  ) values (
    v_profile.id,
    v_caja_id,
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

grant execute on function public.abrir_caja(numeric) to authenticated;
grant execute on function public.cerrar_caja(uuid, numeric, text) to authenticated;

grant execute on function public.confirmar_venta_mostrador(
  jsonb,
  numeric,
  numeric,
  public.forma_pago_venta
) to authenticated;

