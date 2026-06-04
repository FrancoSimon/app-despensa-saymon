import { createClient } from "@/lib/supabase/server";
import { mapProduct } from "@/lib/products/mapper";
import type { ProductRow } from "@/lib/products/types";

const productSelect = `
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
`;

export async function listAdminProducts(search?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("productos")
    .select(productSelect)
    .order("activo", { ascending: false })
    .order("nombre", { ascending: true });

  const term = search?.trim();

  if (term) {
    const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `nombre.ilike.%${escaped}%,categoria.ilike.%${escaped}%,codigo_barras.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await query.returns<ProductRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProduct);
}

export async function getAdminProduct(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(productSelect)
    .eq("id", id)
    .single<ProductRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapProduct(data);
}

export async function getLowStockCount() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select("stock, stock_minimo")
    .eq("activo", true)
    .returns<Pick<ProductRow, "stock" | "stock_minimo">[]>();

  if (error) {
    return null;
  }

  return data.filter((product) => product.stock < product.stock_minimo).length;
}
