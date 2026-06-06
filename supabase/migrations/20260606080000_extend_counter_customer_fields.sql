alter table public.clientes
add column if not exists razon_social text;

alter table public.clientes
add column if not exists documento_tipo text;

alter table public.clientes
add column if not exists documento_numero text;

alter table public.clientes
add column if not exists condicion_iva text;

alter table public.clientes
add column if not exists direccion text;

alter table public.clientes
add column if not exists localidad text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_razon_social_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_razon_social_not_blank
    check (razon_social is null or length(trim(razon_social)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_documento_tipo_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_documento_tipo_not_blank
    check (documento_tipo is null or length(trim(documento_tipo)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_documento_numero_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_documento_numero_not_blank
    check (documento_numero is null or length(trim(documento_numero)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_condicion_iva_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_condicion_iva_not_blank
    check (condicion_iva is null or length(trim(condicion_iva)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_direccion_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_direccion_not_blank
    check (direccion is null or length(trim(direccion)) > 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clientes_localidad_not_blank'
      and conrelid = 'public.clientes'::regclass
  ) then
    alter table public.clientes
    add constraint clientes_localidad_not_blank
    check (localidad is null or length(trim(localidad)) > 0);
  end if;
end $$;

create unique index if not exists clientes_documento_unique_idx
on public.clientes (documento_tipo, documento_numero)
where documento_tipo is not null
  and documento_numero is not null;
