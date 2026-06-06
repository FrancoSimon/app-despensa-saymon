create table if not exists public.caja_movimientos (
  id uuid primary key default gen_random_uuid(),
  caja_id uuid not null references public.cajas(id),
  perfil_id uuid not null references public.profiles(id),
  tipo text not null,
  monto numeric(12,2) not null,
  motivo text not null,
  created_at timestamptz not null default now(),
  constraint caja_movimientos_tipo_check check (tipo in ('ingreso', 'retiro')),
  constraint caja_movimientos_monto_positive check (monto > 0),
  constraint caja_movimientos_motivo_required check (length(trim(motivo)) > 0)
);

create index if not exists caja_movimientos_caja_created_idx
on public.caja_movimientos(caja_id, created_at desc);

create index if not exists caja_movimientos_perfil_created_idx
on public.caja_movimientos(perfil_id, created_at desc);

alter table public.caja_movimientos enable row level security;

drop policy if exists "caja_movimientos_select_admin_or_related" on public.caja_movimientos;

create policy "caja_movimientos_select_admin_or_related"
on public.caja_movimientos
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
  or exists (
    select 1
    from public.cajas c
    join public.profiles p on p.id = c.perfil_id
    where c.id = caja_movimientos.caja_id
      and p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'vendedor')
  )
);

create or replace function public.registrar_movimiento_caja(
  p_caja_id uuid,
  p_tipo text,
  p_monto numeric,
  p_motivo text
)
returns table (
  movimiento_id uuid,
  caja_id uuid,
  tipo text,
  monto numeric,
  motivo text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_caja public.cajas%rowtype;
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

  if p_tipo not in ('ingreso', 'retiro') then
    raise exception 'Tipo de movimiento invalido';
  end if;

  if p_monto is null or p_monto <= 0 then
    raise exception 'Importe invalido';
  end if;

  if p_motivo is null or length(trim(p_motivo)) = 0 then
    raise exception 'Motivo requerido';
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
    raise exception 'La caja esta cerrada';
  end if;

  insert into public.caja_movimientos (
    caja_id,
    perfil_id,
    tipo,
    monto,
    motivo
  ) values (
    p_caja_id,
    v_profile.id,
    p_tipo,
    round(p_monto, 2),
    trim(p_motivo)
  )
  returning
    caja_movimientos.id,
    caja_movimientos.caja_id,
    caja_movimientos.tipo,
    caja_movimientos.monto,
    caja_movimientos.motivo,
    caja_movimientos.created_at
  into
    movimiento_id,
    caja_id,
    tipo,
    monto,
    motivo,
    created_at;

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
  v_movimientos_neto numeric(12,2);
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

  select coalesce(
    sum(
      case
        when cm.tipo = 'ingreso' then cm.monto
        when cm.tipo = 'retiro' then -cm.monto
        else 0
      end
    ),
    0
  )
  into v_movimientos_neto
  from public.caja_movimientos cm
  where cm.caja_id = p_caja_id;

  v_efectivo_esperado := round(
    v_caja.efectivo_inicial + v_efectivo_ventas + v_movimientos_neto,
    2
  );

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

grant execute on function public.registrar_movimiento_caja(
  uuid,
  text,
  numeric,
  text
) to authenticated;

grant execute on function public.cerrar_caja(uuid, numeric, text) to authenticated;
