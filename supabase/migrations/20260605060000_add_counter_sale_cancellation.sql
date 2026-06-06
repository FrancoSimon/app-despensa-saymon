alter table public.ventas
add column if not exists estado text not null default 'activa';

alter table public.ventas
add column if not exists anulada_at timestamptz;

alter table public.ventas
add column if not exists anulada_por uuid references public.profiles(id);

alter table public.ventas
add column if not exists motivo_anulacion text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'ventas_estado_check'
      and conrelid = 'public.ventas'::regclass
  ) then
    alter table public.ventas
    add constraint ventas_estado_check
    check (estado in ('activa', 'anulada'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'ventas_anulacion_state_check'
      and conrelid = 'public.ventas'::regclass
  ) then
    alter table public.ventas
    add constraint ventas_anulacion_state_check
    check (
      (estado = 'activa' and anulada_at is null and anulada_por is null and motivo_anulacion is null)
      or
      (estado = 'anulada' and anulada_at is not null and anulada_por is not null and motivo_anulacion is not null)
    );
  end if;
end $$;

create index if not exists ventas_estado_fecha_idx
on public.ventas(estado, fecha desc);

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

