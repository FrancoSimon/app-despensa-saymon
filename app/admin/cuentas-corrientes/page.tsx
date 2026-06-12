import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { ConfirmedActionForm } from "@/components/ui/confirmed-action-form";
import { registerAccountPaymentAction } from "@/lib/accounts/actions";
import {
  listAccountMovementsPaginated,
  listCustomerAccountSummaries,
} from "@/lib/accounts/queries";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parsePage } from "@/lib/pagination";
import { paymentMethodLabels, paymentMethodOptions } from "@/lib/sales/payment-methods";

type AdminCurrentAccountsPageProps = {
  searchParams: Promise<{
    movimientosPagina?: string;
    q?: string;
  }>;
};

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

const accountPaymentOptions = paymentMethodOptions.filter(
  (option) => option.value !== "cuenta_corriente",
);

function matchesSearch(
  account: Awaited<ReturnType<typeof listCustomerAccountSummaries>>[number],
  search: string,
) {
  const term = search.trim().toLowerCase();

  if (!term) {
    return true;
  }

  return [
    account.clienteNombre,
    account.clienteTelefono,
    account.clienteRazonSocial,
    account.clienteDocumento,
  ]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .some((value) => value.toLowerCase().includes(term));
}

export default async function AdminCurrentAccountsPage({
  searchParams,
}: AdminCurrentAccountsPageProps) {
  const profile = await requireAdminProfile();
  const { movimientosPagina, q } = await searchParams;
  const search = typeof q === "string" ? q.trim() : "";
  const movementsPage = parsePage(movimientosPagina);
  const [accounts, movements] = await Promise.all([
    listCustomerAccountSummaries(),
    listAccountMovementsPaginated({ page: movementsPage }),
  ]);
  const movementsQuery = new URLSearchParams();

  if (search) {
    movementsQuery.set("q", search);
  }

  const totalDebt = accounts.reduce((sum, account) => sum + account.saldo, 0);
  const filteredAccounts = accounts.filter((account) =>
    matchesSearch(account, search),
  );

  return (
    <AppShell profile={profile} title="Cuentas corrientes">
      <div className="mb-5">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
      </div>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Clientes con cuenta" value={String(accounts.length)} />
        <Metric label="Saldo pendiente" value={money(totalDebt)} />
        <Metric
          label="Con deuda"
          value={String(accounts.filter((account) => account.saldo > 0).length)}
        />
        <Metric
          label="Sin deuda"
          value={String(accounts.filter((account) => account.saldo <= 0).length)}
        />
      </section>

      <form action="/admin/cuentas-corrientes" className="mb-6">
        <label className="block text-sm font-semibold text-zinc-200">
          Buscar cliente
          <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              name="q"
              defaultValue={search}
              placeholder="Nombre, telefono, razon social o documento"
              className="h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
            />
            <button className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200">
              Buscar
            </button>
            {search ? (
              <Link
                href="/admin/cuentas-corrientes"
                className="rounded-md border border-white/10 px-5 py-3 text-center text-sm font-bold text-zinc-300 transition hover:border-lime-300"
              >
                Limpiar
              </Link>
            ) : null}
          </div>
        </label>
      </form>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-black text-white">Saldos por cliente</h2>
            <p className="text-sm text-zinc-500">
              {filteredAccounts.length} de {accounts.length} cuentas
            </p>
          </div>
          <div className="mt-5 grid gap-4">
            {filteredAccounts.map((account) => {
              const hasDebt = account.saldo > 0;

              return (
                <article
                  key={account.clienteId}
                  className="rounded-md border border-white/10 bg-zinc-950 p-4"
                >
                  <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_170px]">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-white">
                        {account.clienteNombre}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {[
                          account.clienteRazonSocial,
                          account.clienteTelefono,
                          account.clienteDocumento,
                        ]
                          .filter(Boolean)
                          .join(" - ") || "Sin datos adicionales"}
                      </p>
                      <p className="mt-1 text-xs text-zinc-600">
                        Ultima actividad: {formatDate(account.ultimaActividad)}
                      </p>
                      <Link
                        href={`/admin/cuentas-corrientes/${account.clienteId}`}
                        className="mt-3 inline-block rounded-md border border-white/10 px-3 py-2 text-sm font-bold text-lime-300 transition hover:border-lime-300"
                      >
                        Ver detalle
                      </Link>
                    </div>
                    <div className="rounded-md border border-white/10 bg-black p-3 text-left lg:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                        Saldo
                      </p>
                      <p
                        className={
                          hasDebt
                            ? "mt-1 text-2xl font-black text-yellow-200"
                            : "mt-1 text-2xl font-black text-lime-300"
                        }
                      >
                        {money(account.saldo)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {hasDebt ? "Pendiente" : "Sin deuda"}
                      </p>
                    </div>
                  </div>

                  <ConfirmedActionForm
                    action={registerAccountPaymentAction}
                    className="mt-4 grid items-end gap-3 lg:grid-cols-[minmax(130px,0.8fr)_minmax(150px,0.9fr)_minmax(180px,1fr)_auto]"
                    title="Registrar pago"
                    description={`Se registrara un pago en la cuenta corriente de ${account.clienteNombre} y se actualizara su saldo.`}
                    confirmLabel="Registrar pago"
                  >
                    <input
                      type="hidden"
                      name="clienteId"
                      value={account.clienteId}
                    />
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
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-lime-300 disabled:opacity-50"
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
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-lime-300 disabled:opacity-50"
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
                      <input
                        name="nota"
                        placeholder="Opcional"
                        disabled={!hasDebt}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300 disabled:opacity-50"
                      />
                    </label>
                    <button
                      disabled={!hasDebt}
                      className="h-11 rounded-md bg-lime-300 px-5 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Registrar pago
                    </button>
                  </ConfirmedActionForm>
                </article>
              );
            })}

            {accounts.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-zinc-950 p-8 text-center text-zinc-400">
                Todavia no hay movimientos de cuenta corriente.
              </p>
            ) : null}
            {accounts.length > 0 && filteredAccounts.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-zinc-950 p-8 text-center text-zinc-400">
                No hay cuentas corrientes para esa busqueda.
              </p>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Movimientos recientes</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.items.map((movement) => (
                    <tr key={movement.id} className="border-t border-white/10">
                      <td className="px-3 py-3 text-zinc-400">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">
                          {movement.clienteNombre}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {movement.clienteTelefono ?? "Sin telefono"}
                        </p>
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
                        {movement.formaPago ? (
                          <p className="mt-1 text-xs text-zinc-500">
                            {paymentMethodLabels[movement.formaPago]}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 font-bold text-white">
                        {movement.tipo === "venta" ? "+" : "-"}{" "}
                        {money(movement.monto)}
                      </td>
                    </tr>
                  ))}
                  {movements.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-3 py-8 text-center text-zinc-400"
                      >
                        No hay movimientos para mostrar.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls
            pagination={movements}
            basePath="/admin/cuentas-corrientes"
            pageParam="movimientosPagina"
            query={movementsQuery}
          />
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-lime-300">{value}</p>
    </div>
  );
}
