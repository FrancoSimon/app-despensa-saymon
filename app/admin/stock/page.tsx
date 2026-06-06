import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { listAdminProducts } from "@/lib/products/queries";
import { registerStockMovementAction } from "@/lib/stock/actions";
import { listRecentStockMovements } from "@/lib/stock/queries";

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ORIGIN_LABELS = {
  manual: "Manual",
  venta_mostrador: "Mostrador",
  pedido_mayorista: "Mayorista",
};

export default async function AdminStockPage() {
  const profile = await requireAdminProfile();
  const [products, movements] = await Promise.all([
    listAdminProducts(),
    listRecentStockMovements(),
  ]);
  const activeProducts = products.filter((product) => product.activo);

  return (
    <AppShell profile={profile} title="Stock">
      <div className="mb-5">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Nuevo movimiento</h2>
          <form action={registerStockMovementAction} className="mt-5 grid gap-4">
            <label className="text-sm font-semibold text-zinc-200">
              Producto
              <select
                name="productoId"
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                required
              >
                <option value="">Seleccionar producto</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nombre} - Stock {product.stock}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">
                Tipo
                <select
                  name="tipo"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Cantidad
                <input
                  name="cantidad"
                  type="number"
                  min="1"
                  step="1"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
            </div>

            <label className="text-sm font-semibold text-zinc-200">
              Motivo
              <textarea
                name="motivo"
                rows={3}
                placeholder="Compra, rotura, conteo manual..."
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
              />
            </label>

            <button className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200">
              Registrar movimiento
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Movimientos recientes</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Producto</th>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Origen</th>
                    <th className="px-3 py-3">Cant.</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Motivo</th>
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
                          {movement.productoNombre}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {movement.productoCategoria}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={
                            movement.tipo === "entrada"
                              ? "rounded-md bg-lime-300 px-2 py-1 text-xs font-black uppercase text-black"
                              : "rounded-md bg-yellow-300 px-2 py-1 text-xs font-black uppercase text-black"
                          }
                        >
                          {movement.tipo}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {ORIGIN_LABELS[movement.origen]}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {movement.cantidad}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {movement.stockAnterior} a {movement.stockNuevo}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">
                        {movement.motivo ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {movements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-zinc-400"
                      >
                        No hay movimientos registrados.
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
