"use client";

import Image from "next/image";
import { useActionState, useMemo, useState } from "react";
import { createWholesaleOrderAction } from "@/lib/wholesale/actions";
import type { Product } from "@/lib/products/types";
import type {
  CreateWholesaleOrderState,
  WholesaleOrder,
  WholesaleOrderStatus,
} from "@/lib/wholesale/types";

type CartItem = {
  product: Product;
  cantidad: number;
};

type DeliveryOption = {
  value: string;
  label: string;
};

type WholesaleOrderTerminalProps = {
  products: Product[];
  deliveryOptions: DeliveryOption[];
  orders: WholesaleOrder[];
};

const initialState: CreateWholesaleOrderState = {
  ok: false,
  message: null,
  order: null,
};

const statusLabels: Record<WholesaleOrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  entregado: "Entregado",
  rechazado: "Rechazado",
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function wholesaleUnitPrice(product: Product, quantity: number) {
  if (
    product.precioMayoristaEspecial !== null &&
    product.cantidadEspecial > 0 &&
    quantity >= product.cantidadEspecial
  ) {
    return product.precioMayoristaEspecial;
  }

  return product.precioMayoristaFijo;
}

export function WholesaleOrderTerminal({
  products,
  deliveryOptions,
  orders,
}: WholesaleOrderTerminalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(
    deliveryOptions.at(0)?.value ?? "",
  );
  const [state, formAction, pending] = useActionState(
    createWholesaleOrderAction,
    initialState,
  );

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(products.map((item) => item.categoria)))],
    [products],
  );

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products
      .filter((product) => {
        const matchesCategory = category === "Todas" || product.categoria === category;
        const matchesQuery =
          !term ||
          product.nombre.toLowerCase().includes(term) ||
          product.categoria.toLowerCase().includes(term) ||
          product.codigoBarras?.toLowerCase().includes(term);

        return matchesCategory && matchesQuery;
      })
      .slice(0, 18);
  }, [category, products, query]);

  const serializedItems = JSON.stringify(
    cart.map((item) => ({
      productoId: item.product.id,
      cantidad: item.cantidad,
    })),
  );

  const total = cart.reduce(
    (sum, item) =>
      sum + wholesaleUnitPrice(item.product, item.cantidad) * item.cantidad,
    0,
  );

  function addProduct(product: Product) {
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-lg border border-white/10 bg-black p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="text-sm font-semibold text-zinc-200">
            Buscar producto
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, categoria o codigo"
              className="mt-2 h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
            />
          </label>
          <label className="text-sm font-semibold text-zinc-200">
            Categoria
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {results.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addProduct(product)}
              className="grid min-h-32 gap-3 rounded-md border border-white/10 bg-zinc-950 p-3 text-left transition hover:border-lime-300 sm:grid-cols-[84px_1fr]"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-black">
                {product.imagenUrl ? (
                  <Image
                    src={product.imagenUrl}
                    alt={product.nombre}
                    fill
                    sizes="84px"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-zinc-600">
                    Sin foto
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold text-white">{product.nombre}</p>
                <p className="mt-1 text-sm text-zinc-400">{product.categoria}</p>
                <p className="mt-3 text-lg font-black text-lime-300">
                  {money(product.precioMayoristaFijo)}
                </p>
                {product.precioMayoristaEspecial !== null &&
                product.cantidadEspecial > 0 ? (
                  <p className="mt-1 text-xs text-zinc-500">
                    Especial desde {product.cantidadEspecial}:{" "}
                    {money(product.precioMayoristaEspecial)}
                  </p>
                ) : null}
              </div>
            </button>
          ))}
          {results.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400 md:col-span-2">
              No hay productos mayoristas para esta busqueda.
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Nuevo pedido</h2>
            <button
              type="button"
              onClick={() => setCart([])}
              className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-lime-300"
            >
              Vaciar
            </button>
          </div>

          <form action={formAction} className="grid gap-4">
            <input type="hidden" name="items" value={serializedItems} />

            <div className="grid gap-3">
              {cart.map((item) => {
                const unitPrice = wholesaleUnitPrice(item.product, item.cantidad);
                const isSpecial = unitPrice === item.product.precioMayoristaEspecial;

                return (
                  <div
                    key={item.product.id}
                    className="rounded-md border border-white/10 bg-zinc-950 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">{item.product.nombre}</p>
                        <p className="text-sm text-zinc-500">
                          {money(unitPrice)} c/u
                          {isSpecial ? " - precio especial" : ""}
                        </p>
                      </div>
                      <p className="font-black text-lime-300">
                        {money(unitPrice * item.cantidad)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.cantidad - 1)
                        }
                        className="grid size-9 place-items-center rounded-md border border-white/10 text-lg font-black"
                      >
                        -
                      </button>
                      <input
                        value={item.cantidad}
                        onChange={(event) =>
                          updateQuantity(
                            item.product.id,
                            Number(event.target.value),
                          )
                        }
                        className="h-9 w-20 rounded-md border border-white/10 bg-black text-center text-white"
                        type="number"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.cantidad + 1)
                        }
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
                );
              })}
              {cart.length === 0 ? (
                <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
                  Agrega productos desde el catalogo.
                </p>
              ) : null}
            </div>

            <label className="text-sm font-semibold text-zinc-200">
              Entrega
              <select
                name="fechaEntregaDeseada"
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
              >
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-semibold text-zinc-200">
              Comentario
              <textarea
                name="comentario"
                rows={3}
                placeholder="Opcional"
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
              />
            </label>

            <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
              <div className="flex justify-between text-xl font-black text-white">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>

            {state.message ? (
              <p
                className={
                  state.ok
                    ? "rounded-md border border-lime-300/30 bg-lime-950/20 px-4 py-3 text-sm text-lime-100"
                    : "rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100"
                }
              >
                {state.message}
                {state.order ? ` #${state.order.pedidoId.slice(0, 8)}` : ""}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={cart.length === 0 || pending || !deliveryDate}
              className="rounded-md bg-lime-300 px-5 py-4 font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Enviar pedido pendiente"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="mb-4 text-xl font-black text-white">Mis pedidos</h2>
          <div className="grid gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-md border border-white/10 bg-zinc-950 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Entrega {formatDate(order.fechaEntregaDeseada)}
                    </p>
                  </div>
                  <span className="rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black">
                    {statusLabels[order.estado]}
                  </span>
                </div>
                <p className="mt-3 text-lg font-black text-lime-300">
                  {money(order.total)}
                </p>
              </div>
            ))}
            {orders.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
                Todavia no hay pedidos cargados.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
