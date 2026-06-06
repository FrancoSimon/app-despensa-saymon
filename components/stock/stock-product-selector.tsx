"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/products/types";

type StockProductSelectorProps = {
  products: Product[];
  name: string;
  label: string;
};

export function StockProductSelector({
  products,
  name,
  label,
}: StockProductSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return products.slice(0, 6);
    }

    return products
      .filter(
        (product) =>
          product.nombre.toLowerCase().includes(term) ||
          product.categoria.toLowerCase().includes(term) ||
          product.codigoBarras?.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [products, query]);

  return (
    <div>
      <input type="hidden" name={name} value={selectedProductId} required />
      <label className="text-sm font-semibold text-zinc-200">
        {label}
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, categoria o codigo"
          className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
        />
      </label>

      {selectedProduct ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-lime-300/50 bg-lime-950/30 px-3 py-2">
          <div>
            <p className="text-sm font-black text-white">
              {selectedProduct.nombre}
            </p>
            <p className="text-xs text-zinc-500">
              Stock {selectedProduct.stock} / min {selectedProduct.stockMinimo}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedProductId("")}
            className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-lime-300"
          >
            Cambiar
          </button>
        </div>
      ) : null}

      <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto rounded-md border border-white/10 bg-black p-2">
        {matches.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => {
              setSelectedProductId(product.id);
              setQuery(product.nombre);
            }}
            className={
              selectedProductId === product.id
                ? "rounded-md border border-lime-300 bg-lime-950/40 px-3 py-2 text-left"
                : "rounded-md border border-white/10 px-3 py-2 text-left transition hover:border-lime-300"
            }
          >
            <span className="block text-sm font-bold text-white">
              {product.nombre}
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              {product.categoria} - Stock {product.stock}
              {product.codigoBarras ? ` - ${product.codigoBarras}` : ""}
            </span>
          </button>
        ))}

        {matches.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">
            No hay productos para esa busqueda.
          </p>
        ) : null}
      </div>
    </div>
  );
}
