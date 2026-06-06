alter table public.proveedores
add column if not exists email text;

alter table public.proveedores
add column if not exists cuit text;

alter table public.proveedores
add column if not exists condicion_iva text;

alter table public.proveedores
add column if not exists direccion text;

alter table public.proveedores
add column if not exists localidad text;

alter table public.proveedores
add column if not exists contacto text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_email_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_email_not_blank
    check (email is null or length(trim(email)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_cuit_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_cuit_not_blank
    check (cuit is null or length(trim(cuit)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_condicion_iva_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_condicion_iva_not_blank
    check (condicion_iva is null or length(trim(condicion_iva)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_direccion_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_direccion_not_blank
    check (direccion is null or length(trim(direccion)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_localidad_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_localidad_not_blank
    check (localidad is null or length(trim(localidad)) > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'proveedores_contacto_not_blank'
      and conrelid = 'public.proveedores'::regclass
  ) then
    alter table public.proveedores
    add constraint proveedores_contacto_not_blank
    check (contacto is null or length(trim(contacto)) > 0);
  end if;
end $$;

create unique index if not exists proveedores_cuit_unique_idx
on public.proveedores (cuit)
where cuit is not null;

create or replace function public.registrar_compra_stock(
  p_producto_id uuid,
  p_proveedor_id uuid default null,
  p_proveedor_nombre text default null,
  p_cantidad integer default 0,
  p_costo_unitario numeric default 0,
  p_fecha_compra date default current_date,
  p_comprobante text default null,
  p_notas text default null,
  p_proveedor_telefono text default null,
  p_proveedor_email text default null,
  p_proveedor_cuit text default null,
  p_proveedor_condicion_iva text default null,
  p_proveedor_direccion text default null,
  p_proveedor_localidad text default null,
  p_proveedor_contacto text default null,
  p_proveedor_notas text default null
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

    insert into public.proveedores (
      nombre,
      telefono,
      email,
      cuit,
      condicion_iva,
      direccion,
      localidad,
      contacto,
      notas
    )
    values (
      v_proveedor_nombre,
      nullif(trim(p_proveedor_telefono), ''),
      nullif(trim(p_proveedor_email), ''),
      nullif(trim(p_proveedor_cuit), ''),
      nullif(trim(p_proveedor_condicion_iva), ''),
      nullif(trim(p_proveedor_direccion), ''),
      nullif(trim(p_proveedor_localidad), ''),
      nullif(trim(p_proveedor_contacto), ''),
      nullif(trim(p_proveedor_notas), '')
    )
    on conflict (lower(nombre)) do update
    set
      activo = true,
      telefono = coalesce(excluded.telefono, proveedores.telefono),
      email = coalesce(excluded.email, proveedores.email),
      cuit = coalesce(excluded.cuit, proveedores.cuit),
      condicion_iva = coalesce(excluded.condicion_iva, proveedores.condicion_iva),
      direccion = coalesce(excluded.direccion, proveedores.direccion),
      localidad = coalesce(excluded.localidad, proveedores.localidad),
      contacto = coalesce(excluded.contacto, proveedores.contacto),
      notas = coalesce(excluded.notas, proveedores.notas),
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
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;
