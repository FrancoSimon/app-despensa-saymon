import { createClient } from "@/lib/supabase/server";
import {
  createPaginatedResult,
  emptyPaginatedResult,
  getPagination,
  type PaginationInput,
} from "@/lib/pagination";
import { mapProduct } from "@/lib/products/mapper";
import type { Product, ProductRow } from "@/lib/products/types";

const productSelectBase = `
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

const productSelect = `
  ${productSelectBase},
  costo_compra
`;

function isMissingCostColumn(errorCode?: string) {
  return errorCode === "42703" || errorCode === "PGRST204";
}

export async function listAdminProducts(search?: string) {
  const supabase = await createClient();
  const buildQuery = (select: string) =>
    supabase
      .from("productos")
      .select(select)
      .order("activo", { ascending: false })
      .order("nombre", { ascending: true });

  let query = buildQuery(productSelect);

  const term = search?.trim();

  if (term) {
    const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `nombre.ilike.%${escaped}%,categoria.ilike.%${escaped}%,codigo_barras.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await query.returns<ProductRow[]>();

  if (error) {
    if (isMissingCostColumn(error.code)) {
      let fallbackQuery = buildQuery(productSelectBase);

      if (term) {
        const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
        fallbackQuery = fallbackQuery.or(
          `nombre.ilike.%${escaped}%,categoria.ilike.%${escaped}%,codigo_barras.ilike.%${escaped}%`,
        );
      }

      const { data: fallbackData, error: fallbackError } =
        await fallbackQuery.returns<ProductRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return fallbackData.map(mapProduct);
    }

    throw new Error(error.message);
  }

  return data.map(mapProduct);
}

export async function listAdminProductsPaginated(
  search?: string,
  paginationInput: PaginationInput = {},
) {
  const supabase = await createClient();
  const pagination = getPagination(paginationInput);
  const buildQuery = (select: string) =>
    supabase
      .from("productos")
      .select(select, { count: "exact" })
      .order("activo", { ascending: false })
      .order("nombre", { ascending: true })
      .range(pagination.from, pagination.to);

  let query = buildQuery(productSelect);
  const term = search?.trim();

  if (term) {
    const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `nombre.ilike.%${escaped}%,categoria.ilike.%${escaped}%,codigo_barras.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query.returns<ProductRow[]>();

  if (error) {
    if (isMissingCostColumn(error.code)) {
      let fallbackQuery = buildQuery(productSelectBase);

      if (term) {
        const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
        fallbackQuery = fallbackQuery.or(
          `nombre.ilike.%${escaped}%,categoria.ilike.%${escaped}%,codigo_barras.ilike.%${escaped}%`,
        );
      }

      const {
        data: fallbackData,
        error: fallbackError,
        count: fallbackCount,
      } = await fallbackQuery.returns<ProductRow[]>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return createPaginatedResult<Product>({
        items: fallbackData.map(mapProduct),
        total: fallbackCount,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
    }

    if (error.code === "42P01" || error.code === "PGRST205") {
      return emptyPaginatedResult<Product>(pagination.page, pagination.pageSize);
    }

    throw new Error(error.message);
  }

  return createPaginatedResult<Product>({
    items: data.map(mapProduct),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getAdminProduct(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(productSelect)
    .eq("id", id)
    .single<ProductRow>();

  if (error) {
    if (isMissingCostColumn(error.code)) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("productos")
        .select(productSelectBase)
        .eq("id", id)
        .single<ProductRow>();

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }

      return mapProduct(fallbackData);
    }

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
