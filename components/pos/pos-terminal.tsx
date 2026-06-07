"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
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
  montoRecibido: number | null;
  vuelto: number | null;
};

type PosTerminalProps = {
  products: Product[];
  customers: Customer[];
  hasOpenCashRegister: boolean;
};

const INITIAL_PRODUCT_LIMIT = 6;
const SEARCH_PRODUCT_LIMIT = 12;

const paymentShortcutKeys = ["1", "2", "3", "4", "5", "6"];

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
  const deferredQuery = useDeferredValue(query);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const customerInputRef = useRef<HTMLInputElement | null>(null);
  const cashReceivedInputRef = useRef<HTMLInputElement | null>(null);
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
  const [cashReceived, setCashReceived] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isCreatingCustomer, startCustomerTransition] = useTransition();
  const productByBarcode = useMemo(() => {
    const map = new Map<string, Product>();

    for (const product of products) {
      const barcode = product.codigoBarras?.trim().toLowerCase();

      if (barcode) {
        map.set(barcode, product);
      }
    }

    return map;
  }, [products]);

  const results = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();

    if (!term) {
      return products.slice(0, INITIAL_PRODUCT_LIMIT);
    }

    const exactBarcode = productByBarcode.get(term);

    if (exactBarcode) {
      return [exactBarcode];
    }

    return products
      .map((product) => {
        const name = product.nombre.toLowerCase();
        const category = product.categoria.toLowerCase();
        const barcode = product.codigoBarras?.toLowerCase() ?? "";
        let score = 0;

        if (name.startsWith(term)) {
          score = 4;
        } else if (name.includes(term)) {
          score = 3;
        } else if (category.includes(term)) {
          score = 2;
        } else if (barcode.includes(term)) {
          score = 1;
        }

        return { product, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.product.nombre.localeCompare(b.product.nombre),
      )
      .map((item) => item.product)
      .slice(0, SEARCH_PRODUCT_LIMIT);
  }, [deferredQuery, productByBarcode, products]);

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
  const needsCustomer = paymentMethod === "cuenta_corriente";
  const isCashPayment = paymentMethod === "efectivo";
  const cashReceivedAmount = cashReceived.trim() ? Number(cashReceived) : 0;
  const hasEnoughCash =
    !isCashPayment ||
    (Number.isFinite(cashReceivedAmount) && cashReceivedAmount >= total);
  const cashChange =
    isCashPayment && Number.isFinite(cashReceivedAmount)
      ? Math.max(0, cashReceivedAmount - total)
      : 0;
  const canConfirmSale =
    hasOpenCashRegister &&
    cart.length > 0 &&
    !isPending &&
    (!needsCustomer || Boolean(selectedCustomerId));
  const confirmBlockMessage = !hasOpenCashRegister
    ? "Abri una caja antes de confirmar ventas."
    : cart.length === 0
      ? "Agrega productos para confirmar una venta."
      : needsCustomer && !selectedCustomerId
        ? "Selecciona un cliente para vender en cuenta corriente."
        : null;
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
    setIsConfirmOpen(false);
    setCashReceived("");
  }

  const requestConfirmSale = useCallback(() => {
    setError(null);
    setTicket(null);

    if (confirmBlockMessage) {
      setError(confirmBlockMessage);
      return;
    }

    setIsConfirmOpen(true);
  }, [confirmBlockMessage]);

  const submitSale = useCallback(() => {
    if (isPending || confirmBlockMessage || !hasEnoughCash) {
      return;
    }

    setError(null);
    setTicket(null);
    setIsConfirmOpen(false);

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
          montoRecibido: isCashPayment ? cashReceivedAmount : null,
          vuelto: isCashPayment ? cashChange : null,
        });
        setCart([]);
        setDiscount(0);
        setSurcharge(0);
        setCashReceived("");
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
  }, [
    cart,
    confirmBlockMessage,
    discount,
    hasEnoughCash,
    isPending,
    isCashPayment,
    cashChange,
    cashReceivedAmount,
    paymentMethod,
    selectedCustomer,
    selectedCustomerId,
    surcharge,
  ]);

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    const product = results[0];

    if (product) {
      addProduct(product);
      setQuery("");
    }
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

  useEffect(() => {
    if (isConfirmOpen && isCashPayment) {
      cashReceivedInputRef.current?.focus();
    }
  }, [isCashPayment, isConfirmOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;

      if (isConfirmOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsConfirmOpen(false);
        }

        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          submitSale();
        }

        return;
      }

      if (isCustomerModalOpen) {
        if (event.key === "Escape") {
          event.preventDefault();
          setIsCustomerModalOpen(false);
        }

        return;
      }

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === "F2") {
        event.preventDefault();
        customerInputRef.current?.focus();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        requestConfirmSale();
        return;
      }

      if (event.altKey) {
        const index = paymentShortcutKeys.indexOf(event.key);
        const option = paymentMethodOptions[index];

        if (option) {
          event.preventDefault();
          setPaymentMethod(option.value);

          if (option.value !== "efectivo") {
            setCashReceived("");
          }
        }
      }

      if (event.key === "Escape" && !isTyping) {
        setQuery("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isConfirmOpen,
    isCustomerModalOpen,
    requestConfirmSale,
    submitSale,
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
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
      <section className="rounded-lg border border-white/10 bg-black p-4 sm:p-5">
        <BarcodeScanner products={products} onProductScanned={addProduct} />

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="pos-product-search"
              className="block text-sm font-semibold text-zinc-200"
            >
              Buscar producto
            </label>
            <span className="hidden text-xs font-semibold text-zinc-600 sm:block">
              / buscar - Enter agregar
            </span>
          </div>
          <input
            id="pos-product-search"
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Nombre, categoria o codigo de barras"
            className="h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          />
          {query.trim() ? (
            <p className="mt-2 text-xs font-semibold text-zinc-500">
              {results.length} coincidencias
            </p>
          ) : null}
        </div>

        <div className="grid gap-3">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              className="grid gap-3 rounded-md border border-white/10 bg-zinc-950 p-3 text-left transition hover:border-lime-300 sm:grid-cols-[64px_1fr_auto] sm:items-center"
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
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-white">
                  {product.nombre}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{product.categoria}</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Stock {product.stock}
                  {product.codigoBarras ? ` - ${product.codigoBarras}` : ""}
                </p>
              </div>
              <div className="font-black text-lime-300 sm:text-right">
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

      <section className="rounded-lg border border-white/10 bg-black p-4 sm:p-5 xl:sticky xl:top-4 xl:self-start">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">Carrito</h2>
            <p className="mt-1 text-xs font-semibold text-zinc-600">
              Ctrl + Enter confirmar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 ? (
              <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-black text-zinc-300">
                {cart.length}
              </span>
            ) : null}
            <button
              type="button"
              onClick={clearCart}
              className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-lime-300"
            >
              Vaciar
            </button>
          </div>
        </div>

        <div className="grid max-h-[340px] gap-2 overflow-y-auto pr-1">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="rounded-md border border-white/10 bg-zinc-950 p-2.5"
            >
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">
                    {item.product.nombre}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {money(item.product.precioMostrador)} c/u
                  </p>
                </div>
                <p className="font-black text-lime-300 sm:text-right">
                  {money(item.product.precioMostrador * item.cantidad)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.cantidad - 1)}
                  className="grid size-8 place-items-center rounded-md border border-white/10 text-base font-black"
                >
                  -
                </button>
                <input
                  value={item.cantidad}
                  onChange={(event) =>
                    updateQuantity(item.product.id, Number(event.target.value))
                  }
                  className="h-8 w-16 rounded-md border border-white/10 bg-black text-center text-sm text-white"
                  type="number"
                  min="1"
                />
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.cantidad + 1)}
                  className="grid size-8 place-items-center rounded-md border border-white/10 text-base font-black"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 0)}
                  className="ml-auto rounded-md border border-red-400/30 px-2.5 py-1.5 text-xs font-semibold text-red-100"
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
                  ref={customerInputRef}
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
            {paymentMethodOptions.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setPaymentMethod(option.value);

                  if (option.value !== "efectivo") {
                    setCashReceived("");
                  }
                }}
                className={
                  paymentMethod === option.value
                    ? "rounded-md bg-lime-300 px-4 py-3 font-black text-black"
                    : "rounded-md border border-white/10 px-4 py-3 font-bold text-zinc-300"
                }
              >
                <span>{option.label}</span>
                <span className="ml-2 text-xs opacity-60">
                  Alt+{index + 1}
                </span>
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
          {confirmBlockMessage && cart.length > 0 ? (
            <p className="rounded-md border border-yellow-300/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-100">
              {confirmBlockMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={requestConfirmSale}
            disabled={!canConfirmSale}
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
              {ticket.formaPago === "efectivo" &&
              ticket.montoRecibido !== null &&
              ticket.vuelto !== null ? (
                <div className="mt-3 rounded-md border border-white/10 bg-black px-3 py-2">
                  <div className="flex justify-between">
                    <span>Recibido</span>
                    <span>{money(ticket.montoRecibido)}</span>
                  </div>
                  <div className="mt-1 flex justify-between font-black text-lime-300">
                    <span>Vuelto</span>
                    <span>{money(ticket.vuelto)}</span>
                  </div>
                </div>
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

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
              Confirmar venta
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Revisar antes de cobrar
            </h3>
            <div className="mt-5 grid gap-3 rounded-md border border-white/10 bg-black p-4 text-sm">
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Productos</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Descuento</span>
                <span>- {money(discountAmount)}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Recargo</span>
                <span>+ {money(surchargeAmount)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-3 text-xl font-black text-white">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Pago</span>
                <span>{paymentMethodLabels[paymentMethod]}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Cliente</span>
                <span>{selectedCustomer?.nombre ?? "Consumidor final"}</span>
              </div>
              {isCashPayment ? (
                <div className="grid gap-3 border-t border-white/10 pt-3">
                  <label className="text-sm font-semibold text-zinc-200">
                    Monto recibido
                    <input
                      ref={cashReceivedInputRef}
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashReceived}
                      onChange={(event) => setCashReceived(event.target.value)}
                      className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
                    />
                  </label>
                  <div
                    className={
                      hasEnoughCash
                        ? "rounded-md border border-lime-300/30 bg-lime-950/20 px-3 py-2"
                        : "rounded-md border border-yellow-300/30 bg-yellow-950/20 px-3 py-2"
                    }
                  >
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-zinc-400">Vuelto</span>
                      <span
                        className={
                          hasEnoughCash
                            ? "font-black text-lime-300"
                            : "font-black text-yellow-200"
                        }
                      >
                        {money(cashChange)}
                      </span>
                    </div>
                    {!hasEnoughCash ? (
                      <p className="mt-1 text-xs text-yellow-100">
                        El monto recibido debe cubrir el total.
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-md border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Revisar
              </button>
              <button
                type="button"
                onClick={submitSale}
                disabled={isPending || !hasEnoughCash}
                className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Confirmando..." : "Confirmar y guardar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              Atajo: Ctrl + Enter confirma desde este cuadro.
            </p>
          </div>
        </div>
      ) : null}

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
