import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { registerAccountPaymentAction } from "@/lib/accounts/actions";
import { getCustomerAccountDetail } from "@/lib/accounts/queries";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import {
  createPaginatedResult,
  DEFAULT_PAGE_SIZE,
  parsePage,
} from "@/lib/pagination";
import { paymentMethodLabels, paymentMethodOptions } from "@/lib/sales/payment-methods";

type CustomerAccountDetailPageProps = {
  params: Promise<{
    clienteId: string;
  }>;
  searchParams: Promise<{
    pagina?: string;
  }>;
};

const accountPaymentOptions = paymentMethodOptions.filter(
  (option) => option.value !== "cuenta_corriente",
);

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CustomerAccountDetailPage({
  params,
  searchParams,
}: CustomerAccountDetailPageProps) {
  const profile = await requireAdminProfile();
  const { clienteId } = await params;
  const { pagina } = await searchParams;
  const account = await getCustomerAccountDetail(clienteId);

  if (!account) {
    notFound();
  }

  const hasDebt = account.saldo > 0;
  const page = parsePage(pagina);
  const from = (page - 1) * DEFAULT_PAGE_SIZE;
  const paginatedMovements = createPaginatedResult({
    items: account.movimientos.slice(from, from + DEFAULT_PAGE_SIZE),
    total: account.movimientos.length,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const detailHref =
    page > 1
      ? `/admin/cuentas-corrientes/${account.clienteId}?pagina=${page}`
      : `/admin/cuentas-corrientes/${account.clienteId}`;

  return (
    <AppShell profile={profile} title="Detalle cuenta corriente">
      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          href="/admin/cuentas-corrientes"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver a cuentas corrientes
        </Link>
      </div>

      <section className="mb-6 rounded-lg border border-white/10 bg-black p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
              Cliente
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              {account.clienteNombre}
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {[
                account.clienteRazonSocial,
                account.clienteTelefono,
                account.clienteDocumento,
              ]
                .filter(Boolean)
                .join(" - ") || "Sin datos adicionales"}
            </p>
            {account.ultimaActividad ? (
              <p className="mt-1 text-xs text-zinc-600">
                Ultima actividad: {formatDate(account.ultimaActividad)}
              </p>
            ) : null}
          </div>
          <div className="rounded-md border border-white/10 bg-zinc-950 p-4 xl:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Saldo actual
            </p>
            <p
              className={
                hasDebt
                  ? "mt-2 text-3xl font-black text-yellow-200"
                  : "mt-2 text-3xl font-black text-lime-300"
              }
            >
              {money(account.saldo)}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {hasDebt ? "Pendiente" : "Sin deuda"}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Ventas a cuenta" value={money(account.totalVentas)} />
        <Metric label="Pagos registrados" value={money(account.totalPagos)} />
        <Metric
          label="Movimientos"
          value={String(account.cantidadMovimientos)}
        />
        <Metric
          label="Estado"
          value={hasDebt ? "Pendiente" : "Cancelada"}
          tone={hasDebt ? "warning" : "ok"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Registrar pago</h2>
          <form action={registerAccountPaymentAction} className="mt-5 grid gap-4">
            <input type="hidden" name="clienteId" value={account.clienteId} />
            <label className="text-sm font-semibold text-zinc-200">
              Monto
              <input
                name="monto"
                type="number"
                min="0.01"
                max={hasDebt ? account.saldo.toFixed(2) : undefined}
                step="0.01"
                placeholder={hasDebt ? `Hasta ${money(account.saldo)}` : ""}
                disabled={!hasDebt}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300 disabled:opacity-50"
                required
              />
              {hasDebt ? (
                <span className="mt-1 block text-xs text-zinc-500">
                  Para cancelar total: {money(account.saldo)}
                </span>
              ) : null}
            </label>
            <label className="text-sm font-semibold text-zinc-200">
              Forma de pago
              <select
                name="formaPago"
                disabled={!hasDebt}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300 disabled:opacity-50"
                required
              >
                {accountPaymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-zinc-200">
              Nota
              <textarea
                name="nota"
                rows={3}
                placeholder="Opcional"
                disabled={!hasDebt}
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300 disabled:opacity-50"
              />
            </label>
            <button
              disabled={!hasDebt}
              className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Registrar pago
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Historial</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Movimiento</th>
                    <th className="px-3 py-3">Importe</th>
                    <th className="px-3 py-3">Saldo</th>
                    <th className="px-3 py-3">Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMovements.items.map((movement) => (
                    <tr key={movement.id} className="border-t border-white/10">
                      <td className="px-3 py-3 text-zinc-400">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            movement.tipo === "venta"
                              ? "rounded-md bg-yellow-300 px-2 py-1 text-xs font-black uppercase text-black"
                              : "rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black"
                          }
                        >
                          {movement.tipo === "venta" ? "Deuda" : "Pago"}
                        </span>
                        <p className="mt-1 text-xs text-zinc-500">
                          {movement.formaPago
                            ? paymentMethodLabels[movement.formaPago]
                            : movement.nota ?? "Venta mostrador"}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-bold text-white">
                        {movement.tipo === "venta" ? "+" : "-"}{" "}
                        {money(movement.monto)}
                      </td>
                      <td
                        className={
                          movement.saldo > 0
                            ? "px-3 py-3 font-black text-yellow-200"
                            : "px-3 py-3 font-black text-lime-300"
                        }
                      >
                        {money(movement.saldo)}
                      </td>
                      <td className="px-3 py-3">
                        {movement.ventaId ? (
                          <Link
                            href={`/vendedor/ventas/${movement.ventaId}/ticket?volver=${encodeURIComponent(detailHref)}`}
                            className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
                          >
                            Ver venta
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/cuentas-corrientes/pagos/${movement.id}/ticket`}
                            className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
                          >
                            Ver recibo
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls
            pagination={paginatedMovements}
            basePath={`/admin/cuentas-corrientes/${account.clienteId}`}
          />
        </section>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warning";
}) {
  const valueClass =
    tone === "warning"
      ? "mt-3 text-2xl font-black text-yellow-200"
      : tone === "ok"
        ? "mt-3 text-2xl font-black text-lime-300"
        : "mt-3 text-2xl font-black text-white";

  return (
    <div className="rounded-lg border border-white/10 bg-black p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}
