"use client";

import { type FormEvent, useRef, useState } from "react";
import { BarcodeValueScanner } from "@/components/products/barcode-value-scanner";
import { ProductImageUpload } from "@/components/products/product-image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

const productCategoryOptions = [
  "General",
  "Almacen",
  "Bebidas",
  "Lacteos",
  "Fiambres",
  "Panificados",
  "Golosinas",
  "Limpieza",
  "Perfumeria",
  "Kiosco",
  "Congelados",
  "Mascotas",
  "Libreria",
  "Juguetes",
  "Tecnologia",
  "Ferreteria",
  "Bazar",
  "Textil",
  "Regaleria",
  "Otros",
];

export function ProductForm({
  action,
  product,
  submitLabel,
  returnTo,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const confirmedSubmitRef = useRef(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCreateConfirmOpen, setIsCreateConfirmOpen] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState(product?.codigoBarras ?? "");
  const shouldConfirmCreate = !product;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!shouldConfirmCreate || confirmedSubmitRef.current) {
      confirmedSubmitRef.current = false;
      return;
    }

    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    setIsCreateConfirmOpen(true);
  }

  function confirmCreateProduct() {
    confirmedSubmitRef.current = true;
    setIsCreateConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={action} onSubmit={handleSubmit} className="grid gap-5">
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
            list="product-category-options"
            defaultValue={product?.categoria ?? "General"}
            placeholder="Almacen"
            required
          />
          <datalist id="product-category-options">
            {productCategoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
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
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              className={inputClass}
              name="codigoBarras"
              value={barcodeValue}
              onChange={(event) => setBarcodeValue(event.target.value)}
              placeholder="Opcional"
            />
            <BarcodeValueScanner onCodeScanned={setBarcodeValue} />
          </div>
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

      <ConfirmDialog
        isOpen={isCreateConfirmOpen}
        title="Crear producto"
        description="Confirma que los datos cargados son correctos antes de agregar este producto al catalogo."
        confirmLabel="Crear producto"
        onCancel={() => setIsCreateConfirmOpen(false)}
        onConfirm={confirmCreateProduct}
      />
    </form>
  );
}
