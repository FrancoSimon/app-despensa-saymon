import { createClient } from "@/lib/supabase/server";
import type { SaleTicket, SaleTicketRow } from "@/lib/sales/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapSaleTicket(row: SaleTicketRow): SaleTicket {
  const subtotal = toNumber(row.subtotal);
  const descuentoPorcentaje = toNumber(row.descuento_porcentaje);
  const recargoPorcentaje = toNumber(row.recargo_porcentaje);
  const descuentoMonto = Math.round(subtotal * descuentoPorcentaje) / 100;
  const recargoMonto =
    Math.round((subtotal - descuentoMonto) * recargoPorcentaje) / 100;

  return {
    id: row.id,
    fecha: row.fecha,
    estado: row.estado ?? "activa",
    anuladaAt: row.anulada_at ?? null,
    motivoAnulacion: row.motivo_anulacion ?? null,
    formaPago: row.forma_pago,
    subtotal,
    descuentoPorcentaje,
    descuentoMonto,
    recargoPorcentaje,
    recargoMonto,
    total: toNumber(row.total),
    vendedorNombre: row.profiles?.nombre ?? "Mostrador",
    items: row.venta_items.map((item) => ({
      id: item.id,
      productoNombre: item.producto_nombre,
      cantidad: item.cantidad,
      precioUnitario: toNumber(item.precio_unitario),
      subtotal: toNumber(item.subtotal),
    })),
  };
}

export async function getSaleTicket(id: string) {
  const supabase = await createClient();

  const query = supabase
    .from("ventas")
    .select(
      `
        id,
        fecha,
        estado,
        anulada_at,
        motivo_anulacion,
        forma_pago,
        subtotal,
        descuento_porcentaje,
        recargo_porcentaje,
        total,
        profiles!ventas_vendedor_id_fkey (
          nombre
        ),
        venta_items (
          id,
          producto_nombre,
          cantidad,
          precio_unitario,
          subtotal
        )
      `,
    )
    .eq("id", id)
    .maybeSingle<SaleTicketRow>();
  const { data, error } = await query;

  if (error) {
    if (error.code === "42703" || error.code === "PGRST204") {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("ventas")
        .select(
          `
            id,
            fecha,
            forma_pago,
            subtotal,
            descuento_porcentaje,
            recargo_porcentaje,
            total,
            profiles!ventas_vendedor_id_fkey (
              nombre
            ),
            venta_items (
              id,
              producto_nombre,
              cantidad,
              precio_unitario,
              subtotal
            )
          `,
        )
        .eq("id", id)
        .maybeSingle<SaleTicketRow>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData ? mapSaleTicket(fallbackData) : null;
    }

    throw new Error(error.message);
  }

  return data ? mapSaleTicket(data) : null;
}
