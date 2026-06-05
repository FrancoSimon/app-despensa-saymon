"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { isAllowedWholesaleDeliveryDate } from "@/lib/wholesale/dates";
import type {
  CreateWholesaleOrderState,
  WholesaleOrderInput,
  WholesaleOrderRpcRow,
  WholesaleOrderResult,
} from "@/lib/wholesale/types";

const initialMessage =
  "No se pudo crear el pedido. Revisa los datos e intenta nuevamente.";

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function normalizeInput(formData: FormData): WholesaleOrderInput {
  const rawItems = formData.get("items");
  const rawFecha = formData.get("fechaEntregaDeseada");
  const rawComentario = formData.get("comentario");

  if (typeof rawItems !== "string" || typeof rawFecha !== "string") {
    throw new Error("Pedido invalido.");
  }

  const parsed = JSON.parse(rawItems) as unknown;

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Agrega al menos un producto al pedido.");
  }

  return {
    items: parsed.map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        typeof (item as { productoId?: unknown }).productoId !== "string" ||
        !Number.isInteger((item as { cantidad?: unknown }).cantidad) ||
        Number((item as { cantidad?: unknown }).cantidad) <= 0
      ) {
        throw new Error("Carrito invalido.");
      }

      return {
        productoId: (item as { productoId: string }).productoId,
        cantidad: Number((item as { cantidad: number }).cantidad),
      };
    }),
    fechaEntregaDeseada: rawFecha,
    comentario:
      typeof rawComentario === "string" && rawComentario.trim()
        ? rawComentario.trim()
        : null,
  };
}

export async function createWholesaleOrderAction(
  _previousState: CreateWholesaleOrderState,
  formData: FormData,
): Promise<CreateWholesaleOrderState> {
  try {
    const { profile } = await getCurrentProfile();

    if (!profile || (profile.rol !== "admin" && profile.rol !== "mayorista")) {
      throw new Error("No autorizado.");
    }

    const input = normalizeInput(formData);

    if (!isAllowedWholesaleDeliveryDate(input.fechaEntregaDeseada)) {
      throw new Error("Selecciona un sabado de entrega disponible.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("crear_pedido_mayorista", {
        p_items: input.items,
        p_fecha_entrega_deseada: input.fechaEntregaDeseada,
        p_comentario: input.comentario,
      })
      .single<WholesaleOrderRpcRow>();

    if (error) {
      throw new Error(error.message);
    }

    const order: WholesaleOrderResult = {
      pedidoId: data.pedido_id,
      total: toNumber(data.total),
      fechaPedido: data.fecha_pedido,
      fechaEntregaDeseada: data.fecha_entrega_deseada,
    };

    revalidatePath("/mayorista");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Pedido mayorista creado como pendiente.",
      order,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : initialMessage,
      order: null,
    };
  }
}
