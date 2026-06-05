do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'estado_pedido_mayorista'
      and n.nspname = 'public'
  ) then
    create type public.estado_pedido_mayorista as enum (
      'pendiente',
      'confirmado',
      'entregado',
      'rechazado'
    );
  end if;
end;
$$;

create table if not exists public.pedidos_mayoristas (
  id uuid primary key default gen_random_uuid(),
  mayorista_id uuid not null references public.profiles(id),
  fecha_pedido timestamptz not null default now(),
  fecha_entrega_deseada date not null,
  fecha_entrega_asignada date,
  estado public.estado_pedido_mayorista not null default 'pendiente',
  total numeric(12,2) not null,
  comentario text,
  motivo_rechazo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pedidos_mayoristas_total_non_negative check (total >= 0),
  constraint pedidos_mayoristas_saturday_delivery check (
    extract(dow from fecha_entrega_deseada) = 6
  ),
  constraint pedidos_mayoristas_assigned_saturday_delivery check (
    fecha_entrega_asignada is null
    or extract(dow from fecha_entrega_asignada) = 6
  )
);

create table if not exists public.pedido_mayorista_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_mayoristas(id) on delete cascade,
  producto_id uuid not null references public.productos(id),
  producto_nombre text not null,
  cantidad integer not null,
  precio_unitario numeric(12,2) not null,
  precio_especial_aplicado boolean not null default false,
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint pedido_mayorista_items_cantidad_positive check (cantidad > 0),
  constraint pedido_mayorista_items_precio_unitario_non_negative check (precio_unitario >= 0),
  constraint pedido_mayorista_items_subtotal_non_negative check (subtotal >= 0)
);

alter table public.pedido_mayorista_items
add column if not exists precio_especial_aplicado boolean not null default false;

create index if not exists pedidos_mayoristas_mayorista_fecha_idx
on public.pedidos_mayoristas(mayorista_id, fecha_pedido desc);

create index if not exists pedidos_mayoristas_estado_fecha_idx
on public.pedidos_mayoristas(estado, fecha_pedido desc);

create index if not exists pedidos_mayoristas_fecha_entrega_idx
on public.pedidos_mayoristas(fecha_entrega_deseada);

create index if not exists pedido_mayorista_items_pedido_id_idx
on public.pedido_mayorista_items(pedido_id);

create index if not exists pedido_mayorista_items_producto_id_idx
on public.pedido_mayorista_items(producto_id);

drop trigger if exists pedidos_mayoristas_set_updated_at on public.pedidos_mayoristas;

create trigger pedidos_mayoristas_set_updated_at
before update on public.pedidos_mayoristas
for each row
execute function public.set_updated_at();

alter table public.pedidos_mayoristas enable row level security;
alter table public.pedido_mayorista_items enable row level security;

drop policy if exists "pedidos_mayoristas_select_admin_or_own"
on public.pedidos_mayoristas;

create policy "pedidos_mayoristas_select_admin_or_own"
on public.pedidos_mayoristas
for select
to authenticated
using (
  public.is_admin()
  or mayorista_id = (
    select p.id
    from public.profiles p
    where p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'mayorista')
    limit 1
  )
);

drop policy if exists "pedido_mayorista_items_select_admin_or_own"
on public.pedido_mayorista_items;

create policy "pedido_mayorista_items_select_admin_or_own"
on public.pedido_mayorista_items
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.pedidos_mayoristas pm
    join public.profiles p on p.id = pm.mayorista_id
    where pm.id = pedido_mayorista_items.pedido_id
      and p.auth_user_id = (select auth.uid())
      and p.activo = true
      and p.rol in ('admin', 'mayorista')
  )
);

create or replace function public.minima_fecha_entrega_mayorista()
returns date
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := timezone('America/Argentina/Buenos_Aires', now())::date;
  v_dow integer := extract(dow from timezone('America/Argentina/Buenos_Aires', now()))::integer;
begin
  if v_dow <= 4 then
    return v_today + (6 - v_dow);
  end if;

  return v_today + (13 - v_dow);
end;
$$;

