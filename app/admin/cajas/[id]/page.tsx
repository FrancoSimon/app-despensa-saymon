import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import {
  getCashRegisterById,
  listCashRegisterMovements,
  listCashRegisterSales,
} from "@/lib/cash/queries";
import { paymentMethodLabels } from "@/lib/sales/payment-methods";
import type { PaymentMethod } from "@/lib/sales/types";

type AdminCashRegisterDetailPageProps = {
  params: Promise<{ id: string }>;
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

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentLabel(value: string) {
  return paymentMethodLabels[value as PaymentMethod] ?? value;
}

function getBackHref(value: string | undefined) {
  if (value?.startsWith("/admin/reportes") || value?.startsWith("/admin/cajas")) {
    return value;
  }

  return "/admin/cajas";
}

export default async function AdminCashRegisterDetailPage({
  params,
  searchParams,
}: AdminCashRegisterDetailPageProps) {
  const profile = await requireAdminProfile();
  const { id } = await params;
  const { volver } = await searchParams;
  const backHref = getBackHref(volver);
  const [cashRegister, sales, movements] = await Promise.all([
    getCashRegisterById(id),
    listCashRegisterSales(id),
    listCashRegisterMovements(id),
  ]);

  if (!cashRegister) {
    notFound();
  }

  const movementTotals = movements.reduce(
    (totals, movement) => ({
      ingresos:
        totals.ingresos + (movement.tipo === "ingreso" ? movement.monto : 0),
      retiros: totals.retiros + (movement.tipo === "retiro" ? movement.monto : 0),
    }),
    { ingresos: 0, retiros: 0 },
  );

  return (
    <AppShell profile={profile} title={`Caja #${cashRegister.id.slice(0, 8)}`}>
      <div className="mb-5">
        <Link
          href={backHref}
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          {backHref.startsWith("/admin/reportes")
            ? "Volver a reportes"
            : "Volver a cajas"}
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Operador" value={cashRegister.operadorNombre} />
        <Metric label="Estado" value={cashRegister.estado} />
        <Metric label="Apertura" value={formatDateTime(cashRegister.abiertaAt)} />
        <Metric label="Cierre" value={formatDateTime(cashRegister.cerradaAt)} />
        <Metric label="Ventas" value={String(cashRegister.cantidadVentas)} />
        <Metric label="Total vendido" value={money(cashRegister.totalVentas)} />
        <Metric
          label="Efectivo esperado"
          value={money(cashRegister.efectivoEsperado)}
        />
        <Metric label="Ingresos caja" value={money(movementTotals.ingresos)} />
        <Metric label="Retiros caja" value={money(movementTotals.retiros)} />
        <Metric
          label="Diferencia"
          value={
            cashRegister.diferenciaEfectivo === null
              ? "-"
              : money(cashRegister.diferenciaEfectivo)
          }
        />
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-black p-5">
        <h2 className="text-xl font-black text-white">Medios de pago</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Efectivo ventas" value={money(cashRegister.efectivoVentas)} />
          <Metric label="QR" value={money(cashRegister.qrTotal)} />
          <Metric
            label="Tarjeta credito"
            value={money(cashRegister.tarjetaCreditoTotal)}
          />
          <Metric
            label="Tarjeta debito"
            value={money(cashRegister.tarjetaDebitoTotal)}
          />
          <Metric
            label="Transferencia"
            value={money(cashRegister.transferenciaTotal)}
          />
        </div>
        {cashRegister.observaciones ? (
          <p className="mt-4 rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-zinc-300">
            {cashRegister.observaciones}
          </p>
        ) : null}
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">
            Movimientos de efectivo
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Importe</th>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id} className="border-t border-white/10">
                  <td className="px-4 py-4 text-zinc-300">
                    {formatDateTime(movement.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        movement.tipo === "ingreso"
                          ? "rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black"
                          : "rounded-md bg-yellow-200 px-2 py-1 text-xs font-black uppercase text-black"
                      }
                    >
                      {movement.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold text-white">
                    {money(movement.monto)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {movement.operadorNombre}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">{movement.motivo}</td>
                </tr>
              ))}
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                    No hay movimientos de efectivo registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-black text-white">Ventas de la caja</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Venta</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-white/10">
                  <td className="px-4 py-4 font-black text-white">
                    #{sale.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {formatDateTime(sale.fecha)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {sale.vendedorNombre}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {paymentLabel(sale.formaPago)}
                  </td>
                  <td className="px-4 py-4 font-bold text-white">
                    {money(sale.total)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        sale.estado === "anulada"
                          ? "rounded-md bg-red-400 px-2 py-1 text-xs font-black uppercase text-black"
                          : "rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black"
                      }
                    >
                      {sale.estado}
                    </span>
                    {sale.motivoAnulacion ? (
                      <p className="mt-1 max-w-[260px] text-xs text-zinc-500">
                        {sale.motivoAnulacion}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/vendedor/ventas/${sale.id}/ticket?volver=${encodeURIComponent(`/admin/cajas/${cashRegister.id}?volver=${encodeURIComponent(backHref)}`)}`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Ver ticket
                    </Link>
                  </td>
                </tr>
              ))}
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    No hay ventas asociadas a esta caja.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
