import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { PrintTicketButton } from "@/components/pos/print-ticket-button";
import { WhatsAppTicketButton } from "@/components/pos/whatsapp-ticket-button";
import { requireSellerProfile } from "@/lib/auth/require-admin";
import { businessInfo, getBusinessReceiptLines } from "@/lib/business-info";
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

function shortId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

function compactId(value: string) {
  return value.replaceAll("-", "").slice(0, 6).toUpperCase();
}

function formatReceiptNumber(ticket: SaleTicket) {
  const date = new Date(ticket.fecha);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `SAY-${year}${month}${day}-${compactId(ticket.id)}`;
}

function statusLabel(ticket: SaleTicket) {
  return ticket.estado === "anulada" ? "Anulada" : "Activa";
}

function adjustmentLabel(label: string, percentage: number) {
  return percentage > 0 ? `${label} ${percentage}%` : label;
}

function buildWhatsAppMessage(ticket: SaleTicket) {
  const receiptNumber = formatReceiptNumber(ticket);
  const businessLines = getBusinessReceiptLines();
  const lines = [
    ticket.estado === "anulada"
      ? `${businessInfo.name} - ${businessInfo.receiptTitle} ANULADO`
      : `${businessInfo.name} - ${businessInfo.receiptTitle}`,
    businessInfo.nonFiscalNotice,
    ...businessLines,
    "",
    `Comprobante: ${receiptNumber}`,
    `Venta ID: #${shortId(ticket.id)}`,
    ...(ticket.cajaId ? [`Caja: #${shortId(ticket.cajaId)}`] : []),
    `Estado: ${statusLabel(ticket)}`,
    `Fecha: ${formatDateTime(ticket.fecha)}`,
    `Vendedor: ${ticket.vendedorNombre}`,
    ...(ticket.clienteNombre
      ? [
          `Cliente: ${ticket.clienteNombre}`,
          ...(ticket.clienteTelefono ? [`Tel cliente: ${ticket.clienteTelefono}`] : []),
        ]
      : []),
    `Pago: ${paymentMethodLabels[ticket.formaPago]}`,
    ...(ticket.estado === "anulada"
      ? [
          `Anulada: ${ticket.anuladaAt ? formatDateTime(ticket.anuladaAt) : "-"}`,
          `Motivo: ${ticket.motivoAnulacion ?? "-"}`,
        ]
      : []),
    "",
    "Productos:",
    ...ticket.items.map(
      (item) =>
        `${item.cantidad} x ${item.productoNombre} (${money(
          item.precioUnitario,
        )}) - ${money(item.subtotal)}`,
    ),
    "",
    `Subtotal: ${money(ticket.subtotal)}`,
    `${adjustmentLabel("Descuento", ticket.descuentoPorcentaje)}: - ${money(
      ticket.descuentoMonto,
    )}`,
    `${adjustmentLabel("Recargo", ticket.recargoPorcentaje)}: + ${money(
      ticket.recargoMonto,
    )}`,
    `Total: ${money(ticket.total)}`,
    "",
    businessInfo.footerNotice,
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

  const receiptNumber = formatReceiptNumber(ticket);
  const businessLines = getBusinessReceiptLines();
  const whatsAppMessage = buildWhatsAppMessage(ticket);

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-6 text-zinc-950 print:min-h-0 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page {
            size: 80mm 297mm;
            margin: 0;
          }
        }
      `}</style>
      <div className="mx-auto mb-5 flex max-w-[80mm] flex-wrap items-center justify-between gap-3 text-white print:hidden">
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

      <article className="mx-auto w-full max-w-[80mm] bg-white p-[5mm] font-mono text-[12px] leading-tight shadow-2xl print:w-[80mm] print:max-w-[80mm] print:p-[4mm] print:text-[11px] print:shadow-none">
        <header className="border-b border-dashed border-zinc-400 pb-3 text-center">
          <Image
            src="/logo-saymon.jpeg"
            alt={`Logo ${businessInfo.shortName}`}
            width={58}
            height={58}
            className="mx-auto size-[58px] rounded-full object-cover grayscale"
          />
          <h1 className="mt-2 text-xl font-black tracking-wide">
            {businessInfo.name}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-wide">
            {businessInfo.receiptTitle}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase">
            {businessInfo.nonFiscalNotice}
          </p>
          {businessLines.map((line) => (
            <p key={line} className="mt-1 text-[10px] uppercase">
              {line}
            </p>
          ))}
          {ticket.estado === "anulada" ? (
            <p className="mt-3 border border-zinc-900 px-2 py-1 text-xs font-black uppercase">
              Venta anulada
            </p>
          ) : null}
        </header>

        <section className="border-b border-dashed border-zinc-400 py-3">
          <div className="grid grid-cols-[auto_1fr] gap-2 text-sm font-black">
            <span>Comprobante</span>
            <strong className="text-right">{receiptNumber}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Venta ID</span>
            <strong>#{shortId(ticket.id)}</strong>
          </div>
          {ticket.cajaId ? (
            <div className="mt-1 flex justify-between gap-4">
              <span>Caja</span>
              <strong>#{shortId(ticket.cajaId)}</strong>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between gap-4">
            <span>Estado</span>
            <strong>{statusLabel(ticket)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Fecha</span>
            <strong className="text-right">{formatDateTime(ticket.fecha)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Vendedor</span>
            <strong className="text-right">{ticket.vendedorNombre}</strong>
          </div>
          {ticket.clienteNombre ? (
            <div className="mt-1 flex justify-between gap-4">
              <span>Cliente</span>
              <strong className="text-right">
                {ticket.clienteNombre}
                {ticket.clienteTelefono ? ` - ${ticket.clienteTelefono}` : ""}
              </strong>
            </div>
          ) : null}
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

        <section className="border-b border-dashed border-zinc-400 py-3">
          <div className="mb-2 grid grid-cols-[1fr_3.5rem] gap-3 border-b border-zinc-300 pb-2 text-[10px] font-bold uppercase tracking-wide">
            <span>Detalle</span>
            <span className="text-right">Importe</span>
          </div>
          <div className="grid gap-2">
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

        <section className="border-b border-dashed border-zinc-400 py-3">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <strong>{money(ticket.subtotal)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>
              {adjustmentLabel("Descuento", ticket.descuentoPorcentaje)}
            </span>
            <strong>- {money(ticket.descuentoMonto)}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>{adjustmentLabel("Recargo", ticket.recargoPorcentaje)}</span>
            <strong>+ {money(ticket.recargoMonto)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4 text-lg font-black">
            <span>Total</span>
            <strong>{money(ticket.total)}</strong>
          </div>
        </section>

        <footer className="pt-3 text-center text-[10px] uppercase leading-4">
          <p>Gracias por su compra</p>
          <p>{businessInfo.name}</p>
          <p>{businessInfo.footerNotice}</p>
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
