"use client";

import Image from "next/image";
import {
  useActionState,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const INITIAL_PRODUCT_LIMIT = 8;
const SEARCH_PRODUCT_LIMIT = 18;
const ORDERS_PAGE_SIZE = 2;

const statusLabels: Record<WholesaleOrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  entregado: "Entregado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
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
  const deferredQuery = useDeferredValue(query);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const categorySelectRef = useRef<HTMLSelectElement | null>(null);
  const orderFormRef = useRef<HTMLFormElement | null>(null);
  const [category, setCategory] = useState("Todas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(
    deliveryOptions.at(0)?.value ?? "",
  );
  const [state, formAction, pending] = useActionState(
    createWholesaleOrderAction,
    initialState,
  );
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

  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(products.map((item) => item.categoria)))],
    [products],
  );

  const results = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    const limit =
      !term && category === "Todas" ? INITIAL_PRODUCT_LIMIT : SEARCH_PRODUCT_LIMIT;

    const exactBarcode = term ? productByBarcode.get(term) : null;

    if (exactBarcode) {
      return category === "Todas" || exactBarcode.categoria === category
        ? [exactBarcode]
        : [];
    }

    return products
      .map((product) => {
        const matchesCategory = category === "Todas" || product.categoria === category;
        const name = product.nombre.toLowerCase();
        const productCategory = product.categoria.toLowerCase();
        const barcode = product.codigoBarras?.toLowerCase() ?? "";
        let score = !term ? 1 : 0;

        if (term) {
          if (name.startsWith(term)) {
            score = 4;
          } else if (name.includes(term)) {
            score = 3;
          } else if (productCategory.includes(term)) {
            score = 2;
          } else if (barcode.includes(term)) {
            score = 1;
          }
        }

        return { product, score: matchesCategory ? score : 0 };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.product.nombre.localeCompare(b.product.nombre),
      )
      .map((item) => item.product)
      .slice(0, limit);
  }, [category, deferredQuery, productByBarcode, products]);

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
  const canSubmitOrder = cart.length > 0 && !pending && Boolean(deliveryDate);
  const confirmBlockMessage =
    cart.length === 0
      ? "Agrega productos para enviar el pedido."
      : !deliveryDate
        ? "Selecciona una fecha de entrega."
        : null;
  const ordersPageCount = Math.max(1, Math.ceil(orders.length / ORDERS_PAGE_SIZE));
  const safeOrdersPage = Math.min(ordersPage, ordersPageCount);
  const visibleOrders = orders.slice(
    (safeOrdersPage - 1) * ORDERS_PAGE_SIZE,
    safeOrdersPage * ORDERS_PAGE_SIZE,
  );
  const hasPreviousOrders = safeOrdersPage > 1;
  const hasNextOrders = safeOrdersPage < ordersPageCount;

  function addProduct(product: Product) {
    setIsConfirmOpen(false);
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
    setIsConfirmOpen(false);
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
    setIsConfirmOpen(false);
  }

  const requestConfirmOrder = useCallback(() => {
    if (confirmBlockMessage) {
      return;
    }

    setIsConfirmOpen(true);
  }, [confirmBlockMessage]);

  const submitOrder = useCallback(() => {
    if (pending || confirmBlockMessage) {
      return;
    }

    setIsConfirmOpen(false);
    orderFormRef.current?.requestSubmit();
  }, [confirmBlockMessage, pending]);

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
          submitOrder();
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
        categorySelectRef.current?.focus();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        requestConfirmOrder();
        return;
      }

      if (event.key === "Escape" && !isTyping) {
        setQuery("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isConfirmOpen, requestConfirmOrder, submitOrder]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-white/10 bg-black p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label
            htmlFor="wholesale-product-search"
            className="text-sm font-semibold text-zinc-200"
          >
            <span className="flex items-center justify-between gap-3">
              Buscar producto
              <span className="hidden text-xs font-semibold text-zinc-600 sm:inline">
                / buscar - Enter agregar
              </span>
            </span>
            <input
              id="wholesale-product-search"
              ref={searchInputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Nombre, categoria o codigo"
              className="mt-2 h-12 w-full rounded-md border border-white/10 bg-zinc-950 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
            />
          </label>
          <label
            htmlFor="wholesale-category"
            className="text-sm font-semibold text-zinc-200"
          >
            <span className="flex items-center justify-between gap-3">
              Categoria
              <span className="hidden text-xs font-semibold text-zinc-600 sm:inline">
                F2
              </span>
            </span>
            <select
              id="wholesale-category"
              ref={categorySelectRef}
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
        {query.trim() ? (
          <p className="mt-3 text-xs font-semibold text-zinc-500">
            {results.length} coincidencias
          </p>
        ) : null}

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
        <section className="rounded-lg border border-white/10 bg-black p-4 sm:p-5 xl:sticky xl:top-4 xl:self-start">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Nuevo pedido</h2>
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

          <form ref={orderFormRef} action={formAction} className="grid gap-4">
            <input type="hidden" name="items" value={serializedItems} />

            <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
              {cart.map((item) => {
                const unitPrice = wholesaleUnitPrice(item.product, item.cantidad);
                const isSpecial = unitPrice === item.product.precioMayoristaEspecial;

                return (
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
                          {money(unitPrice)} c/u
                          {isSpecial ? " - precio especial" : ""}
                        </p>
                      </div>
                      <p className="font-black text-lime-300 sm:text-right">
                        {money(unitPrice * item.cantidad)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.cantidad - 1)
                        }
                        className="grid size-8 place-items-center rounded-md border border-white/10 text-base font-black"
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
                        className="h-8 w-16 rounded-md border border-white/10 bg-black text-center text-sm text-white"
                        type="number"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.cantidad + 1)
                        }
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
            {confirmBlockMessage && cart.length > 0 ? (
              <p className="rounded-md border border-yellow-300/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-100">
                {confirmBlockMessage}
              </p>
            ) : null}

            <button
              type="button"
              onClick={requestConfirmOrder}
              disabled={!canSubmitOrder}
              className="rounded-md bg-lime-300 px-5 py-4 font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Enviando..." : "Enviar pedido pendiente"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Mis pedidos</h2>
              {orders.length > 0 ? (
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Pagina {safeOrdersPage} de {ordersPageCount} - {orders.length}{" "}
                  pedidos
                </p>
              ) : null}
            </div>
            {orders.length > ORDERS_PAGE_SIZE ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setOrdersPage((current) => Math.max(1, current - 1))
                  }
                  disabled={!hasPreviousOrders}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-lime-300 disabled:cursor-not-allowed disabled:text-zinc-700"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOrdersPage((current) =>
                      Math.min(ordersPageCount, current + 1),
                    )
                  }
                  disabled={!hasNextOrders}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-lime-300 disabled:cursor-not-allowed disabled:text-zinc-700"
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-md border border-white/10 bg-zinc-950 p-3"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Entrega {formatDate(order.fechaEntregaDeseada)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                    <span className="rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black">
                      {statusLabels[order.estado]}
                    </span>
                    <p className="font-black text-lime-300 sm:mt-3">
                      {money(order.total)}
                    </p>
                  </div>
                </div>
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

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
              Confirmar pedido
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Revisar antes de enviar
            </h3>
            <div className="mt-5 grid gap-3 rounded-md border border-white/10 bg-black p-4 text-sm">
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Productos</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between gap-3 text-zinc-400">
                <span>Entrega</span>
                <span>{deliveryDate ? formatDate(deliveryDate) : "-"}</span>
              </div>
              <div className="grid max-h-40 gap-2 overflow-y-auto border-y border-white/10 py-3">
                {cart.map((item) => {
                  const unitPrice = wholesaleUnitPrice(item.product, item.cantidad);

                  return (
                    <div
                      key={item.product.id}
                      className="flex justify-between gap-3 text-zinc-300"
                    >
                      <span className="min-w-0 truncate">
                        {item.cantidad} x {item.product.nombre}
                      </span>
                      <span>{money(unitPrice * item.cantidad)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between gap-3 text-xl font-black text-white">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
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
                onClick={submitOrder}
                disabled={pending}
                className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Enviando..." : "Confirmar y enviar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-600">
              Atajo: Ctrl + Enter confirma desde este cuadro.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
