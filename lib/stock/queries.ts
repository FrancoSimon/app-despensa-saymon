import { createClient } from "@/lib/supabase/server";
import type { StockMovement, StockMovementRow } from "@/lib/stock/types";

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
