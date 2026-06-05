create or replace function public.entregar_pedido_mayorista(
  p_pedido_id uuid
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

  if v_order.estado <> 'confirmado' then
    raise exception 'Solo se pueden entregar pedidos confirmados';
  end if;

  update public.pedidos_mayoristas pm
  set estado = 'entregado'
  where pm.id = p_pedido_id
  returning pm.id, pm.estado
  into pedido_id, estado;

  return next;
end;
$$;

grant execute on function public.entregar_pedido_mayorista(uuid) to authenticated;
