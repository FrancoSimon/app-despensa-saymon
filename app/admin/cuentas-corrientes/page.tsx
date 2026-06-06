import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { registerAccountPaymentAction } from "@/lib/accounts/actions";
import {
  listCustomerAccountSummaries,
  listRecentAccountMovements,
} from "@/lib/accounts/queries";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { paymentMethodLabels, paymentMethodOptions } from "@/lib/sales/payment-methods";

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

export default async function AdminCurrentAccountsPage() {
  const profile = await requireAdminProfile();
  const [accounts, movements] = await Promise.all([
    listCustomerAccountSummaries(),
    listRecentAccountMovements(),
  ]);
  const totalDebt = accounts.reduce((sum, account) => sum + account.saldo, 0);

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

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Saldos por cliente</h2>
          <div className="mt-5 grid gap-4">
            {accounts.map((account) => {
              const hasDebt = account.saldo > 0;

              return (
                <article
                  key={account.clienteId}
                  className="rounded-md border border-white/10 bg-zinc-950 p-4"
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div>
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
                    </div>
                    <div className="text-left lg:text-right">
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
                    </div>
                  </div>

                  <form
                    action={registerAccountPaymentAction}
                    className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr_auto]"
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
                        defaultValue={hasDebt ? account.saldo.toFixed(2) : ""}
                        disabled={!hasDebt}
                        className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition focus:border-lime-300 disabled:opacity-50"
                        required
                      />
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
                      className="self-end rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Registrar pago
                    </button>
                  </form>
                </article>
              );
            })}

            {accounts.length === 0 ? (
              <p className="rounded-md border border-white/10 bg-zinc-950 p-8 text-center text-zinc-400">
                Todavia no hay movimientos de cuenta corriente.
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
                  {movements.map((movement) => (
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
                  {movements.length === 0 ? (
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
