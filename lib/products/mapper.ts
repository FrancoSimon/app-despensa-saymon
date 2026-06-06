import type { Product, ProductRow } from "@/lib/products/types";

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    codigoBarras: row.codigo_barras,
    nombre: row.nombre,
    categoria: row.categoria,
    precioMostrador: toNumber(row.precio_mostrador) ?? 0,
    precioMayoristaFijo: toNumber(row.precio_mayorista_fijo) ?? 0,
    precioMayoristaEspecial: toNumber(row.precio_mayorista_especial),
    cantidadEspecial: row.cantidad_especial,
    stock: row.stock,
    stockMinimo: row.stock_minimo,
    costoCompra: toNumber(row.costo_compra) ?? 0,
    habilitadoMayorista: row.habilitado_mayorista,
    imagenUrl: row.imagen_url,
    activo: row.activo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
