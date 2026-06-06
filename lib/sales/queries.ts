import { createClient } from "@/lib/supabase/server";
import type { ReportDateRange } from "@/lib/reports/types";
import type {
  AdminSale,
  AdminSaleRow,
  AdminSaleStatusFilter,
  SaleStatus,
  SaleTicket,
  SaleTicketRow,
} from "@/lib/sales/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function mapSaleTicket(row: SaleTicketRow): SaleTicket {
  const subtotal = toNumber(row.subtotal);
  const descuentoPorcentaje = toNumber(row.descuento_porcentaje);
  const recargoPorcentaje = toNumber(row.recargo_porcentaje);
  const descuentoMonto = roundMoney((subtotal * descuentoPorcentaje) / 100);
  const recargoMonto = roundMoney(
    ((subtotal - descuentoMonto) * recargoPorcentaje) / 100,
  );

  return {
    id: row.id,
    vendedorId: row.vendedor_id,
    cajaId: row.caja_id ?? null,
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
    clienteNombre: row.clientes?.nombre ?? null,
    clienteTelefono: row.clientes?.telefono ?? null,
    clienteEmail: row.clientes?.email ?? null,
    items: row.venta_items.map((item) => ({
      id: item.id,
      productoNombre: item.producto_nombre,
      cantidad: item.cantidad,
      precioUnitario: toNumber(item.precio_unitario),
      subtotal: toNumber(item.subtotal),
    })),
  };
}

function mapAdminSale(row: AdminSaleRow): AdminSale {
  return {
    id: row.id,
    fecha: row.fecha,
    estado: row.estado ?? "activa",
    anuladaAt: row.anulada_at ?? null,
    motivoAnulacion: row.motivo_anulacion ?? null,
    formaPago: row.forma_pago,
    total: toNumber(row.total),
    vendedorNombre: row.profiles?.nombre ?? "Mostrador",
  };
}

export function isAdminSaleStatusFilter(
  value: unknown,
): value is AdminSaleStatusFilter {
  return value === "todas" || value === "activa" || value === "anulada";
}

function isMissingSaleStatus(errorCode?: string) {
  return errorCode === "42703" || errorCode === "PGRST204";
}

export async function listAdminSales(
  status: AdminSaleStatusFilter = "todas",
  range?: ReportDateRange,
  limit = 80,
) {
  const supabase = await createClient();
  let query = supabase
    .from("ventas")
    .select(
      `
        id,
        vendedor_id,
        fecha,
        estado,
        anulada_at,
        motivo_anulacion,
        forma_pago,
        total,
        profiles!ventas_vendedor_id_fkey (
          nombre
        )
      `,
    )
    .order("fecha", { ascending: false })
    .limit(limit);

  if (status !== "todas") {
    query = query.eq("estado", status);
  }

  if (range) {
    query = query.gte("fecha", range.fromIso).lt("fecha", range.toIsoExclusive);
  }

  const { data, error } = await query.returns<AdminSaleRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    if (isMissingSaleStatus(error.code)) {
      let fallbackQuery = supabase
        .from("ventas")
        .select(
          `
            id,
            vendedor_id,
            fecha,
            forma_pago,
            total,
            profiles!ventas_vendedor_id_fkey (
              nombre
            )
          `,
        )
        .order("fecha", { ascending: false })
        .limit(limit);

      if (range) {
        fallbackQuery = fallbackQuery
          .gte("fecha", range.fromIso)
          .lt("fecha", range.toIsoExclusive);
      }

      const { data: fallbackData, error: fallbackError } =
        await fallbackQuery.returns<AdminSaleRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      if (status === "anulada") {
        return [];
      }

      return fallbackData.map((row) =>
        mapAdminSale({ ...row, estado: "activa" as SaleStatus }),
      );
    }

    throw new Error(error.message);
  }

  return data.map(mapAdminSale);
}

export async function getSaleTicket(id: string) {
  const supabase = await createClient();

  const query = supabase
    .from("ventas")
    .select(
      `
        id,
        vendedor_id,
        caja_id,
        cliente_id,
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
        clientes (
          nombre,
          telefono,
          email
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
            vendedor_id,
            caja_id,
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
