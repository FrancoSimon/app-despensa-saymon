import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import {
  listCashRegisterOperators,
  listCashRegisters,
} from "@/lib/cash/queries";
import { parsePage } from "@/lib/pagination";
import { createReportDateRange } from "@/lib/reports/dates";
import type { CashRegisterStatusFilter } from "@/lib/cash/types";

type AdminCashRegistersPageProps = {
  searchParams: Promise<{
    desde?: string;
    estado?: string;
    hasta?: string;
    operador?: string;
    pagina?: string;
    volver?: string;
  }>;
};

const statusOptions: { value: CashRegisterStatusFilter; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "abierta", label: "Abiertas" },
  { value: "cerrada", label: "Cerradas" },
];

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

function getBackHref(value: string | undefined) {
  if (value?.startsWith("/admin/reportes")) {
    return value;
  }

  return "/admin";
}

function getStatusFilter(value: string | undefined): CashRegisterStatusFilter {
  if (value === "abierta" || value === "cerrada") {
    return value;
  }

  return "todas";
}

export default async function AdminCashRegistersPage({
  searchParams,
}: AdminCashRegistersPageProps) {
  const profile = await requireAdminProfile();
  const { desde, estado, hasta, operador, pagina, volver } = await searchParams;
  const backHref = getBackHref(volver);
  const range = createReportDateRange(desde, hasta);
  const status = getStatusFilter(estado);
  const operatorId = operador || null;
  const page = parsePage(pagina);
  const listQuery = new URLSearchParams({
    desde: range.from,
    hasta: range.to,
  });

  if (status !== "todas") {
    listQuery.set("estado", status);
  }

  if (operatorId) {
    listQuery.set("operador", operatorId);
  }

  if (backHref !== "/admin") {
    listQuery.set("volver", backHref);
  }

  if (page > 1) {
    listQuery.set("pagina", String(page));
  }

  const detailReturnHref = `/admin/cajas?${listQuery.toString()}`;
  const [cashRegisters, operators] = await Promise.all([
    listCashRegisters({
      fromIso: range.fromIso,
      toIsoExclusive: range.toIsoExclusive,
      status,
      operatorId,
    }, { page }),
    listCashRegisterOperators(),
  ]);

  return (
    <AppShell profile={profile} title="Cajas">
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

      <form className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-black p-4 md:grid-cols-[1fr_1fr_1fr_1.2fr_auto] md:items-end">
        {backHref !== "/admin" ? (
          <input type="hidden" name="volver" value={backHref} />
        ) : null}
        <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Desde
          <input
            name="desde"
            type="date"
            defaultValue={range.from}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Hasta
          <input
            name="hasta"
            type="date"
            defaultValue={range.to}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
          />
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Estado
          <select
            name="estado"
            defaultValue={status}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
          Operador
          <select
            name="operador"
            defaultValue={operatorId ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
          >
            <option value="">Todos</option>
            {operators.map((operator) => (
              <option key={operator.id} value={operator.id}>
                {operator.nombre}
              </option>
            ))}
          </select>
        </label>
        <button className="h-11 rounded-md bg-lime-300 px-4 text-sm font-black text-black transition hover:bg-lime-200">
          Aplicar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Apertura</th>
                <th className="px-4 py-3">Cierre</th>
                <th className="px-4 py-3">Ventas</th>
                <th className="px-4 py-3">Efectivo esperado</th>
                <th className="px-4 py-3">Efectivo real</th>
                <th className="px-4 py-3">Diferencia</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cashRegisters.items.map((cashRegister) => (
                <tr key={cashRegister.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">
                      {cashRegister.operadorNombre}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {cashRegister.operadorEmail}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        cashRegister.estado === "abierta"
                          ? "rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black"
                          : "rounded-md bg-white/10 px-2 py-1 text-xs font-black uppercase text-zinc-200"
                      }
                    >
                      {cashRegister.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {formatDateTime(cashRegister.abiertaAt)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {formatDateTime(cashRegister.cerradaAt)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {cashRegister.cantidadVentas}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {money(cashRegister.efectivoEsperado)}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {cashRegister.efectivoReal === null
                      ? "-"
                      : money(cashRegister.efectivoReal)}
                  </td>
                  <td
                    className={
                      cashRegister.diferenciaEfectivo === null ||
                      cashRegister.diferenciaEfectivo === 0
                        ? "px-4 py-4 text-zinc-300"
                        : "px-4 py-4 font-black text-yellow-200"
                    }
                  >
                    {cashRegister.diferenciaEfectivo === null
                      ? "-"
                      : money(cashRegister.diferenciaEfectivo)}
                  </td>
                  <td className="px-4 py-4 font-bold text-white">
                    {money(cashRegister.totalVentas)}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/cajas/${cashRegister.id}?volver=${encodeURIComponent(detailReturnHref)}`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {cashRegisters.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-zinc-400">
                    No hay cajas para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        pagination={cashRegisters}
        basePath="/admin/cajas"
        query={listQuery}
      />
    </AppShell>
  );
}
