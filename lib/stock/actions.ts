"use server";

import { revalidatePath } from "next/cache";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { StockMovementType } from "@/lib/stock/types";

function parseMovementForm(formData: FormData) {
  const productoId = formData.get("productoId");
  const tipo = formData.get("tipo");
  const cantidad = Number(formData.get("cantidad"));
  const motivoValue = formData.get("motivo");
  const motivo =
    typeof motivoValue === "string" && motivoValue.trim()
      ? motivoValue.trim()
      : null;

  if (typeof productoId !== "string" || !productoId) {
    throw new Error("Producto invalido.");
  }

  if (tipo !== "entrada" && tipo !== "salida") {
    throw new Error("Tipo de movimiento invalido.");
  }

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error("Cantidad invalida.");
  }

  return {
    productoId,
    tipo: tipo as StockMovementType,
    cantidad,
    motivo,
  };
}

export async function registerStockMovementAction(formData: FormData) {
  await requireAdminProfile();
  const input = parseMovementForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_movimiento_stock", {
    p_producto_id: input.productoId,
    p_tipo: input.tipo,
    p_cantidad: input.cantidad,
    p_motivo: input.motivo,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/productos");
}
