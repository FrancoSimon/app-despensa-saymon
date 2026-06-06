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
    razonSocial: row.razon_social ?? null,
    documentoTipo: row.documento_tipo ?? null,
    documentoNumero: row.documento_numero ?? null,
    condicionIva: row.condicion_iva ?? null,
    direccion: row.direccion ?? null,
    localidad: row.localidad ?? null,
    notas: row.notas,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createQuickCustomerAction(
  input: Pick<
    Customer,
    | "nombre"
    | "telefono"
    | "email"
    | "razonSocial"
    | "documentoTipo"
    | "documentoNumero"
    | "condicionIva"
    | "direccion"
    | "localidad"
    | "notas"
  >,
) {
  await requireSellerProfile();

  const nombre = input.nombre.trim();
  const telefono = input.telefono?.trim() || null;
  const email = input.email?.trim() || null;
  const razonSocial = input.razonSocial?.trim() || null;
  const documentoTipo = input.documentoTipo?.trim() || null;
  const documentoNumero = input.documentoNumero?.trim() || null;
  const condicionIva = input.condicionIva?.trim() || null;
  const direccion = input.direccion?.trim() || null;
  const localidad = input.localidad?.trim() || null;
  const notas = input.notas?.trim() || null;

  if (!nombre) {
    throw new Error("Ingresa el nombre del cliente.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nombre,
      telefono,
      email,
      razon_social: razonSocial,
      documento_tipo: documentoTipo,
      documento_numero: documentoNumero,
      condicion_iva: condicionIva,
      direccion,
      localidad,
      notas,
    })
    .select(
      "id, nombre, telefono, email, razon_social, documento_tipo, documento_numero, condicion_iva, direccion, localidad, notas, activo, created_at, updated_at",
    )
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
    razonSocial: readOptionalText(formData, "razonSocial"),
    documentoTipo: readOptionalText(formData, "documentoTipo"),
    documentoNumero: readOptionalText(formData, "documentoNumero"),
    condicionIva: readOptionalText(formData, "condicionIva"),
    direccion: readOptionalText(formData, "direccion"),
    localidad: readOptionalText(formData, "localidad"),
    notas: readOptionalText(formData, "notas"),
  });
}
