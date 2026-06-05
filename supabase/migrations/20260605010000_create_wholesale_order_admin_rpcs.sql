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
  v_order public.pedidos_mayoristas%rowtype;
  v_item record;
begin
  if not public.is_admin() then
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

create or replace function public.rechazar_pedido_mayorista(
  p_pedido_id uuid,
  p_motivo_rechazo text default null
)
returns table (
  pedido_id uuid,
  estado public.estado_pedido_mayorista
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.pedidos_mayoristas%rowtype;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
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

  update public.pedidos_mayoristas pm
  set
    estado = 'rechazado',
    motivo_rechazo = nullif(trim(p_motivo_rechazo), '')
  where pm.id = p_pedido_id
  returning pm.id, pm.estado
  into pedido_id, estado;

  return next;
end;
$$;

grant execute on function public.confirmar_pedido_mayorista(uuid, date) to authenticated;
grant execute on function public.rechazar_pedido_mayorista(uuid, text) to authenticated;
