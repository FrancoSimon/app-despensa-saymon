import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parsePage } from "@/lib/pagination";
import { createReportDateRange } from "@/lib/reports/dates";
import { paymentMethodLabels } from "@/lib/sales/payment-methods";
import {
  isAdminSaleStatusFilter,
  listAdminSales,
} from "@/lib/sales/queries";
import type { AdminSaleStatusFilter, SaleStatus } from "@/lib/sales/types";

type AdminSalesPageProps = {
  searchParams: Promise<{
    estado?: string;
    desde?: string;
    hasta?: string;
    pagina?: string;
    volver?: string;
  }>;
};

const statusOptions: { value: AdminSaleStatusFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "activa", label: "Activas" },
  { value: "anulada", label: "Anuladas" },
];

const statusLabels: Record<SaleStatus, string> = {
  activa: "Activa",
  anulada: "Anulada",
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

function getBackHref(value: string | undefined) {
  if (value?.startsWith("/admin/reportes")) {
    return value;
  }

  return "/admin";
}

export default async function AdminSalesPage({
  searchParams,
}: AdminSalesPageProps) {
  const profile = await requireAdminProfile();
  const { estado, desde, hasta, pagina, volver } = await searchParams;
  const status = isAdminSaleStatusFilter(estado) ? estado : "todas";
  const range = createReportDateRange(desde, hasta);
  const page = parsePage(pagina);
  const sales = await listAdminSales(status, range, { page });
  const backHref = getBackHref(volver);
  const query = new URLSearchParams({
    desde: range.from,
    hasta: range.to,
  });

  if (status !== "todas") {
    query.set("estado", status);
  }

  if (backHref !== "/admin") {
    query.set("volver", backHref);
  }

  if (page > 1) {
    query.set("pagina", String(page));
  }

  const returnHref = `/admin/ventas?${query.toString()}`;

  return (
    <AppShell profile={profile} title="Ventas mostrador">
      <div className="mb-5">
        <Link
          href={backHref}
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          {backHref.startsWith("/admin/reportes")
            ? "Volver a reportes"
            : "Volver al panel"}
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <nav className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const optionQuery = new URLSearchParams({
              desde: range.from,
              hasta: range.to,
            });

            if (option.value !== "todas") {
              optionQuery.set("estado", option.value);
            }

            if (backHref !== "/admin") {
              optionQuery.set("volver", backHref);
            }

            return (
              <Link
                key={option.value}
                href={`/admin/ventas?${optionQuery.toString()}`}
                className={
                  status === option.value
                    ? "rounded-md bg-lime-300 px-3 py-2 text-sm font-black text-black"
                    : "rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </nav>

        <form className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          {status !== "todas" ? (
            <input type="hidden" name="estado" value={status} />
          ) : null}
          {backHref !== "/admin" ? (
            <input type="hidden" name="volver" value={backHref} />
          ) : null}
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

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Venta</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Vendedor</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.items.map((sale) => (
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
                    {paymentMethodLabels[sale.formaPago]}
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
                      {statusLabels[sale.estado]}
                    </span>
                  </td>
                  <td className="max-w-[260px] px-4 py-4 text-zinc-400">
                    {sale.motivoAnulacion ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/vendedor/ventas/${sale.id}/ticket?volver=${encodeURIComponent(returnHref)}`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Ver ticket
                    </Link>
                  </td>
                </tr>
              ))}
              {sales.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                    No hay ventas para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        pagination={sales}
        basePath="/admin/ventas"
        query={query}
      />
    </AppShell>
  );
}
