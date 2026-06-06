"use client";

import { useMemo, useState } from "react";
import type { Supplier } from "@/lib/stock/types";

type SupplierForm = {
  nombre: string;
  telefono: string;
  email: string;
  cuit: string;
  condicionIva: string;
  direccion: string;
  localidad: string;
  contacto: string;
  notas: string;
};

type StockSupplierSelectorProps = {
  suppliers: Supplier[];
};

const emptySupplierForm: SupplierForm = {
  nombre: "",
  telefono: "",
  email: "",
  cuit: "",
  condicionIva: "",
  direccion: "",
  localidad: "",
  contacto: "",
  notas: "",
};

const inputClass =
  "mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300";

function supplierMeta(supplier: Supplier) {
  return [supplier.telefono, supplier.cuit, supplier.contacto]
    .filter(Boolean)
    .join(" - ");
}

export function StockSupplierSelector({ suppliers }: StockSupplierSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(
    emptySupplierForm,
  );
  const [supplierDraft, setSupplierDraft] =
    useState<SupplierForm>(emptySupplierForm);
  const selectedSupplier =
    suppliers.find((supplier) => supplier.id === selectedSupplierId) ?? null;
  const hasNewSupplier = !selectedSupplierId && supplierForm.nombre.trim();
  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return suppliers.slice(0, 6);
    }

    return suppliers
      .filter(
        (supplier) =>
          supplier.nombre.toLowerCase().includes(term) ||
          supplier.telefono?.toLowerCase().includes(term) ||
          supplier.email?.toLowerCase().includes(term) ||
          supplier.cuit?.toLowerCase().includes(term) ||
          supplier.contacto?.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [suppliers, query]);

  function openModal() {
    setSupplierDraft(hasNewSupplier ? supplierForm : emptySupplierForm);
    setIsModalOpen(true);
  }

  function updateSupplierDraft(key: keyof SupplierForm, value: string) {
    setSupplierDraft((current) => ({ ...current, [key]: value }));
  }

  function saveNewSupplier() {
    if (!supplierDraft.nombre.trim()) {
      return;
    }

    setSelectedSupplierId("");
    setSupplierForm(supplierDraft);
    setQuery(supplierDraft.nombre);
    setIsModalOpen(false);
  }

  function clearSupplier() {
    setSelectedSupplierId("");
    setSupplierForm(emptySupplierForm);
    setQuery("");
  }

  function closeModal() {
    setIsModalOpen(false);
    setSupplierDraft(emptySupplierForm);
  }

  function cancelModal() {
    setIsModalOpen(false);
    setSupplierDraft(emptySupplierForm);
  }

  return (
    <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
      <input type="hidden" name="proveedorId" value={selectedSupplierId} />
      <input type="hidden" name="proveedorNombre" value={supplierForm.nombre} />
      <input
        type="hidden"
        name="proveedorTelefono"
        value={supplierForm.telefono}
      />
      <input type="hidden" name="proveedorEmail" value={supplierForm.email} />
      <input type="hidden" name="proveedorCuit" value={supplierForm.cuit} />
      <input
        type="hidden"
        name="proveedorCondicionIva"
        value={supplierForm.condicionIva}
      />
      <input
        type="hidden"
        name="proveedorDireccion"
        value={supplierForm.direccion}
      />
      <input
        type="hidden"
        name="proveedorLocalidad"
        value={supplierForm.localidad}
      />
      <input
        type="hidden"
        name="proveedorContacto"
        value={supplierForm.contacto}
      />
      <input type="hidden" name="proveedorNotas" value={supplierForm.notas} />

      <div className="flex items-center justify-between gap-3">
        <label className="min-w-0 flex-1 text-sm font-semibold text-zinc-200">
          Proveedor
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, telefono, CUIT o contacto"
            className={inputClass}
          />
        </label>
        <button
          type="button"
          onClick={openModal}
          className="mt-7 h-11 rounded-md bg-lime-300 px-4 text-sm font-black text-black transition hover:bg-lime-200"
        >
          Crear
        </button>
      </div>

      {selectedSupplier || hasNewSupplier ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-lime-300/50 bg-lime-950/30 px-3 py-2">
          <div>
            <p className="text-sm font-black text-white">
              {selectedSupplier?.nombre ?? supplierForm.nombre}
            </p>
            <p className="text-xs text-zinc-500">
              {selectedSupplier
                ? supplierMeta(selectedSupplier) || "Proveedor existente"
                : [supplierForm.telefono, supplierForm.cuit, supplierForm.contacto]
                    .filter(Boolean)
                    .join(" - ") || "Proveedor nuevo"}
            </p>
          </div>
          <button
            type="button"
            onClick={clearSupplier}
            className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-lime-300"
          >
            Cambiar
          </button>
        </div>
      ) : null}

      <div className="mt-3 grid max-h-56 gap-2 overflow-y-auto rounded-md border border-white/10 bg-black p-2">
        {matches.map((supplier) => (
          <button
            key={supplier.id}
            type="button"
            onClick={() => {
              setSelectedSupplierId(supplier.id);
              setSupplierForm(emptySupplierForm);
              setQuery(supplier.nombre);
            }}
            className={
              selectedSupplierId === supplier.id
                ? "rounded-md border border-lime-300 bg-lime-950/40 px-3 py-2 text-left"
                : "rounded-md border border-white/10 px-3 py-2 text-left transition hover:border-lime-300"
            }
          >
            <span className="block text-sm font-bold text-white">
              {supplier.nombre}
            </span>
            <span className="mt-1 block text-xs text-zinc-500">
              {supplierMeta(supplier) || "Sin datos adicionales"}
            </span>
          </button>
        ))}

        {matches.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">
            No hay proveedores para esa busqueda.
          </p>
        ) : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  Proveedor
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Crear proveedor
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">
                Nombre
                <input
                  value={supplierDraft.nombre}
                  onChange={(event) =>
                    updateSupplierDraft("nombre", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Telefono
                <input
                  value={supplierDraft.telefono}
                  onChange={(event) =>
                    updateSupplierDraft("telefono", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Email
                <input
                  value={supplierDraft.email}
                  onChange={(event) =>
                    updateSupplierDraft("email", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                CUIT / Documento
                <input
                  value={supplierDraft.cuit}
                  onChange={(event) =>
                    updateSupplierDraft("cuit", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Condicion IVA
                <select
                  value={supplierDraft.condicionIva}
                  onChange={(event) =>
                    updateSupplierDraft("condicionIva", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">Sin especificar</option>
                  <option value="Responsable inscripto">
                    Responsable inscripto
                  </option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Consumidor final">Consumidor final</option>
                  <option value="Exento">Exento</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Contacto
                <input
                  value={supplierDraft.contacto}
                  onChange={(event) =>
                    updateSupplierDraft("contacto", event.target.value)
                  }
                  placeholder="Persona de contacto"
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Localidad
                <input
                  value={supplierDraft.localidad}
                  onChange={(event) =>
                    updateSupplierDraft("localidad", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Direccion
                <input
                  value={supplierDraft.direccion}
                  onChange={(event) =>
                    updateSupplierDraft("direccion", event.target.value)
                  }
                  className={inputClass}
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">
                Notas
                <textarea
                  value={supplierDraft.notas}
                  onChange={(event) =>
                    updateSupplierDraft("notas", event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelModal}
                className="rounded-md border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveNewSupplier}
                disabled={!supplierDraft.nombre.trim()}
                className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Usar proveedor
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
