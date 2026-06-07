import { createClient } from "@/lib/supabase/server";
import {
  createPaginatedResult,
  emptyPaginatedResult,
  getPagination,
  type PaginationInput,
} from "@/lib/pagination";
import type {
  StockMovement,
  StockMovementRow,
  StockPurchase,
  StockPurchaseRow,
  Supplier,
  SupplierRow,
} from "@/lib/stock/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    tipo: row.tipo,
    cantidad: row.cantidad,
    stockAnterior: row.stock_anterior,
    stockNuevo: row.stock_nuevo,
    motivo: row.motivo,
    origen: row.origen ?? "manual",
    referenciaId: row.referencia_id ?? null,
    createdAt: row.created_at,
    productoNombre: row.productos?.nombre ?? "Producto",
    productoCategoria: row.productos?.categoria ?? "-",
    adminNombre: row.profiles?.nombre ?? "Admin",
  };
}

function mapSupplier(row: SupplierRow): Supplier {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    email: row.email ?? null,
    cuit: row.cuit ?? null,
    condicionIva: row.condicion_iva ?? null,
    direccion: row.direccion ?? null,
    localidad: row.localidad ?? null,
    contacto: row.contacto ?? null,
    notas: row.notas,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPurchase(row: StockPurchaseRow): StockPurchase {
  return {
    id: row.id,
    cantidad: row.cantidad,
    costoUnitario: toNumber(row.costo_unitario),
    costoTotal: toNumber(row.costo_total),
    fechaCompra: row.fecha_compra,
    comprobante: row.comprobante,
    notas: row.notas,
    createdAt: row.created_at,
    productoNombre: row.productos?.nombre ?? "Producto",
    productoCategoria: row.productos?.categoria ?? "-",
    proveedorNombre: row.proveedores?.nombre ?? "Proveedor",
    adminNombre: row.profiles?.nombre ?? "Admin",
  };
}

export async function listActiveSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proveedores")
    .select(
      "id, nombre, telefono, email, cuit, condicion_iva, direccion, localidad, contacto, notas, activo, created_at, updated_at",
    )
    .eq("activo", true)
    .order("nombre", { ascending: true })
    .returns<SupplierRow[]>();

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("proveedores")
        .select("id, nombre, telefono, notas, activo, created_at, updated_at")
        .eq("activo", true)
        .order("nombre", { ascending: true })
        .returns<SupplierRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData.map(mapSupplier);
    }

    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapSupplier);
}

export async function listRecentStockMovements(limit = 20) {
  const supabase = await createClient();

  const query = supabase
    .from("stock_movimientos")
    .select(
      `
        id,
        tipo,
        cantidad,
        stock_anterior,
        stock_nuevo,
        motivo,
        origen,
        referencia_id,
        created_at,
        productos (
          nombre,
          categoria
        ),
        profiles (
          nombre
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<StockMovementRow[]>();
  const { data, error } = await query;

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    if (error.code === "42703" || error.code === "PGRST204") {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("stock_movimientos")
        .select(
          `
            id,
            tipo,
            cantidad,
            stock_anterior,
            stock_nuevo,
            motivo,
            created_at,
            productos (
              nombre,
              categoria
            ),
            profiles (
              nombre
            )
          `,
        )
        .order("created_at", { ascending: false })
        .limit(limit)
        .returns<StockMovementRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData.map(mapMovement);
    }

    throw new Error(error.message);
  }

  return data.map(mapMovement);
}

export async function listStockMovementsPaginated(
  paginationInput: PaginationInput = {},
) {
  const supabase = await createClient();
  const pagination = getPagination(paginationInput);

  const query = supabase
    .from("stock_movimientos")
    .select(
      `
        id,
        tipo,
        cantidad,
        stock_anterior,
        stock_nuevo,
        motivo,
        origen,
        referencia_id,
        created_at,
        productos (
          nombre,
          categoria
        ),
        profiles (
          nombre
        )
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to)
    .returns<StockMovementRow[]>();
  const { data, error, count } = await query;

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return emptyPaginatedResult<StockMovement>(
        pagination.page,
        pagination.pageSize,
      );
    }

    if (error.code === "42703" || error.code === "PGRST204") {
      const { data: fallbackData, error: fallbackError, count: fallbackCount } =
        await supabase
          .from("stock_movimientos")
          .select(
            `
              id,
              tipo,
              cantidad,
              stock_anterior,
              stock_nuevo,
              motivo,
              created_at,
              productos (
                nombre,
                categoria
              ),
              profiles (
                nombre
              )
            `,
            { count: "exact" },
          )
          .order("created_at", { ascending: false })
          .range(pagination.from, pagination.to)
          .returns<StockMovementRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return createPaginatedResult<StockMovement>({
        items: fallbackData.map(mapMovement),
        total: fallbackCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
    }

    throw new Error(error.message);
  }

  return createPaginatedResult<StockMovement>({
    items: data.map(mapMovement),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function listRecentStockPurchases(limit = 12) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_compras")
    .select(
      `
        id,
        cantidad,
        costo_unitario,
        costo_total,
        fecha_compra,
        comprobante,
        notas,
        created_at,
        productos (
          nombre,
          categoria
        ),
        proveedores (
          nombre
        ),
        profiles (
          nombre
        )
      `,
    )
    .order("fecha_compra", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<StockPurchaseRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapPurchase);
}

export async function listStockPurchasesPaginated(
  paginationInput: PaginationInput = {},
) {
  const supabase = await createClient();
  const pagination = getPagination(paginationInput);
  const { data, error, count } = await supabase
    .from("stock_compras")
    .select(
      `
        id,
        cantidad,
        costo_unitario,
        costo_total,
        fecha_compra,
        comprobante,
        notas,
        created_at,
        productos (
          nombre,
          categoria
        ),
        proveedores (
          nombre
        ),
        profiles (
          nombre
        )
      `,
      { count: "exact" },
    )
    .order("fecha_compra", { ascending: false })
    .order("created_at", { ascending: false })
    .range(pagination.from, pagination.to)
    .returns<StockPurchaseRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return emptyPaginatedResult<StockPurchase>(
        pagination.page,
        pagination.pageSize,
      );
    }

    throw new Error(error.message);
  }

  return createPaginatedResult<StockPurchase>({
    items: data.map(mapPurchase),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}
