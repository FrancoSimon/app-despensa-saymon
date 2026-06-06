do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'estado_pedido_mayorista'
      and n.nspname = 'public'
      and e.enumlabel = 'cancelado'
  ) then
    alter type public.estado_pedido_mayorista add value 'cancelado';
  end if;
end $$;

create or replace function public.cancelar_pedido_mayorista(
  p_pedido_id uuid,
  p_motivo_cancelacion text
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
  v_admin_id uuid;
  v_order public.pedidos_mayoristas%rowtype;
  v_item record;
  v_motivo text;
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

  v_motivo := nullif(trim(p_motivo_cancelacion), '');

  if v_motivo is null then
    raise exception 'Ingresa el motivo de cancelacion';
  end if;

  select *
  into v_order
  from public.pedidos_mayoristas
  where id = p_pedido_id
  for update;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order.estado <> 'confirmado' then
    raise exception 'Solo se pueden cancelar pedidos confirmados';
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
      'entrada'::public.tipo_movimiento_stock,
      v_item.cantidad,
      v_item.stock,
      v_item.stock + v_item.cantidad,
      'Cancelacion pedido mayorista: ' || v_motivo,
      'pedido_mayorista',
      p_pedido_id
    );
  end loop;

  update public.productos p
  set stock = p.stock + pmi.cantidad
  from public.pedido_mayorista_items pmi
  where p.id = pmi.producto_id
    and pmi.pedido_id = p_pedido_id;

  update public.pedidos_mayoristas pm
  set
    estado = 'cancelado',
    motivo_rechazo = v_motivo
  where pm.id = p_pedido_id
  returning pm.id, pm.estado
  into pedido_id, estado;

  return next;
end;
$$;

grant execute on function public.cancelar_pedido_mayorista(uuid, text) to authenticated;

