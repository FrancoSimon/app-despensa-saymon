import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CsvExportButton } from "@/components/reports/csv-export-button";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createReportDateRange } from "@/lib/reports/dates";
import {
  getSalesSummary,
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
  ] = await Promise.all([
    getSalesSummary(range),
    listDailySales(range),
    listBestSellingProducts(range),
    listLowStockProductsForReport(),
    listWholesaleOrderStatusCounts(),
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
                  {row.estado}
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
