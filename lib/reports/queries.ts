import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/products/types";
import type {
  BestSellerRow,
  DailySalesRow,
  LowStockReportRow,
  ReportDateRange,
  SaleItemReportRow,
  SaleRow,
  SalesSummary,
  WholesaleStatusCount,
} from "@/lib/reports/types";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function localDateKey(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

function emptySummary(): SalesSummary {
  return {
    total: 0,
    count: 0,
    cashTotal: 0,
    qrTotal: 0,
    cardTotal: 0,
    transferTotal: 0,
  };
}

function isMissingSaleStatus(errorCode?: string) {
  return errorCode === "42703" || errorCode === "PGRST204";
}

export async function getSalesSummary(range: ReportDateRange) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ventas")
    .select("fecha, forma_pago, total")
    .eq("estado", "activa")
    .gte("fecha", range.fromIso)
    .lt("fecha", range.toIsoExclusive)
    .returns<SaleRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return emptySummary();
    }

    if (isMissingSaleStatus(error.code)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("ventas")
        .select("fecha, forma_pago, total")
        .gte("fecha", range.fromIso)
        .lt("fecha", range.toIsoExclusive)
        .returns<SaleRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData.reduce<SalesSummary>((summary, sale) => {
        const total = toNumber(sale.total);

        return {
          total: summary.total + total,
          count: summary.count + 1,
          cashTotal:
            summary.cashTotal + (sale.forma_pago === "efectivo" ? total : 0),
          qrTotal: summary.qrTotal + (sale.forma_pago === "qr" ? total : 0),
          cardTotal:
            summary.cardTotal +
            (sale.forma_pago === "tarjeta_credito" ||
            sale.forma_pago === "tarjeta_debito"
              ? total
              : 0),
          transferTotal:
            summary.transferTotal +
            (sale.forma_pago === "transferencia" ? total : 0),
        };
      }, emptySummary());
    }

    throw new Error(error.message);
  }

  return data.reduce<SalesSummary>((summary, sale) => {
    const total = toNumber(sale.total);

    return {
      total: summary.total + total,
      count: summary.count + 1,
      cashTotal: summary.cashTotal + (sale.forma_pago === "efectivo" ? total : 0),
      qrTotal: summary.qrTotal + (sale.forma_pago === "qr" ? total : 0),
      cardTotal:
        summary.cardTotal +
        (sale.forma_pago === "tarjeta_credito" ||
        sale.forma_pago === "tarjeta_debito"
          ? total
          : 0),
      transferTotal:
        summary.transferTotal +
        (sale.forma_pago === "transferencia" ? total : 0),
    };
  }, emptySummary());
}

export async function listDailySales(range: ReportDateRange) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ventas")
    .select("fecha, forma_pago, total")
    .eq("estado", "activa")
    .gte("fecha", range.fromIso)
    .lt("fecha", range.toIsoExclusive)
    .order("fecha", { ascending: true })
    .returns<SaleRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    if (isMissingSaleStatus(error.code)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("ventas")
        .select("fecha, forma_pago, total")
        .gte("fecha", range.fromIso)
        .lt("fecha", range.toIsoExclusive)
        .order("fecha", { ascending: true })
        .returns<SaleRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      const rows = new Map<string, DailySalesRow>();

      for (const sale of fallbackData) {
        const date = localDateKey(sale.fecha);
        const current = rows.get(date) ?? { date, count: 0, total: 0 };

        rows.set(date, {
          date,
          count: current.count + 1,
          total: current.total + toNumber(sale.total),
        });
      }

      return Array.from(rows.values()).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
    }

    throw new Error(error.message);
  }

  const rows = new Map<string, DailySalesRow>();

  for (const sale of data) {
    const date = localDateKey(sale.fecha);
    const current = rows.get(date) ?? { date, count: 0, total: 0 };

    rows.set(date, {
      date,
      count: current.count + 1,
      total: current.total + toNumber(sale.total),
    });
  }

  return Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function listBestSellingProducts(range: ReportDateRange) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venta_items")
    .select(
      `
        producto_id,
        producto_nombre,
        cantidad,
        subtotal,
        ventas!inner (
          fecha,
          estado
        )
      `,
    )
    .eq("ventas.estado", "activa")
    .gte("ventas.fecha", range.fromIso)
    .lt("ventas.fecha", range.toIsoExclusive)
    .returns<SaleItemReportRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    if (isMissingSaleStatus(error.code)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("venta_items")
        .select(
          `
            producto_id,
            producto_nombre,
            cantidad,
            subtotal,
            ventas!inner (
              fecha
            )
          `,
        )
        .gte("ventas.fecha", range.fromIso)
        .lt("ventas.fecha", range.toIsoExclusive)
        .returns<SaleItemReportRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      const rows = new Map<string, BestSellerRow>();

      for (const item of fallbackData) {
        const current = rows.get(item.producto_id) ?? {
          productId: item.producto_id,
          productName: item.producto_nombre,
          quantity: 0,
          total: 0,
        };

        rows.set(item.producto_id, {
          ...current,
          quantity: current.quantity + item.cantidad,
          total: current.total + toNumber(item.subtotal),
        });
      }

      return Array.from(rows.values()).sort((a, b) => {
        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity;
        }

        return b.total - a.total;
      });
    }

    throw new Error(error.message);
  }

  const rows = new Map<string, BestSellerRow>();

  for (const item of data) {
    const current = rows.get(item.producto_id) ?? {
      productId: item.producto_id,
      productName: item.producto_nombre,
      quantity: 0,
      total: 0,
    };

    rows.set(item.producto_id, {
      ...current,
      quantity: current.quantity + item.cantidad,
      total: current.total + toNumber(item.subtotal),
    });
  }

  return Array.from(rows.values()).sort((a, b) => {
    if (b.quantity !== a.quantity) {
      return b.quantity - a.quantity;
    }

    return b.total - a.total;
  });
}

export async function listLowStockProductsForReport(limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("id, nombre, categoria, stock, stock_minimo")
    .eq("activo", true)
    .order("stock", { ascending: true })
    .limit(100)
    .returns<
      Pick<
        ProductRow,
        "id" | "nombre" | "categoria" | "stock" | "stock_minimo"
      >[]
    >();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data
    .filter((product) => product.stock < product.stock_minimo)
    .slice(0, limit)
    .map<LowStockReportRow>((product) => ({
      id: product.id,
      nombre: product.nombre,
      categoria: product.categoria,
      stock: product.stock,
      stockMinimo: product.stock_minimo,
    }));
}

export async function listWholesaleOrderStatusCounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos_mayoristas")
    .select("estado")
    .returns<Pick<WholesaleStatusCount, "estado">[]>();

  const statuses: WholesaleStatusCount[] = [
    { estado: "pendiente", count: 0 },
    { estado: "confirmado", count: 0 },
    { estado: "entregado", count: 0 },
    { estado: "rechazado", count: 0 },
    { estado: "cancelado", count: 0 },
  ];

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return statuses;
    }

    throw new Error(error.message);
  }

  for (const row of data) {
    const status = statuses.find((item) => item.estado === row.estado);

    if (status) {
      status.count += 1;
    }
  }

  return statuses;
}
