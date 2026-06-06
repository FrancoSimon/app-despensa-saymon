"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { BarcodeScanner } from "@/components/pos/barcode-scanner";
import { createQuickCustomerAction } from "@/lib/customers/actions";
import { confirmCounterSaleAction } from "@/lib/sales/actions";
import {
  paymentMethodLabels,
  paymentMethodOptions,
} from "@/lib/sales/payment-methods";
import type { ConfirmSaleResult, PaymentMethod } from "@/lib/sales/types";
import type { Customer } from "@/lib/customers/types";
import type { Product } from "@/lib/products/types";

type CartItem = {
  product: Product;
  cantidad: number;
};

type Ticket = ConfirmSaleResult & {
  items: CartItem[];
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
  formaPago: PaymentMethod;
  clienteNombre: string | null;
};

type PosTerminalProps = {
  products: Product[];
  customers: Customer[];
  hasOpenCashRegister: boolean;
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function clampPercentage(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
}

export function PosTerminal({
  products,
  customers,
  hasOpenCashRegister,
}: PosTerminalProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerOptions, setCustomerOptions] = useState(customers);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    razonSocial: "",
    documentoTipo: "",
    documentoNumero: "",
    condicionIva: "",
    direccion: "",
    localidad: "",
    notas: "",
  });
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCreatingCustomer, startCustomerTransition] = useTransition();

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    if (!term) {
      return products.slice(0, 10);
    }

    const exactBarcode = products.find(
      (product) => product.codigoBarras?.toLowerCase() === term,
    );

    if (exactBarcode) {
      return [exactBarcode];
    }

    return products
      .filter(
        (product) =>
          product.nombre.toLowerCase().includes(term) ||
          product.categoria.toLowerCase().includes(term) ||
          product.codigoBarras?.toLowerCase().includes(term),
      )
      .slice(0, 10);
  }, [products, query]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.precioMostrador * item.cantidad,
    0,
  );
  const discountAmount = subtotal * (discount / 100);
  const surchargeAmount = (subtotal - discountAmount) * (surcharge / 100);
  const total = subtotal - discountAmount + surchargeAmount;
  const selectedCustomer =
    customerOptions.find((customer) => customer.id === selectedCustomerId) ??
    null;
  const customerMatches = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();

    if (!term) {
      return customerOptions.slice(0, 2);
    }

    return customerOptions
      .filter(
        (customer) =>
          customer.nombre.toLowerCase().includes(term) ||
          customer.telefono?.toLowerCase().includes(term) ||
          customer.email?.toLowerCase().includes(term) ||
          customer.razonSocial?.toLowerCase().includes(term) ||
          customer.documentoNumero?.toLowerCase().includes(term),
      )
      .slice(0, 6);
  }, [customerOptions, customerSearch]);

  function addProduct(product: Product) {
    setTicket(null);
    setError(null);
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        );
      }

      return [...current, { product, cantidad: 1 }];
    });
  }

  function updateQuantity(productId: string, cantidad: number) {
    setTicket(null);
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? { ...item, cantidad: Math.max(0, cantidad) }
            : item,
        )
        .filter((item) => item.cantidad > 0),
    );
  }

  function clearCart() {
    setCart([]);
    setTicket(null);
    setError(null);
  }

  function confirmSale() {
    setError(null);
    setTicket(null);

    if (!hasOpenCashRegister) {
      setError("Abri una caja antes de confirmar ventas.");
      return;
    }

    if (paymentMethod === "cuenta_corriente" && !selectedCustomerId) {
      setError("Selecciona un cliente para vender en cuenta corriente.");
      return;
    }

    const ticketItems = cart.map((item) => ({ ...item }));

    startTransition(async () => {
      try {
        const result = await confirmCounterSaleAction({
          items: cart.map((item) => ({
            productoId: item.product.id,
            cantidad: item.cantidad,
          })),
          descuentoPorcentaje: discount,
          recargoPorcentaje: surcharge,
          formaPago: paymentMethod,
          clienteId: selectedCustomerId || null,
        });

        setTicket({
          ...result,
          items: ticketItems,
          descuentoPorcentaje: discount,
          recargoPorcentaje: surcharge,
          formaPago: paymentMethod,
          clienteNombre: selectedCustomer?.nombre ?? null,
        });
        setCart([]);
        setDiscount(0);
        setSurcharge(0);
        setSelectedCustomerId("");
        setCustomerSearch("");
      } catch (saleError) {
        setError(
          saleError instanceof Error
            ? saleError.message
            : "No se pudo confirmar la venta.",
        );
      }
    });
  }

  function createCustomer() {
    setError(null);

    startCustomerTransition(async () => {
      try {
        const customer = await createQuickCustomerAction({
          nombre: customerForm.nombre,
          telefono: customerForm.telefono,
          email: customerForm.email,
          razonSocial: customerForm.razonSocial,
          documentoTipo: customerForm.documentoTipo,
          documentoNumero: customerForm.documentoNumero,
          condicionIva: customerForm.condicionIva,
          direccion: customerForm.direccion,
          localidad: customerForm.localidad,
          notas: customerForm.notas,
        });

        setCustomerOptions((current) =>
          [...current, customer].sort((a, b) => a.nombre.localeCompare(b.nombre)),
        );
        setSelectedCustomerId(customer.id);
        setCustomerSearch(customer.nombre);
        setCustomerForm({
          nombre: "",
          telefono: "",
          email: "",
          razonSocial: "",
          documentoTipo: "",
          documentoNumero: "",
          condicionIva: "",
          direccion: "",
          localidad: "",
          notas: "",
        });
        setIsCustomerModalOpen(false);
      } catch (customerError) {
        setError(
          customerError instanceof Error
            ? customerError.message
            : "No se pudo crear el cliente.",
        );
      }
    });
  }

  function updateCustomerForm(key: keyof typeof customerForm, value: string) {
    setCustomerForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {!hasOpenCashRegister ? (
        <div className="rounded-lg border border-yellow-300/30 bg-yellow-950/20 p-4 xl:col-span-2">
          <p className="font-bold text-yellow-100">Caja sin abrir</p>
          <p className="mt-1 text-sm text-yellow-100/80">
            Para confirmar ventas mostrador primero abri una caja.
          </p>
          <Link
            href="/vendedor/caja"
            className="mt-3 inline-block rounded-md bg-lime-300 px-4 py-2 text-sm font-black text-black transition hover:bg-lime-200"
          >
            Ir a caja
          </Link>
        </div>
      ) : null}
      <section className="rounded-lg border border-white/10 bg-black p-5">
        <BarcodeScanner products={products} onProductScanned={addProduct} />

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-zinc-200">
            Buscar producto
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, categoria o codigo de barras"
            className="h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          />
        </div>

        <div className="grid gap-3">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-950 p-3 text-left transition hover:border-lime-300 sm:grid-cols-[64px_1fr_auto]"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-black">
                {product.imagenUrl ? (
                  <Image
                    src={product.imagenUrl}
                    alt={product.nombre}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-zinc-600">
                    Sin foto
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-white">{product.nombre}</p>
                <p className="mt-1 text-sm text-zinc-400">{product.categoria}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Stock {product.stock}
                  {product.codigoBarras ? ` - ${product.codigoBarras}` : ""}
                </p>
              </div>
              <div className="font-black text-lime-300">
                {money(product.precioMostrador)}
              </div>
            </button>
          ))}
          {results.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
              No se encontraron productos.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-black p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">Carrito</h2>
          <button
            type="button"
            onClick={clearCart}
            className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-lime-300"
          >
            Vaciar
          </button>
        </div>

        <div className="grid gap-3">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="rounded-md border border-white/10 bg-zinc-950 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-white">{item.product.nombre}</p>
                  <p className="text-sm text-zinc-500">
                    {money(item.product.precioMostrador)} c/u
                  </p>
                </div>
                <p className="font-black text-lime-300">
                  {money(item.product.precioMostrador * item.cantidad)}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.cantidad - 1)}
                  className="grid size-9 place-items-center rounded-md border border-white/10 text-lg font-black"
                >
                  -
                </button>
                <input
                  value={item.cantidad}
                  onChange={(event) =>
                    updateQuantity(item.product.id, Number(event.target.value))
                  }
                  className="h-9 w-20 rounded-md border border-white/10 bg-black text-center text-white"
                  type="number"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.cantidad + 1)}
                  className="grid size-9 place-items-center rounded-md border border-white/10 text-lg font-black"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 0)}
                  className="ml-auto rounded-md border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-100"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
              Agrega productos para iniciar una venta.
            </p>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <label className="min-w-0 flex-1 text-sm font-semibold text-zinc-200">
                Cliente opcional
                <input
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Buscar por nombre, telefono o documento"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="mt-7 h-11 rounded-md bg-lime-300 px-4 text-sm font-black text-black transition hover:bg-lime-200"
              >
                Crear
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomerId("");
                  setCustomerSearch("");
                }}
                className={
                  selectedCustomerId
                    ? "rounded-md border border-white/10 px-3 py-2 text-left text-sm font-semibold text-zinc-300"
                    : "rounded-md bg-white/10 px-3 py-2 text-left text-sm font-black text-white"
                }
              >
                Consumidor final
              </button>
              {customerMatches.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                    setCustomerSearch(customer.nombre);
                  }}
                  className={
                    selectedCustomerId === customer.id
                      ? "rounded-md border border-lime-300 bg-lime-950/40 px-3 py-2 text-left"
                      : "rounded-md border border-white/10 px-3 py-2 text-left transition hover:border-lime-300"
                  }
                >
                  <span className="block text-sm font-bold text-white">
                    {customer.nombre}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">
                    {[customer.telefono, customer.documentoNumero]
                      .filter(Boolean)
                      .join(" - ") || "Sin datos de contacto"}
                  </span>
                </button>
              ))}
              {customerMatches.length === 0 ? (
                <p className="rounded-md border border-white/10 px-3 py-3 text-center text-sm text-zinc-500">
                  No hay clientes para esa busqueda.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-zinc-200">
              Descuento %
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(event) => setDiscount(clampPercentage(event.target.value))}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-lime-300"
              />
            </label>
            <label className="text-sm font-semibold text-zinc-200">
              Recargo %
              <input
                type="number"
                min="0"
                max="100"
                value={surcharge}
                onChange={(event) => setSurcharge(clampPercentage(event.target.value))}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-lime-300"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {paymentMethodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentMethod(option.value)}
                className={
                  paymentMethod === option.value
                    ? "rounded-md bg-lime-300 px-4 py-3 font-black text-black"
                    : "rounded-md border border-white/10 px-4 py-3 font-bold text-zinc-300"
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-zinc-400">
              <span>Descuento</span>
              <span>- {money(discountAmount)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm text-zinc-400">
              <span>Recargo</span>
              <span>+ {money(surchargeAmount)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-xl font-black text-white">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          {error ? (
            <p className="rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={confirmSale}
            disabled={cart.length === 0 || isPending || !hasOpenCashRegister}
            className="rounded-md bg-lime-300 px-5 py-4 font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Confirmando..." : "Confirmar venta"}
          </button>
        </div>

        {ticket ? (
          <div className="mt-5 rounded-md border border-lime-300/30 bg-lime-950/20 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-300">
              Ticket interno
            </p>
            <h3 className="mt-2 text-xl font-black text-white">SAYMON</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Venta {ticket.ventaId.slice(0, 8)} -{" "}
              {new Date(ticket.fecha).toLocaleString("es-AR")}
            </p>
            <div className="mt-4 grid gap-2">
              {ticket.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between gap-3 text-sm text-zinc-300"
                >
                  <span>
                    {item.cantidad} x {item.product.nombre}
                  </span>
                  <span>{money(item.product.precioMostrador * item.cantidad)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-3 text-sm text-zinc-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(ticket.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Descuento</span>
                <span>- {money(ticket.descuentoMonto)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Recargo</span>
                <span>+ {money(ticket.recargoMonto)}</span>
              </div>
              <div className="mt-2 flex justify-between text-lg font-black text-white">
                <span>Total</span>
                <span>{money(ticket.total)}</span>
              </div>
              <p className="mt-2 text-zinc-500">
                Forma de pago: {paymentMethodLabels[ticket.formaPago]}
              </p>
              {ticket.clienteNombre ? (
                <p className="mt-1 text-zinc-500">
                  Cliente: {ticket.clienteNombre}
                </p>
              ) : null}
            </div>
            <Link
              href={`/vendedor/ventas/${ticket.ventaId}/ticket`}
              className="mt-4 block rounded-md bg-lime-300 px-4 py-3 text-center text-sm font-black text-black transition hover:bg-lime-200"
            >
              Imprimir / guardar PDF
            </Link>
          </div>
        ) : null}
      </section>

      {isCustomerModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  Cliente
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Crear cliente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">
                Nombre
                <input
                  value={customerForm.nombre}
                  onChange={(event) =>
                    updateCustomerForm("nombre", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Telefono
                <input
                  value={customerForm.telefono}
                  onChange={(event) =>
                    updateCustomerForm("telefono", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Email
                <input
                  value={customerForm.email}
                  onChange={(event) =>
                    updateCustomerForm("email", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Razon social
                <input
                  value={customerForm.razonSocial}
                  onChange={(event) =>
                    updateCustomerForm("razonSocial", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Tipo documento
                <select
                  value={customerForm.documentoTipo}
                  onChange={(event) =>
                    updateCustomerForm("documentoTipo", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                >
                  <option value="">Sin documento</option>
                  <option value="DNI">DNI</option>
                  <option value="CUIT">CUIT</option>
                  <option value="CUIL">CUIL</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Numero documento
                <input
                  value={customerForm.documentoNumero}
                  onChange={(event) =>
                    updateCustomerForm("documentoNumero", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Condicion IVA
                <select
                  value={customerForm.condicionIva}
                  onChange={(event) =>
                    updateCustomerForm("condicionIva", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                >
                  <option value="">Sin especificar</option>
                  <option value="Consumidor final">Consumidor final</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Responsable inscripto">
                    Responsable inscripto
                  </option>
                  <option value="Exento">Exento</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Localidad
                <input
                  value={customerForm.localidad}
                  onChange={(event) =>
                    updateCustomerForm("localidad", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">
                Direccion
                <input
                  value={customerForm.direccion}
                  onChange={(event) =>
                    updateCustomerForm("direccion", event.target.value)
                  }
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200 sm:col-span-2">
                Notas
                <textarea
                  value={customerForm.notas}
                  onChange={(event) =>
                    updateCustomerForm("notas", event.target.value)
                  }
                  rows={3}
                  className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-lime-300"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="rounded-md border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createCustomer}
                disabled={isCreatingCustomer || !customerForm.nombre.trim()}
                className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreatingCustomer ? "Guardando..." : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
