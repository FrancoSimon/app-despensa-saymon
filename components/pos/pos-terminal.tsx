"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { confirmCounterSaleAction } from "@/lib/sales/actions";
import {
  paymentMethodLabels,
  paymentMethodOptions,
} from "@/lib/sales/payment-methods";
import type { ConfirmSaleResult, PaymentMethod } from "@/lib/sales/types";
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
};

type PosTerminalProps = {
  products: Product[];
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

export function PosTerminal({ products }: PosTerminalProps) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [surcharge, setSurcharge] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isPending, startTransition] = useTransition();

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
        });

        setTicket({
          ...result,
          items: ticketItems,
          descuentoPorcentaje: discount,
          recargoPorcentaje: surcharge,
          formaPago: paymentMethod,
        });
        setCart([]);
        setDiscount(0);
        setSurcharge(0);
      } catch (saleError) {
        setError(
          saleError instanceof Error
            ? saleError.message
            : "No se pudo confirmar la venta.",
        );
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-lg border border-white/10 bg-black p-5">
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
            disabled={cart.length === 0 || isPending}
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
    </div>
  );
}
