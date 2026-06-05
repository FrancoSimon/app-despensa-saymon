import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { PrintTicketButton } from "@/components/pos/print-ticket-button";
import { WhatsAppTicketButton } from "@/components/pos/whatsapp-ticket-button";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { SaleTicket } from "@/lib/sales/types";
import { getSaleTicket } from "@/lib/sales/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

type SaleTicketPageProps = {
  params: Promise<{
    id: string;
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
    "SAYMON - Ticket interno",
    "No valido como factura",
    "",
    `Venta: #${ticket.id.slice(0, 8)}`,
    `Fecha: ${formatDateTime(ticket.fecha)}`,
    `Pago: ${ticket.formaPago.toUpperCase()}`,
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

export default async function SaleTicketPage({ params }: SaleTicketPageProps) {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
    redirect("/");
  }

  const { id } = await params;
  const ticket = await getSaleTicket(id);

  if (!ticket) {
    notFound();
  }

  const whatsAppMessage = buildWhatsAppMessage(ticket);

  return (
    <main className="min-h-dvh bg-zinc-950 px-4 py-6 text-zinc-950 print:bg-white print:p-0">
      <div className="mx-auto mb-5 flex max-w-sm flex-wrap items-center justify-between gap-3 text-white print:hidden">
        <Link
          href="/vendedor"
          className="rounded-md border border-white/15 px-4 py-3 text-sm font-bold transition hover:border-lime-300"
        >
          Volver
        </Link>
        <WhatsAppTicketButton message={whatsAppMessage} />
        <PrintTicketButton />
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
            <strong>{ticket.formaPago.toUpperCase()}</strong>
          </div>
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
    </main>
  );
}
