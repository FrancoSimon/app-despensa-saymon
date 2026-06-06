"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { isPaymentMethod } from "@/lib/sales/payment-methods";
import { createClient } from "@/lib/supabase/server";
import type { AccountPaymentRpcRow } from "@/lib/accounts/types";

function parsePositiveAmount(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    throw new Error("Monto invalido.");
  }

  const amount = Number(value.replace(",", "."));

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Monto invalido.");
  }

  return amount;
}

export async function registerAccountPaymentAction(formData: FormData) {
  const { profile } = await getCurrentProfile();

  if (!profile || profile.rol !== "admin") {
    throw new Error("No autorizado.");
  }

  const clienteId = formData.get("clienteId");
  const monto = parsePositiveAmount(formData.get("monto"));
  const formaPago = formData.get("formaPago");
  const nota = formData.get("nota");

  if (typeof clienteId !== "string" || !clienteId) {
    throw new Error("Cliente invalido.");
  }

  if (!isPaymentMethod(formaPago) || formaPago === "cuenta_corriente") {
    throw new Error("Forma de pago invalida.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("registrar_pago_cuenta_corriente", {
      p_cliente_id: clienteId,
      p_monto: monto,
      p_forma_pago: formaPago,
      p_nota: typeof nota === "string" && nota.trim() ? nota.trim() : null,
    })
    .single<AccountPaymentRpcRow>();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/cuentas-corrientes");
  revalidatePath(`/admin/cuentas-corrientes/${clienteId}`);
  revalidatePath(`/admin/cuentas-corrientes/pagos/${data.pago_id}/ticket`);

  redirect(`/admin/cuentas-corrientes/pagos/${data.pago_id}/ticket`);
}