create or replace function public.crear_pedido_mayorista(
  p_items jsonb,
  p_fecha_entrega_deseada date,
  p_comentario text default null
)
returns table (
  pedido_id uuid,
  total numeric,
  fecha_pedido timestamptz,
  fecha_entrega_deseada date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
  v_item jsonb;
  v_producto public.productos%rowtype;
  v_producto_id uuid;
  v_cantidad integer;
  v_precio_unitario numeric(12,2);
  v_total numeric(12,2) := 0;
  v_pedido_id uuid;
  v_fecha_pedido timestamptz;
begin
  select *
  into v_profile
  from public.profiles
  where auth_user_id = (select auth.uid())
    and activo = true
    and rol in ('admin', 'mayorista')
  limit 1;

  if v_profile.id is null then
    raise exception 'No autorizado';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido requiere al menos un producto';
  end if;

  if p_fecha_entrega_deseada is null then
    raise exception 'Selecciona una fecha de entrega';
  end if;

  if extract(dow from p_fecha_entrega_deseada) <> 6 then
    raise exception 'La entrega mayorista debe ser un sabado';
  end if;

  if p_fecha_entrega_deseada < public.minima_fecha_entrega_mayorista() then
    raise exception 'La fecha seleccionada ya no esta disponible';
  end if;

  create temporary table tmp_pedido_input (
    producto_id uuid primary key,
    cantidad integer not null
  ) on commit drop;

  create temporary table tmp_pedido_items (
    producto_id uuid primary key,
    producto_nombre text not null,
    cantidad integer not null,
    precio_unitario numeric(12,2) not null,
    precio_especial_aplicado boolean not null,
    subtotal numeric(12,2) not null
  ) on commit drop;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_producto_id := (v_item->>'productoId')::uuid;
    v_cantidad := (v_item->>'cantidad')::integer;

    if v_producto_id is null or v_cantidad is null or v_cantidad <= 0 then
      raise exception 'Pedido invalido';
    end if;

    insert into tmp_pedido_input (producto_id, cantidad)
    values (v_producto_id, v_cantidad)
    on conflict (producto_id) do update
    set cantidad = tmp_pedido_input.cantidad + excluded.cantidad;
  end loop;

  for v_producto_id, v_cantidad in
    select t.producto_id, t.cantidad
    from tmp_pedido_input t
  loop
    select *
    into v_producto
    from public.productos
    where id = v_producto_id
      and activo = true
      and habilitado_mayorista = true;

    if v_producto.id is null then
      raise exception 'Producto mayorista no disponible';
    end if;

    v_precio_unitario := v_producto.precio_mayorista_fijo;

    if v_producto.precio_mayorista_especial is not null
      and v_producto.cantidad_especial > 0
      and v_cantidad >= v_producto.cantidad_especial then
      v_precio_unitario := v_producto.precio_mayorista_especial;
    end if;

    insert into tmp_pedido_items (
      producto_id,
      producto_nombre,
      cantidad,
      precio_unitario,
      precio_especial_aplicado,
      subtotal
    ) values (
      v_producto.id,
      v_producto.nombre,
      v_cantidad,
      v_precio_unitario,
      coalesce(v_precio_unitario = v_producto.precio_mayorista_especial, false),
      round(v_precio_unitario * v_cantidad, 2)
    );
  end loop;

  select coalesce(sum(t.subtotal), 0)
  into v_total
  from tmp_pedido_items t;

  insert into public.pedidos_mayoristas (
    mayorista_id,
    fecha_entrega_deseada,
    total,
    comentario
  ) values (
    v_profile.id,
    p_fecha_entrega_deseada,
    v_total,
    nullif(trim(p_comentario), '')
  )
  returning pedidos_mayoristas.id, pedidos_mayoristas.fecha_pedido
  into v_pedido_id, v_fecha_pedido;

  insert into public.pedido_mayorista_items (
    pedido_id,
    producto_id,
    producto_nombre,
    cantidad,
    precio_unitario,
    precio_especial_aplicado,
    subtotal
  )
  select
    v_pedido_id,
    t.producto_id,
    t.producto_nombre,
    t.cantidad,
    t.precio_unitario,
    t.precio_especial_aplicado,
    t.subtotal
  from tmp_pedido_items t;

  pedido_id := v_pedido_id;
  total := v_total;
  fecha_pedido := v_fecha_pedido;
  fecha_entrega_deseada := p_fecha_entrega_deseada;
  return next;
end;
$$;

grant execute on function public.minima_fecha_entrega_mayorista() to authenticated;
grant execute on function public.crear_pedido_mayorista(jsonb, date, text) to authenticated;
