import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/products/mapper";
import type { ProductRow } from "@/lib/products/types";

export async function listPosProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(
      `
        id,
        codigo_barras,
        nombre,
        categoria,
        precio_mostrador,
        precio_mayorista_fijo,
        precio_mayorista_especial,
        cantidad_especial,
        stock,
        stock_minimo,
        habilitado_mayorista,
        imagen_url,
        activo,
        created_at,
        updated_at
      `,
    )
    .eq("activo", true)
    .gt("stock", 0)
    .order("nombre", { ascending: true })
    .returns<ProductRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProduct);
}

