import { createClient } from "@/lib/supabase/server";
import type {
  AdminWholesaleOrder,
  AdminWholesaleOrderItemRow,
  AdminWholesaleOrderRow,
  WholesaleOrder,
  WholesaleOrderRow,
  WholesaleOrderStatus,
} from "@/lib/wholesale/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
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
        motivo_rechazo
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
) {
  const supabase = await createClient();
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
    )
    .order("fecha_pedido", { ascending: status === "pendiente" });

  if (status !== "todos") {
    query = query.eq("estado", status);
  }

  const { data, error } = await query.returns<AdminWholesaleOrderRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapAdminWholesaleOrder);
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
