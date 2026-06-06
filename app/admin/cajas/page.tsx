import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { listRecentCashRegisters } from "@/lib/cash/queries";

type AdminCashRegistersPageProps = {
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

function getBackHref(value: string | undefined) {
  if (value?.startsWith("/admin/reportes")) {
    return value;
  }

  return "/admin";
}

export default async function AdminCashRegistersPage({
  searchParams,
}: AdminCashRegistersPageProps) {
  const profile = await requireAdminProfile();
  const { volver } = await searchParams;
  const backHref = getBackHref(volver);
  const cashRegisters = await listRecentCashRegisters();

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
              {cashRegisters.map((cashRegister) => (
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
                      href={
                        backHref.startsWith("/admin/reportes")
                          ? `/admin/cajas/${cashRegister.id}?volver=${encodeURIComponent(backHref)}`
                          : `/admin/cajas/${cashRegister.id}`
                      }
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
              {cashRegisters.length === 0 ? (
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
    </AppShell>
  );
}
