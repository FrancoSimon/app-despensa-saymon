import { createClient } from "@/lib/supabase/server";
import {
  createPaginatedResult,
  emptyPaginatedResult,
  getPagination,
  type PaginationInput,
} from "@/lib/pagination";
import type {
  AdminWholesaleOrder,
  AdminWholesaleOrderItemRow,
  AdminWholesaleOrderRow,
  WholesaleOrderItemRow,
  WholesaleOrder,
  WholesaleOrderRow,
  WholesaleOrderStatus,
} from "@/lib/wholesale/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapWholesaleOrderItem(row: WholesaleOrderItemRow) {
  return {
    id: row.id,
    productoId: row.producto_id,
    productoNombre: row.producto_nombre,
    cantidad: row.cantidad,
    precioUnitario: toNumber(row.precio_unitario),
    precioEspecialAplicado: row.precio_especial_aplicado,
    subtotal: toNumber(row.subtotal),
  };
}

function mapWholesaleOrder(row: WholesaleOrderRow): WholesaleOrder {
  return {
    id: row.id,
    fechaPedido: row.fecha_pedido,
    fechaEntregaDeseada: row.fecha_entrega_deseada,
    fechaEntregaAsignada: row.fecha_entrega_asignada,
    estado: row.estado,
    total: toNumber(row.total),
    comentario: row.comentario,
    motivoRechazo: row.motivo_rechazo,
    items: row.pedido_mayorista_items?.map(mapWholesaleOrderItem) ?? [],
  };
}

function mapAdminWholesaleOrderItem(row: AdminWholesaleOrderItemRow) {
  return {
    id: row.id,
    productoId: row.producto_id,
    productoNombre: row.producto_nombre,
    cantidad: row.cantidad,
    precioUnitario: toNumber(row.precio_unitario),
    precioEspecialAplicado: row.precio_especial_aplicado,
    subtotal: toNumber(row.subtotal),
    stockActual: row.productos?.stock ?? null,
  };
}

function mapAdminWholesaleOrder(row: AdminWholesaleOrderRow): AdminWholesaleOrder {
  return {
    ...mapWholesaleOrder(row),
    mayorista: {
      nombre: row.profiles?.nombre ?? "Mayorista",
      email: row.profiles?.email ?? "Sin email",
      localidad: row.profiles?.localidad ?? null,
      telefono: row.profiles?.telefono ?? null,
    },
    items: row.pedido_mayorista_items.map(mapAdminWholesaleOrderItem),
  };
}

export async function listMyWholesaleOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos_mayoristas")
    .select(
      `
        id,
        fecha_pedido,
        fecha_entrega_deseada,
        fecha_entrega_asignada,
        estado,
        total,
        comentario,
        motivo_rechazo,
        pedido_mayorista_items (
          id,
          producto_id,
          producto_nombre,
          cantidad,
          precio_unitario,
          precio_especial_aplicado,
          subtotal
        )
      `,
    )
    .order("fecha_pedido", { ascending: false })
    .limit(8)
    .returns<WholesaleOrderRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapWholesaleOrder);
}

export type AdminWholesaleOrderStatusFilter = WholesaleOrderStatus | "todos";

export function isAdminWholesaleOrderStatusFilter(
  value: unknown,
): value is AdminWholesaleOrderStatusFilter {
  return (
    value === "todos" ||
    value === "pendiente" ||
    value === "confirmado" ||
    value === "entregado" ||
    value === "rechazado" ||
    value === "cancelado"
  );
}

export async function listWholesaleOrdersForAdmin(
  status: AdminWholesaleOrderStatusFilter = "pendiente",
  paginationInput: PaginationInput = {},
) {
  const supabase = await createClient();
  const pagination = getPagination(paginationInput);
  let query = supabase
    .from("pedidos_mayoristas")
    .select(
      `
        id,
        fecha_pedido,
        fecha_entrega_deseada,
        fecha_entrega_asignada,
        estado,
        total,
        comentario,
        motivo_rechazo,
        profiles (
          nombre,
          email,
          localidad,
          telefono
        ),
        pedido_mayorista_items (
          id,
          producto_id,
          producto_nombre,
          cantidad,
          precio_unitario,
          precio_especial_aplicado,
          subtotal,
          productos (
            stock
          )
        )
      `,
      { count: "exact" },
    )
    .order("fecha_pedido", { ascending: status === "pendiente" })
    .range(pagination.from, pagination.to);

  if (status !== "todos") {
    query = query.eq("estado", status);
  }

  const { data, error, count } = await query.returns<AdminWholesaleOrderRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return emptyPaginatedResult<AdminWholesaleOrder>(
        pagination.page,
        pagination.pageSize,
      );
    }

    throw new Error(error.message);
  }

  return createPaginatedResult<AdminWholesaleOrder>({
    items: data.map(mapAdminWholesaleOrder),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export const listPendingWholesaleOrdersForAdmin = () =>
  listWholesaleOrdersForAdmin("pendiente");

export async function getPendingWholesaleOrderCount() {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("pedidos_mayoristas")
    .select("id", { count: "exact", head: true })
    .eq("estado", "pendiente");

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return null;
    }

    return null;
  }

  return count ?? 0;
}
