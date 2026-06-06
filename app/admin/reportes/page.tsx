import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CsvExportButton } from "@/components/reports/csv-export-button";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createReportDateRange } from "@/lib/reports/dates";
import {
  getCashRegisterReportSummary,
  getCanceledSalesCount,
  getSalesSummary,
  listCashRegisterReportRows,
  listBestSellingProducts,
  listDailySales,
  listLowStockProductsForReport,
  listWholesaleOrderStatusCounts,
} from "@/lib/reports/queries";

type AdminReportsPageProps = {
  searchParams: Promise<{
    desde?: string;
    hasta?: string;
  }>;
};

function money(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits,
  }).format(value);
}

function dateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function dateTimeLabel(value: string | null) {
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

export default async function AdminReportsPage({
  searchParams,
}: AdminReportsPageProps) {
  const profile = await requireAdminProfile();
  const { desde, hasta } = await searchParams;
  const range = createReportDateRange(desde, hasta);
  const [
    salesSummary,
    dailySales,
    bestSellers,
    lowStockProducts,
    wholesaleStatusCounts,
    canceledSalesCount,
    cashRegisterSummary,
    cashRegisterRows,
  ] = await Promise.all([
    getSalesSummary(range),
    listDailySales(range),
    listBestSellingProducts(range),
    listLowStockProductsForReport(),
    listWholesaleOrderStatusCounts(range),
    getCanceledSalesCount(range),
    getCashRegisterReportSummary(range),
    listCashRegisterReportRows(range),
  ]);

  return (
    <AppShell profile={profile} title="Reportes">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
          >
            Volver al panel
          </Link>
          <p className="mt-2 text-sm text-zinc-400">
            Periodo {dateLabel(range.from)} a {dateLabel(range.to)}
          </p>
        </div>
        <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Desde
            <input
              name="desde"
              type="date"
              defaultValue={range.from}
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-lime-300"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Hasta
            <input
              name="hasta"
              type="date"
              defaultValue={range.to}
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-lime-300"
            />
          </label>
          <button className="h-11 self-end rounded-md bg-lime-300 px-4 text-sm font-black text-black transition hover:bg-lime-200">
            Aplicar
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Ventas
          </p>
          <p className="mt-3 text-2xl font-black text-lime-300">
            {money(salesSummary.total)}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {salesSummary.count} operaciones
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Efectivo
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(salesSummary.cashTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Tarjetas
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(salesSummary.cardTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            QR
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(salesSummary.qrTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Transferencia
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(salesSummary.transferTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Stock bajo
          </p>
          <p className="mt-3 text-2xl font-black text-yellow-200">
            {lowStockProducts.length}
          </p>
        </article>
        <Link
          href={`/admin/ventas?estado=anulada&desde=${range.from}&hasta=${range.to}`}
          className="rounded-lg border border-white/10 bg-black p-5 transition hover:border-lime-300"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Ventas anuladas
          </p>
          <p className="mt-3 text-2xl font-black text-red-100">
            {canceledSalesCount}
          </p>
        </Link>
        <Link
          href="/admin/cajas"
          className="rounded-lg border border-white/10 bg-black p-5 transition hover:border-lime-300"
        >
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Cajas
          </p>
          <p className="mt-3 text-2xl font-black text-lime-300">
            {cashRegisterSummary.count}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {cashRegisterSummary.closedCount} cerradas
          </p>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Efectivo esperado
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(cashRegisterSummary.expectedCashTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Efectivo contado
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(cashRegisterSummary.countedCashTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Diferencia caja
          </p>
          <p
            className={
              cashRegisterSummary.cashDifferenceTotal < 0
                ? "mt-3 text-2xl font-black text-red-100"
                : "mt-3 text-2xl font-black text-lime-300"
            }
          >
            {money(cashRegisterSummary.cashDifferenceTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Ingresos caja
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(cashRegisterSummary.incomeMovementsTotal)}
          </p>
        </article>
        <article className="rounded-lg border border-white/10 bg-black p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
            Retiros caja
          </p>
          <p className="mt-3 text-2xl font-black text-white">
            {money(cashRegisterSummary.withdrawalMovementsTotal)}
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Ventas por dia</h2>
          <div className="mt-4 overflow-hidden rounded-md border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                <tr>
                  <th className="px-3 py-3">Dia</th>
                  <th className="px-3 py-3">Ventas</th>
                  <th className="px-3 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {dailySales.map((row) => (
                  <tr key={row.date} className="border-t border-white/10">
                    <td className="px-3 py-3 text-zinc-300">
                      {dateLabel(row.date)}
                    </td>
                    <td className="px-3 py-3 text-zinc-300">{row.count}</td>
                    <td className="px-3 py-3 font-bold text-white">
                      {money(row.total)}
                    </td>
                  </tr>
                ))}
                {dailySales.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-zinc-400">
                      Sin ventas en el periodo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Mas vendidos</h2>
            <CsvExportButton
              rows={bestSellers}
              fileName={`mas-vendidos-${range.from}-${range.to}.csv`}
            />
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-white/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                <tr>
                  <th className="px-3 py-3">Producto</th>
                  <th className="px-3 py-3">Cant.</th>
                  <th className="px-3 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {bestSellers.slice(0, 12).map((row) => (
                  <tr key={row.productId} className="border-t border-white/10">
                    <td className="px-3 py-3 font-semibold text-white">
                      {row.productName}
                    </td>
                    <td className="px-3 py-3 text-zinc-300">{row.quantity}</td>
                    <td className="px-3 py-3 font-bold text-white">
                      {money(row.total)}
                    </td>
                  </tr>
                ))}
                {bestSellers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-zinc-400">
                      Sin productos vendidos.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-black p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">Cajas del periodo</h2>
          <Link
            href="/admin/cajas"
            className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
          >
            Ver todas
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-md border border-white/10">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-3 py-3">Caja</th>
                <th className="px-3 py-3">Operador</th>
                <th className="px-3 py-3">Apertura</th>
                <th className="px-3 py-3">Cierre</th>
                <th className="px-3 py-3">Ventas</th>
                <th className="px-3 py-3">Esperado</th>
                <th className="px-3 py-3">Contado</th>
                <th className="px-3 py-3">Dif.</th>
                <th className="px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cashRegisterRows.map((cashRegister) => (
                <tr key={cashRegister.id} className="border-t border-white/10">
                  <td className="px-3 py-3 font-black text-white">
                    #{cashRegister.id.slice(0, 8)}
                    <span
                      className={
                        cashRegister.status === "abierta"
                          ? "ml-2 rounded bg-lime-300 px-2 py-1 text-[10px] uppercase text-black"
                          : "ml-2 rounded bg-zinc-700 px-2 py-1 text-[10px] uppercase text-white"
                      }
                    >
                      {cashRegister.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {cashRegister.operatorName}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {dateTimeLabel(cashRegister.openedAt)}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {dateTimeLabel(cashRegister.closedAt)}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {cashRegister.salesCount} / {money(cashRegister.salesTotal)}
                  </td>
                  <td className="px-3 py-3 font-bold text-white">
                    {money(cashRegister.expectedCash)}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {cashRegister.countedCash === null
                      ? "-"
                      : money(cashRegister.countedCash)}
                  </td>
                  <td
                    className={
                      (cashRegister.cashDifference ?? 0) < 0
                        ? "px-3 py-3 font-bold text-red-100"
                        : "px-3 py-3 font-bold text-lime-300"
                    }
                  >
                    {cashRegister.cashDifference === null
                      ? "-"
                      : money(cashRegister.cashDifference)}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/admin/cajas/${cashRegister.id}`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {cashRegisterRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-zinc-400">
                    Sin cajas en el periodo.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Productos con stock bajo</h2>
          <div className="mt-4 grid gap-2">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-zinc-950 px-3 py-3"
              >
                <div>
                  <p className="font-bold text-white">{product.nombre}</p>
                  <p className="text-sm text-zinc-500">{product.categoria}</p>
                </div>
                <p className="font-black text-yellow-200">
                  {product.stock} / min {product.stockMinimo}
                </p>
              </div>
            ))}
            {lowStockProducts.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
                No hay productos por debajo del minimo.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Pedidos mayoristas</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {wholesaleStatusCounts.map((row) => (
              <Link
                key={row.estado}
                href={`/admin/pedidos?estado=${row.estado}`}
                className="rounded-md border border-white/10 bg-zinc-950 p-4 transition hover:border-lime-300"
              >
                <p className="text-sm font-bold capitalize text-zinc-300">
                  Pedido {row.estado}
                </p>
                <p className="mt-2 text-2xl font-black text-lime-300">
                  {row.count}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
