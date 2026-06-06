import { createClient } from "@/lib/supabase/server";
import type { Customer, CustomerRow } from "@/lib/customers/types";

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

const customerSelectBase =
  "id, nombre, telefono, email, notas, activo, created_at, updated_at";

const customerSelect = `${customerSelectBase}, razon_social, documento_tipo, documento_numero, condicion_iva, direccion, localidad`;

function isMissingExtendedCustomerColumn(errorCode?: string) {
  return errorCode === "42703" || errorCode === "PGRST204";
}

export async function listActiveCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select(customerSelect)
    .eq("activo", true)
    .order("nombre", { ascending: true })
    .limit(200)
    .returns<CustomerRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    if (isMissingExtendedCustomerColumn(error.code)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("clientes")
        .select(customerSelectBase)
        .eq("activo", true)
        .order("nombre", { ascending: true })
        .limit(200)
        .returns<CustomerRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData.map(mapCustomer);
    }

    throw new Error(error.message);
  }

  return data.map(mapCustomer);
}
