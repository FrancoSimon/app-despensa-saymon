import { createClient } from "@/lib/supabase/server";
import type { Customer, CustomerRow } from "@/lib/customers/types";

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

export async function listActiveCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("id, nombre, telefono, email, notas, activo, created_at, updated_at")
    .eq("activo", true)
    .order("nombre", { ascending: true })
    .limit(200)
    .returns<CustomerRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapCustomer);
}
