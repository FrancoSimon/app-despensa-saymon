"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { manageWholesaleOrderAction } from "@/lib/wholesale/admin-actions";
import type {
  AdminWholesaleOrder,
  AdminWholesaleOrderActionState,
  WholesaleOrderStatus,
} from "@/lib/wholesale/types";

type AdminPendingOrdersProps = {
  orders: AdminWholesaleOrder[];
  selectedStatus: WholesaleOrderStatus | "todos";
  deliveryOptions: {
    value: string;
    label: string;
  }[];
  returnHref?: string | null;
};

const initialState: AdminWholesaleOrderActionState = {
  ok: false,
  message: null,
};

const statusOptions: { value: WholesaleOrderStatus | "todos"; label: string }[] = [
  { value: "pendiente", label: "Pendientes" },
  { value: "confirmado", label: "Confirmados" },
  { value: "entregado", label: "Entregados" },
  { value: "rechazado", label: "Rechazados" },
  { value: "cancelado", label: "Cancelados" },
  { value: "todos", label: "Todos" },
];

const statusLabels: Record<WholesaleOrderStatus, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  entregado: "Entregado",
  rechazado: "Rechazado",
  cancelado: "Cancelado",
};

type ConfirmRequest = {
  description: string;
  formKey: string;
  title: string;
  confirmLabel: string;
  tone?: "default" | "danger";
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPendingOrders({
  orders,
  selectedStatus,
  deliveryOptions,
  returnHref,
}: AdminPendingOrdersProps) {
  const [state, formAction, pending] = useActionState(
    manageWholesaleOrderAction,
    initialState,
  );
  const formRefs = useRef<Record<string, HTMLFormElement | null>>({});
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(
    null,
  );
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function setFormRef(key: string, node: HTMLFormElement | null) {
    formRefs.current[key] = node;
  }

  function requestActionConfirm(config: ConfirmRequest) {
    const form = formRefs.current[config.formKey];
    const formData = form ? new FormData(form) : null;
    const actionType = formData?.get("actionType");

    if (formData && actionType === "cancelar") {
      const motivo = formData.get("motivoCancelacion");

      if (typeof motivo !== "string" || !motivo.trim()) {
        setValidationMessage("Ingresa el motivo de cancelacion.");
        return;
      }
    }

    setValidationMessage(null);
    setConfirmRequest(config);
  }

  function submitConfirmedAction() {
    if (!confirmRequest) {
      return;
    }

    formRefs.current[confirmRequest.formKey]?.requestSubmit();
    setConfirmRequest(null);
  }

  return (
    <div className="grid gap-5">
      <nav className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const query = new URLSearchParams();

          if (option.value !== "pendiente") {
            query.set("estado", option.value);
          }

          if (returnHref) {
            query.set("volver", returnHref);
          }

          const href = query.toString()
            ? `/admin/pedidos?${query.toString()}`
            : "/admin/pedidos";

          return (
            <Link
              key={option.value}
              href={href}
              className={
                selectedStatus === option.value
                  ? "rounded-md bg-lime-300 px-3 py-2 text-sm font-black text-black"
                  : "rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              }
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-md border border-lime-300/30 bg-lime-950/20 px-4 py-3 text-sm text-lime-100"
              : "rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100"
          }
        >
          {state.message}
        </p>
      ) : null}
      {validationMessage ? (
        <p className="rounded-md border border-yellow-300/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-100">
          {validationMessage}
        </p>
      ) : null}

      {orders.map((order) => {
        const hasStockIssue = order.items.some(
          (item) => item.stockActual !== null && item.stockActual < item.cantidad,
        );

        return (
          <article
            key={order.id}
            className="rounded-lg border border-white/10 bg-black p-5"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black text-white">
                    Pedido #{order.id.slice(0, 8)}
                  </h2>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-black uppercase text-zinc-200">
                    {statusLabels[order.estado]}
                  </span>
                  {hasStockIssue ? (
                    <span className="rounded-md bg-yellow-300 px-2 py-1 text-xs font-black uppercase text-black">
                      Revisar stock
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {order.mayorista.nombre} - {order.mayorista.email}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {order.mayorista.localidad ?? "Sin localidad"}
                  {order.mayorista.telefono
                    ? ` - ${order.mayorista.telefono}`
                    : ""}
                </p>
              </div>
              <div className="text-left lg:text-right">
                <p className="text-2xl font-black text-lime-300">
                  {money(order.total)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Pedido {formatDateTime(order.fechaPedido)}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Deseada {formatDate(order.fechaEntregaDeseada)}
                </p>
              </div>
            </div>

            {order.comentario ? (
              <p className="mt-4 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                {order.comentario}
              </p>
            ) : null}

            <div className="mt-5 overflow-hidden rounded-md border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                    <tr>
                      <th className="px-3 py-3">Producto</th>
                      <th className="px-3 py-3">Cantidad</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Precio</th>
                      <th className="px-3 py-3">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => {
                      const stockIssue =
                        item.stockActual !== null &&
                        item.stockActual < item.cantidad;

                      return (
                        <tr key={item.id} className="border-t border-white/10">
                          <td className="px-3 py-3">
                            <p className="font-semibold text-white">
                              {item.productoNombre}
                            </p>
                            {item.precioEspecialAplicado ? (
                              <p className="mt-1 text-xs text-lime-300">
                                Precio especial aplicado
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3 text-zinc-300">
                            {item.cantidad}
                          </td>
                          <td
                            className={
                              stockIssue
                                ? "px-3 py-3 font-black text-yellow-200"
                                : "px-3 py-3 text-zinc-300"
                            }
                          >
                            {item.stockActual ?? "N/D"}
                          </td>
                          <td className="px-3 py-3 text-zinc-300">
                            {money(item.precioUnitario)}
                          </td>
                          <td className="px-3 py-3 font-bold text-white">
                            {money(item.subtotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {order.estado === "pendiente" ? (
              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <form
                  ref={(node) => setFormRef(`confirmar-${order.id}`, node)}
                  action={formAction}
                  className="grid gap-3"
                >
                  <input type="hidden" name="actionType" value="confirmar" />
                  <input type="hidden" name="pedidoId" value={order.id} />
                  <label className="text-sm font-semibold text-zinc-200">
                    Fecha asignada
                    <select
                      name="fechaEntregaAsignada"
                      defaultValue={order.fechaEntregaDeseada}
                      className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
                    >
                      <option value={order.fechaEntregaDeseada}>
                        Solicitada: {formatDate(order.fechaEntregaDeseada)}
                      </option>
                      {deliveryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      requestActionConfirm({
                        formKey: `confirmar-${order.id}`,
                        title: "Confirmar pedido",
                        description:
                          "Se descontara el stock disponible y el pedido pasara a confirmado.",
                        confirmLabel: "Confirmar pedido",
                      });
                    }}
                    className="rounded-md bg-lime-300 px-4 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Confirmar y descontar stock
                  </button>
                </form>

                <form
                  ref={(node) => setFormRef(`rechazar-${order.id}`, node)}
                  action={formAction}
                  className="grid gap-3"
                >
                  <input type="hidden" name="actionType" value="rechazar" />
                  <input type="hidden" name="pedidoId" value={order.id} />
                  <label className="text-sm font-semibold text-zinc-200">
                    Motivo de rechazo
                    <textarea
                      name="motivoRechazo"
                      rows={3}
                      placeholder="Opcional"
                      className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      requestActionConfirm({
                        formKey: `rechazar-${order.id}`,
                        title: "Rechazar pedido",
                        description:
                          "El pedido quedara rechazado y no se descontara stock.",
                        confirmLabel: "Rechazar pedido",
                        tone: "danger",
                      });
                    }}
                    className="rounded-md border border-red-400/30 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Rechazar pedido
                  </button>
                </form>
              </div>
            ) : null}

            {order.estado === "confirmado" ? (
              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <form
                  ref={(node) => setFormRef(`entregar-${order.id}`, node)}
                  action={formAction}
                >
                  <input type="hidden" name="actionType" value="entregar" />
                  <input type="hidden" name="pedidoId" value={order.id} />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      requestActionConfirm({
                        formKey: `entregar-${order.id}`,
                        title: "Marcar como entregado",
                        description:
                          "El pedido pasara a entregado y quedara cerrado para seguimiento.",
                        confirmLabel: "Marcar entregado",
                      });
                    }}
                    className="w-full rounded-md bg-lime-300 px-4 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Marcar como entregado
                  </button>
                </form>

                <form
                  ref={(node) => setFormRef(`cancelar-${order.id}`, node)}
                  action={formAction}
                  className="grid gap-3"
                  noValidate
                >
                  <input type="hidden" name="actionType" value="cancelar" />
                  <input type="hidden" name="pedidoId" value={order.id} />
                  <label className="text-sm font-semibold text-zinc-200">
                    Motivo de cancelacion
                    <textarea
                      name="motivoCancelacion"
                      rows={3}
                      className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none transition focus:border-red-300"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      requestActionConfirm({
                        formKey: `cancelar-${order.id}`,
                        title: "Cancelar pedido",
                        description:
                          "Se cancelara el pedido y se repondra el stock descontado.",
                        confirmLabel: "Cancelar pedido",
                        tone: "danger",
                      });
                    }}
                    className="rounded-md border border-red-400/30 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar y reponer stock
                  </button>
                </form>
              </div>
            ) : null}

            {(order.estado === "rechazado" || order.estado === "cancelado") &&
            order.motivoRechazo ? (
              <p className="mt-5 rounded-md border border-red-400/30 bg-red-950/30 px-3 py-2 text-sm text-red-100">
                Motivo: {order.motivoRechazo}
              </p>
            ) : null}
          </article>
        );
      })}

      {orders.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-black p-8 text-center text-zinc-400">
          No hay pedidos mayoristas para este filtro.
        </p>
      ) : null}
      <ConfirmDialog
        isOpen={confirmRequest !== null}
        title={confirmRequest?.title ?? ""}
        description={confirmRequest?.description ?? ""}
        confirmLabel={confirmRequest?.confirmLabel ?? "Confirmar"}
        tone={confirmRequest?.tone}
        pending={pending}
        onCancel={() => setConfirmRequest(null)}
        onConfirm={submitConfirmedAction}
      />
    </div>
  );
}
