"use client";

import { useState } from "react";
import { ProductImageUpload } from "@/components/products/product-image-upload";
import type { Product } from "@/lib/products/types";

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  product?: Product;
  submitLabel: string;
  returnTo?: string;
};

const inputClass =
  "h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300";

const labelClass = "mb-2 block text-sm font-medium text-zinc-200";

export function ProductForm({
  action,
  product,
  submitLabel,
  returnTo,
}: ProductFormProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  return (
    <form action={action} className="grid gap-5">
      {returnTo ? <input type="hidden" name="volver" value={returnTo} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            className={inputClass}
            name="nombre"
            defaultValue={product?.nombre}
            placeholder="Yerba 1kg"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <input
            className={inputClass}
            name="categoria"
            defaultValue={product?.categoria ?? "General"}
            placeholder="Almacen"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={labelClass}>Precio mostrador</label>
          <input
            className={inputClass}
            name="precioMostrador"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.precioMostrador ?? 0}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Precio mayorista</label>
          <input
            className={inputClass}
            name="precioMayoristaFijo"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.precioMayoristaFijo ?? 0}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Precio especial</label>
          <input
            className={inputClass}
            name="precioMayoristaEspecial"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.precioMayoristaEspecial ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <div>
          <label className={labelClass}>Cantidad especial</label>
          <input
            className={inputClass}
            name="cantidadEspecial"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.cantidadEspecial ?? 0}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            className={inputClass}
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Stock minimo</label>
          <input
            className={inputClass}
            name="stockMinimo"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stockMinimo ?? 5}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Codigo de barras</label>
          <input
            className={inputClass}
            name="codigoBarras"
            defaultValue={product?.codigoBarras ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>

      <ProductImageUpload
        initialUrl={product?.imagenUrl}
        onUploadingChange={setIsUploadingImage}
      />

      <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            name="habilitadoMayorista"
            type="checkbox"
            value="on"
            defaultChecked={product?.habilitadoMayorista ?? false}
            className="size-4 accent-lime-300"
          />
          Habilitado para mayoristas
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            name="activo"
            type="checkbox"
            value="on"
            defaultChecked={product?.activo ?? true}
            className="size-4 accent-lime-300"
          />
          Producto activo
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUploadingImage}
          className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploadingImage ? "Subiendo imagen..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
