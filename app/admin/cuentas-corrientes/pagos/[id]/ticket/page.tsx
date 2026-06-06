import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { PrintTicketButton } from "@/components/pos/print-ticket-button";
import { getAccountPaymentTicket } from "@/lib/accounts/queries";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { businessInfo, getBusinessReceiptLines } from "@/lib/business-info";
import { paymentMethodLabels } from "@/lib/sales/payment-methods";
import { getSupabaseEnv } from "@/lib/supabase/env";

type AccountPaymentTicketPageProps = {
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

function shortId(value: string) {
  return value.replaceAll("-", "").slice(0, 8).toUpperCase();
}

export default async function AccountPaymentTicketPage({
  params,
}: AccountPaymentTicketPageProps) {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  await requireAdminProfile();

  const { id } = await params;
  const ticket = await getAccountPaymentTicket(id);

  if (!ticket) {
    notFound();
  }

  const businessLines = getBusinessReceiptLines();
  const receiptNumber = `CC-${shortId(ticket.id)}`;
  const isPartialPayment = ticket.saldoActual > 0;

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
          href="/admin/cuentas-corrientes"
          className="rounded-md border border-white/15 px-4 py-3 text-sm font-bold transition hover:border-lime-300"
        >
          Volver
        </Link>
        <PrintTicketButton />
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
            {isPartialPayment
              ? "Recibo de pago parcial"
              : "Recibo de cancelacion total"}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase">
            {businessInfo.nonFiscalNotice}
          </p>
          {businessLines.map((line) => (
            <p key={line} className="mt-1 text-[10px] uppercase">
              {line}
            </p>
          ))}
        </header>

        <section className="border-b border-dashed border-zinc-400 py-3">
          <div className="mb-3 border border-zinc-900 px-2 py-1 text-center text-xs font-black uppercase">
            {isPartialPayment ? "Pago parcial" : "Cuenta cancelada"}
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2 text-sm font-black">
            <span>Comprobante</span>
            <strong className="text-right">{receiptNumber}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Fecha</span>
            <strong className="text-right">
              {formatDateTime(ticket.createdAt)}
            </strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Cliente</span>
            <strong className="text-right">{ticket.clienteNombre}</strong>
          </div>
          {ticket.clienteTelefono ? (
            <div className="mt-1 flex justify-between gap-4">
              <span>Telefono</span>
              <strong>{ticket.clienteTelefono}</strong>
            </div>
          ) : null}
          {ticket.clienteRazonSocial || ticket.clienteDocumento ? (
            <div className="mt-1 flex justify-between gap-4">
              <span>Datos</span>
              <strong className="text-right">
                {[ticket.clienteRazonSocial, ticket.clienteDocumento]
                  .filter(Boolean)
                  .join(" - ")}
              </strong>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between gap-4">
            <span>Operador</span>
            <strong className="text-right">{ticket.operadorNombre}</strong>
          </div>
          <div className="mt-1 flex justify-between gap-4">
            <span>Pago</span>
            <strong>{paymentMethodLabels[ticket.formaPago]}</strong>
          </div>
        </section>

        <section className="border-b border-dashed border-zinc-400 py-3">
          <div className="mb-2 flex justify-between gap-4">
            <span>Saldo anterior</span>
            <strong>{money(ticket.saldoAntes)}</strong>
          </div>
          <div className="flex justify-between gap-4 text-lg font-black">
            <span>Importe recibido</span>
            <strong>{money(ticket.monto)}</strong>
          </div>
          <div className="mt-3 flex justify-between gap-4">
            <span>Saldo actual</span>
            <strong>{money(ticket.saldoActual)}</strong>
          </div>
          {ticket.nota ? (
            <div className="mt-3">
              <span>Nota</span>
              <p className="mt-1 font-bold">{ticket.nota}</p>
            </div>
          ) : null}
        </section>

        <footer className="pt-3 text-center text-[10px] uppercase leading-4">
          <p>{isPartialPayment ? "Pago parcial registrado" : "Deuda cancelada"}</p>
          <p>{businessInfo.name}</p>
          <p>{businessInfo.footerNotice}</p>
        </footer>
      </article>
    </main>
  );
}
