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

function readOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePurchaseForm(formData: FormData) {
  const productoId = formData.get("productoId");
  const proveedorId = readOptionalText(formData, "proveedorId");
  const proveedorNombre = readOptionalText(formData, "proveedorNombre");
  const proveedorTelefono = readOptionalText(formData, "proveedorTelefono");
  const proveedorEmail = readOptionalText(formData, "proveedorEmail");
  const proveedorCuit = readOptionalText(formData, "proveedorCuit");
  const proveedorCondicionIva = readOptionalText(
    formData,
    "proveedorCondicionIva",
  );
  const proveedorDireccion = readOptionalText(formData, "proveedorDireccion");
  const proveedorLocalidad = readOptionalText(formData, "proveedorLocalidad");
  const proveedorContacto = readOptionalText(formData, "proveedorContacto");
  const proveedorNotas = readOptionalText(formData, "proveedorNotas");
  const cantidad = Number(formData.get("cantidad"));
  const costoUnitario = Number(formData.get("costoUnitario"));
  const fechaCompra = readOptionalText(formData, "fechaCompra");
  const comprobante = readOptionalText(formData, "comprobante");
  const notas = readOptionalText(formData, "notas");

  if (typeof productoId !== "string" || !productoId) {
    throw new Error("Producto invalido.");
  }

  if (!proveedorId && !proveedorNombre) {
    throw new Error("Selecciona o crea un proveedor.");
  }

  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    throw new Error("Cantidad invalida.");
  }

  if (!Number.isFinite(costoUnitario) || costoUnitario < 0) {
    throw new Error("Costo unitario invalido.");
  }

  if (!fechaCompra) {
    throw new Error("Fecha de compra invalida.");
  }

  return {
    productoId,
    proveedorId,
    proveedorNombre,
    proveedorTelefono,
    proveedorEmail,
    proveedorCuit,
    proveedorCondicionIva,
    proveedorDireccion,
    proveedorLocalidad,
    proveedorContacto,
    proveedorNotas,
    cantidad,
    costoUnitario,
    fechaCompra,
    comprobante,
    notas,
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

export async function registerStockPurchaseAction(formData: FormData) {
  await requireAdminProfile();
  const input = parsePurchaseForm(formData);
  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_compra_stock", {
    p_producto_id: input.productoId,
    p_proveedor_id: input.proveedorId,
    p_proveedor_nombre: input.proveedorNombre,
    p_cantidad: input.cantidad,
    p_costo_unitario: input.costoUnitario,
    p_fecha_compra: input.fechaCompra,
    p_comprobante: input.comprobante,
    p_notas: input.notas,
    p_proveedor_telefono: input.proveedorTelefono,
    p_proveedor_email: input.proveedorEmail,
    p_proveedor_cuit: input.proveedorCuit,
    p_proveedor_condicion_iva: input.proveedorCondicionIva,
    p_proveedor_direccion: input.proveedorDireccion,
    p_proveedor_localidad: input.proveedorLocalidad,
    p_proveedor_contacto: input.proveedorContacto,
    p_proveedor_notas: input.proveedorNotas,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/stock");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/reportes");
}
