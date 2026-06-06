import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { paymentMethodLabels } from "@/lib/sales/payment-methods";
import {
  isAdminSaleStatusFilter,
  listAdminSales,
} from "@/lib/sales/queries";
import type { AdminSaleStatusFilter, SaleStatus } from "@/lib/sales/types";

type AdminSalesPageProps = {
  searchParams: Promise<{ estado?: string }>;
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

export default async function AdminSalesPage({
  searchParams,
}: AdminSalesPageProps) {
  const profile = await requireAdminProfile();
  const { estado } = await searchParams;
  const status = isAdminSaleStatusFilter(estado) ? estado : "todas";
  const sales = await listAdminSales(status);

  return (
    <AppShell profile={profile} title="Ventas mostrador">
      <div className="mb-5">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
      </div>

      <nav className="mb-5 flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Link
            key={option.value}
            href={
              option.value === "todas"
                ? "/admin/ventas"
                : `/admin/ventas?estado=${option.value}`
            }
            className={
              status === option.value
                ? "rounded-md bg-lime-300 px-3 py-2 text-sm font-black text-black"
                : "rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-lime-300"
            }
          >
            {option.label}
          </Link>
        ))}
      </nav>

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
                      href={`/vendedor/ventas/${sale.id}/ticket`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Ver ticket
                    </Link>
                  </td>
                </tr>
              ))}
              {sales.length === 0 ? (
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
    </AppShell>
  );
}
