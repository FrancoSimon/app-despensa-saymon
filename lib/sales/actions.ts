"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { isPaymentMethod } from "@/lib/sales/payment-methods";
import { createClient } from "@/lib/supabase/server";
import type {
  ConfirmSaleInput,
  ConfirmSaleResult,
  ConfirmSaleRpcRow,
} from "@/lib/sales/types";

function assertPercentage(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${field} debe estar entre 0 y 100.`);
  }
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

export async function confirmCounterSaleAction(
  input: ConfirmSaleInput,
): Promise<ConfirmSaleResult> {
  const { profile } = await getCurrentProfile();

  if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
    throw new Error("No autorizado.");
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("Agrega al menos un producto al carrito.");
  }

  assertPercentage(input.descuentoPorcentaje, "El descuento");
  assertPercentage(input.recargoPorcentaje, "El recargo");

  if (!isPaymentMethod(input.formaPago)) {
    throw new Error("Forma de pago invalida.");
  }

  const items = input.items.map((item) => {
    if (
      typeof item.productoId !== "string" ||
      !item.productoId ||
      !Number.isInteger(item.cantidad) ||
      item.cantidad <= 0
    ) {
      throw new Error("Carrito invalido.");
    }

    return {
      productoId: item.productoId,
      cantidad: item.cantidad,
    };
  });

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("confirmar_venta_mostrador", {
      p_items: items,
      p_descuento_porcentaje: input.descuentoPorcentaje,
      p_recargo_porcentaje: input.recargoPorcentaje,
      p_forma_pago: input.formaPago,
    })
    .single<ConfirmSaleRpcRow>();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendedor");
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/stock");
  revalidatePath("/vendedor/caja");
  revalidatePath("/admin/cajas");

  return {
    ventaId: data.venta_id,
    subtotal: toNumber(data.subtotal),
    descuentoMonto: toNumber(data.descuento_monto),
    recargoMonto: toNumber(data.recargo_monto),
    total: toNumber(data.total),
    fecha: data.fecha,
  };
}

export async function cancelCounterSaleAction(formData: FormData) {
  const { profile } = await getCurrentProfile();

  if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
    throw new Error("No autorizado.");
  }

  const ventaId = formData.get("ventaId");
  const motivo = formData.get("motivo");
  const volver = formData.get("volver");

  if (typeof ventaId !== "string" || !ventaId) {
    throw new Error("Venta invalida.");
  }

  if (typeof motivo !== "string" || !motivo.trim()) {
    throw new Error("Ingresa el motivo de anulacion.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_venta_mostrador", {
    p_venta_id: ventaId,
    p_motivo: motivo.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendedor");
  revalidatePath("/admin");
  revalidatePath("/admin/reportes");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/stock");
  revalidatePath("/vendedor/caja");
  revalidatePath("/admin/cajas");
  revalidatePath(`/vendedor/ventas/${ventaId}/ticket`);

  const returnTo =
    typeof volver === "string" && volver.startsWith("/admin/ventas")
      ? `?volver=${encodeURIComponent(volver)}`
      : "";

  redirect(`/vendedor/ventas/${ventaId}/ticket${returnTo}`);
}
