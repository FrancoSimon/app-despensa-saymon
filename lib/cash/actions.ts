"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { CashRegisterActionState } from "@/lib/cash/types";

function getString(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim() : "";
}

function parseMoney(value: string) {
  const normalized = value.replace(",", ".");
  const number = Number(normalized);

  if (!Number.isFinite(number) || number < 0) {
    throw new Error("Importe invalido.");
  }

  return number;
}

export async function openCashRegisterAction(
  _previousState: CashRegisterActionState,
  formData: FormData,
): Promise<CashRegisterActionState> {
  try {
    const { profile } = await getCurrentProfile();

    if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
      throw new Error("No autorizado.");
    }

    const efectivoInicial = parseMoney(getString(formData, "efectivoInicial"));
    const supabase = await createClient();
    const { error } = await supabase.rpc("abrir_caja", {
      p_efectivo_inicial: efectivoInicial,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/vendedor");
    revalidatePath("/vendedor/caja");
    revalidatePath("/admin");
    revalidatePath("/admin/cajas");

    return { ok: true, message: "Caja abierta." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo abrir caja.",
    };
  }
}

export async function closeCashRegisterAction(
  _previousState: CashRegisterActionState,
  formData: FormData,
): Promise<CashRegisterActionState> {
  try {
    const { profile } = await getCurrentProfile();

    if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
      throw new Error("No autorizado.");
    }

    const cajaId = getString(formData, "cajaId");
    const efectivoReal = parseMoney(getString(formData, "efectivoReal"));
    const observaciones = getString(formData, "observaciones");

    if (!cajaId) {
      throw new Error("Caja invalida.");
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("cerrar_caja", {
      p_caja_id: cajaId,
      p_efectivo_real: efectivoReal,
      p_observaciones: observaciones || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/vendedor");
    revalidatePath("/vendedor/caja");
    revalidatePath("/admin");
    revalidatePath("/admin/cajas");

    return { ok: true, message: "Caja cerrada." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo cerrar caja.",
    };
  }
}

