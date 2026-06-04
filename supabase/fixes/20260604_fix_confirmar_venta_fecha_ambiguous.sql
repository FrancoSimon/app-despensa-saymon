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

    if v_producto.stock < v_cantidad then
      raise exception 'Stock insuficiente para %', v_producto.nombre;
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
  public.forma_pago_venta
) to authenticated;
