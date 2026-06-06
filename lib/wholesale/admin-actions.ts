"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { AdminWholesaleOrderActionState } from "@/lib/wholesale/types";

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

export async function manageWholesaleOrderAction(
  _previousState: AdminWholesaleOrderActionState,
  formData: FormData,
): Promise<AdminWholesaleOrderActionState> {
  try {
    const { profile } = await getCurrentProfile();

    if (!profile || profile.rol !== "admin") {
      throw new Error("No autorizado.");
    }

    const actionType = getString(formData, "actionType");
    const pedidoId = getString(formData, "pedidoId");

    if (!pedidoId) {
      throw new Error("Pedido invalido.");
    }

    const supabase = await createClient();

    if (actionType === "confirmar") {
      const fechaEntregaAsignada = getString(formData, "fechaEntregaAsignada");

      if (!fechaEntregaAsignada) {
        throw new Error("Selecciona una fecha de entrega.");
      }

      const { error } = await supabase.rpc("confirmar_pedido_mayorista", {
        p_pedido_id: pedidoId,
        p_fecha_entrega_asignada: fechaEntregaAsignada,
      });

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/productos");
      revalidatePath("/admin/stock");

      return {
        ok: true,
        message: `Pedido #${pedidoId.slice(0, 8)} confirmado.`,
      };
    }

    if (actionType === "rechazar") {
      const motivoRechazo = getString(formData, "motivoRechazo");

      const { error } = await supabase.rpc("rechazar_pedido_mayorista", {
        p_pedido_id: pedidoId,
        p_motivo_rechazo: motivoRechazo || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/reportes");
      revalidatePath("/mayorista");

      return {
        ok: true,
        message: `Pedido #${pedidoId.slice(0, 8)} rechazado.`,
      };
    }

    if (actionType === "entregar") {
      const { error } = await supabase.rpc("entregar_pedido_mayorista", {
        p_pedido_id: pedidoId,
      });

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/reportes");
      revalidatePath("/mayorista");

      return {
        ok: true,
        message: `Pedido #${pedidoId.slice(0, 8)} marcado como entregado.`,
      };
    }

    if (actionType === "cancelar") {
      const motivoCancelacion = getString(formData, "motivoCancelacion");

      if (!motivoCancelacion) {
        throw new Error("Ingresa el motivo de cancelacion.");
      }

      const { error } = await supabase.rpc("cancelar_pedido_mayorista", {
        p_pedido_id: pedidoId,
        p_motivo_cancelacion: motivoCancelacion,
      });

      if (error) {
        throw new Error(error.message);
      }

      revalidatePath("/admin");
      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/reportes");
      revalidatePath("/admin/productos");
      revalidatePath("/admin/stock");
      revalidatePath("/mayorista");

      return {
        ok: true,
        message: `Pedido #${pedidoId.slice(0, 8)} cancelado y stock repuesto.`,
      };
    }

    throw new Error("Accion invalida.");
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo procesar el pedido.",
    };
  }
}
