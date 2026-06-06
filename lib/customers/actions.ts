"use server";

import { revalidatePath } from "next/cache";
import { requireSellerProfile } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import type { Customer, CustomerRow } from "@/lib/customers/types";

function readOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    email: row.email,
    notas: row.notas,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createQuickCustomerAction(
  input: Pick<Customer, "nombre" | "telefono" | "email" | "notas">,
) {
  await requireSellerProfile();

  const nombre = input.nombre.trim();
  const telefono = input.telefono?.trim() || null;
  const email = input.email?.trim() || null;
  const notas = input.notas?.trim() || null;

  if (!nombre) {
    throw new Error("Ingresa el nombre del cliente.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert({ nombre, telefono, email, notas })
    .select("id, nombre, telefono, email, notas, activo, created_at, updated_at")
    .single<CustomerRow>();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/vendedor");
  return mapCustomer(data);
}

export async function createQuickCustomerFormAction(formData: FormData) {
  return createQuickCustomerAction({
    nombre: readOptionalText(formData, "nombre") ?? "",
    telefono: readOptionalText(formData, "telefono"),
    email: readOptionalText(formData, "email"),
    notas: readOptionalText(formData, "notas"),
  });
}
