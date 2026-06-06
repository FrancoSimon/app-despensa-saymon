import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { PrintTicketButton } from "@/components/pos/print-ticket-button";
import { WhatsAppTicketButton } from "@/components/pos/whatsapp-ticket-button";
import { requireSellerProfile } from "@/lib/auth/require-admin";
import { cancelCounterSaleAction } from "@/lib/sales/actions";
import { paymentMethodLabels } from "@/lib/sales/payment-methods";
import type { SaleTicket } from "@/lib/sales/types";
import { getSaleTicket } from "@/lib/sales/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

type SaleTicketPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    volver?: string;
  }>;
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildWhatsAppMessage(ticket: SaleTicket) {
  const lines = [
    ticket.estado === "anulada"
      ? "SAYMON - Ticket interno ANULADO"
      : "SAYMON - Ticket interno",
    "No valido como factura",
    "",
    `Venta: #${ticket.id.slice(0, 8)}`,
    `Fecha: ${formatDateTime(ticket.fecha)}`,
    ...(ticket.estado === "anulada"
      ? [
          `Anulada: ${ticket.anuladaAt ? formatDateTime(ticket.anuladaAt) : "-"}`,
          `Motivo: ${ticket.motivoAnulacion ?? "-"}`,
        ]
      : []),
    `Pago: ${paymentMethodLabels[ticket.formaPago]}`,
    "",
    "Productos:",
    ...ticket.items.map(
      (item) =>
        `${item.cantidad} x ${item.productoNombre} - ${money(item.subtotal)}`,
    ),
    "",
    `Subtotal: ${money(ticket.subtotal)}`,
    `Descuento ${ticket.descuentoPorcentaje}%: - ${money(ticket.descuentoMonto)}`,
    `Recargo ${ticket.recargoPorcentaje}%: + ${money(ticket.recargoMonto)}`,
    `Total: ${money(ticket.total)}`,
    "",
    "Comercio SAYMON",
  ];

  return lines.join("\n");
}

function getBackHref(value: string | undefined, role: string) {
  if (
    role === "admin" &&
    (value?.startsWith("/admin/ventas") || value?.startsWith("/admin/cajas/"))
  ) {
    return value;
  }

  return "/vendedor";
}

export default async function SaleTicketPage({
  params,
  searchParams,
}: SaleTicketPageProps) {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const profile = await requireSellerProfile();

  const { id } = await params;
  const { volver } = await searchParams;
  const backHref = getBackHref(volver, profile.rol);
  const ticket = await getSaleTicket(id);

  if (!ticket) {
    notFound();
  }

  if (profile.rol === "vendedor" && ticket.vendedorId !== profile.id) {
    notFound();
  }

  const whatsAppMessage = buildWhatsAppMessage(ticket);

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-6 text-zinc-950 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-sm flex-wrap items-center justify-between gap-3 text-white print:hidden">
        <Link
          href={backHref}
          className="rounded-md border border-white/15 px-4 py-3 text-sm font-bold transition hover:border-lime-300"
        >
          Volver
        </Link>
        <div className="flex flex-wrap gap-2">
          <WhatsAppTicketButton message={whatsAppMessage} />
          <PrintTicketButton />
        </div>
      </div>

      <article className="mx-auto max-w-sm bg-white p-6 font-mono text-sm shadow-2xl print:max-w-none print:shadow-none">
        <header className="border-b border-dashed border-zinc-400 pb-4 text-center">
          <Image
            src="/logo-saymon.jpeg"
            alt="Logo SAYMON"
            width={72}
            height={72}
            className="mx-auto size-18 rounded-full object-cover grayscale"
            priority
          />
          <h1 className="mt-3 text-2xl font-black tracking-wide">SAYMON</h1>
          <p className="mt-1 text-xs uppercase tracking-wide">
            Ticket interno de venta
          </p>
          <p className="mt-2 text-[11px] font-bold uppercase">
            No valido como factura
          </p>
          {ticket.estado === "anulada" ? (
            <p className="mt-3 border border-zinc-900 px-2 py-1 text-xs font-black uppercase">
              Venta anulada
            </p>
          ) : null}
        </header>

        <section className="border-b border-dashed border-zinc-400 py-4">
          <div className="flex justify-between gap-4">
            <span>Venta</span>
            <strong>#{ticket.id.slice(0, 8)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Fecha</span>
            <strong className="text-right">{formatDateTime(ticket.fecha)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Vendedor</span>
            <strong className="text-right">{ticket.vendedorNombre}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Pago</span>
            <strong>{paymentMethodLabels[ticket.formaPago]}</strong>
          </div>
          {ticket.estado === "anulada" ? (
            <>
              <div className="mt-1 flex justify-between gap-4">
                <span>Anulada</span>
                <strong className="text-right">
                  {ticket.anuladaAt ? formatDateTime(ticket.anuladaAt) : "-"}
                </strong>
              </div>
              <div className="mt-1">
                <span>Motivo</span>
                <p className="mt-1 font-bold">{ticket.motivoAnulacion ?? "-"}</p>
              </div>
            </>
          ) : null}
        </section>

        <section className="border-b border-dashed border-zinc-400 py-4">
          <div className="grid gap-3">
            {ticket.items.map((item) => (
              <div key={item.id}>
                <div className="font-bold">{item.productoNombre}</div>
                <div className="mt-1 flex justify-between gap-4">
                  <span>
                    {item.cantidad} x {money(item.precioUnitario)}
                  </span>
                  <strong>{money(item.subtotal)}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-dashed border-zinc-400 py-4">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <strong>{money(ticket.subtotal)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Descuento {ticket.descuentoPorcentaje}%</span>
            <strong>- {money(ticket.descuentoMonto)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Recargo {ticket.recargoPorcentaje}%</span>
            <strong>+ {money(ticket.recargoMonto)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4 text-lg font-black">
            <span>Total</span>
            <strong>{money(ticket.total)}</strong>
          </div>
        </section>

        <footer className="pt-4 text-center text-[11px] uppercase leading-5">
          <p>Comercio SAYMON</p>
          <p>Registro interno sin validez fiscal</p>
        </footer>
      </article>

      {ticket.estado === "activa" ? (
        <form
          action={cancelCounterSaleAction}
          className="mx-auto mt-5 grid max-w-sm gap-3 rounded-lg border border-red-400/30 bg-black p-4 text-white print:hidden"
        >
          <input type="hidden" name="ventaId" value={ticket.id} />
          <input type="hidden" name="volver" value={backHref} />
          <label className="text-sm font-bold text-red-100">
            Motivo de anulacion
            <textarea
              name="motivo"
              rows={2}
              className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-red-300"
              required
            />
          </label>
          <button className="rounded-md border border-red-400/40 px-4 py-3 text-sm font-black text-red-100 transition hover:bg-red-950">
            Anular venta y reponer stock
          </button>
        </form>
      ) : null}
    </main>
  );
}
