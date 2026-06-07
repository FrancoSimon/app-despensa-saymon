import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { StockProductSelector } from "@/components/stock/stock-product-selector";
import { StockSupplierSelector } from "@/components/stock/stock-supplier-selector";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parsePage } from "@/lib/pagination";
import { listAdminProducts } from "@/lib/products/queries";
import {
  registerStockMovementAction,
  registerStockPurchaseAction,
} from "@/lib/stock/actions";
import {
  listActiveSuppliers,
  listStockMovementsPaginated,
  listStockPurchasesPaginated,
} from "@/lib/stock/queries";

type AdminStockPageProps = {
  searchParams: Promise<{
    comprasPagina?: string;
    movimientosPagina?: string;
  }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function dateInputToday() {
  const date = new Date();
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const ORIGIN_LABELS = {
  manual: "Manual",
  venta_mostrador: "Mostrador",
  pedido_mayorista: "Mayorista",
  compra: "Compra",
};

export default async function AdminStockPage({
  searchParams,
}: AdminStockPageProps) {
  const profile = await requireAdminProfile();
  const { comprasPagina, movimientosPagina } = await searchParams;
  const purchasesPage = parsePage(comprasPagina);
  const movementsPage = parsePage(movimientosPagina);
  const [products, suppliers, purchases, movements] = await Promise.all([
    listAdminProducts(),
    listActiveSuppliers(),
    listStockPurchasesPaginated({ page: purchasesPage }),
    listStockMovementsPaginated({ page: movementsPage }),
  ]);
  const purchasesQuery = new URLSearchParams();
  const movementsQuery = new URLSearchParams();

  if (movementsPage > 1) {
    purchasesQuery.set("movimientosPagina", String(movementsPage));
  }

  if (purchasesPage > 1) {
    movementsQuery.set("comprasPagina", String(purchasesPage));
  }

  const activeProducts = products.filter((product) => product.activo);
  const lowStockProducts = activeProducts
    .filter((product) => product.stock < product.stockMinimo)
    .sort((a, b) => a.stock - b.stock || a.nombre.localeCompare(b.nombre));
  const today = dateInputToday();

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

      <section className="mb-6 rounded-lg border border-yellow-300/20 bg-black p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-white">
              Productos con stock bajo
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Productos activos por debajo del minimo configurado.
            </p>
          </div>
          <p className="rounded-md bg-yellow-300 px-3 py-2 text-sm font-black text-black">
            {lowStockProducts.length}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lowStockProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-md border border-white/10 bg-zinc-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-white">{product.nombre}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {product.categoria}
                  </p>
                </div>
                <p className="shrink-0 text-right text-lg font-black text-yellow-200">
                  {product.stock}
                  <span className="text-sm text-zinc-500">
                    {" "}
                    / min {product.stockMinimo}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/admin/productos/${product.id}/editar?volver=${encodeURIComponent("/admin/stock")}`}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-lime-300 hover:text-lime-200"
                >
                  Editar producto
                </Link>
              </div>
            </article>
          ))}

          {lowStockProducts.length === 0 ? (
            <p className="rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400 md:col-span-2 xl:col-span-3">
              No hay productos con stock bajo.
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">
            Registrar compra / lote
          </h2>
          <form action={registerStockPurchaseAction} className="mt-5 grid gap-4">
            <StockProductSelector
              products={activeProducts}
              name="productoId"
              label="Producto"
            />

            <StockSupplierSelector suppliers={suppliers} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">
                Cantidad comprada
                <input
                  name="cantidad"
                  type="number"
                  min="1"
                  step="1"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Costo unitario
                <input
                  name="costoUnitario"
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-zinc-200">
                Fecha de compra
                <input
                  name="fechaCompra"
                  type="date"
                  defaultValue={today}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Comprobante
                <input
                  name="comprobante"
                  placeholder="Factura, remito, ticket..."
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
                />
              </label>
            </div>

            <label className="text-sm font-semibold text-zinc-200">
              Notas
              <textarea
                name="notas"
                rows={3}
                placeholder="Detalle del lote, vencimiento, condiciones..."
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
              />
            </label>

            <button className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200">
              Registrar compra y sumar stock
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Compras recientes</h2>
          <div className="mt-5 overflow-hidden rounded-md border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
                  <tr>
                    <th className="px-3 py-3">Fecha</th>
                    <th className="px-3 py-3">Proveedor</th>
                    <th className="px-3 py-3">Producto</th>
                    <th className="px-3 py-3">Cant.</th>
                    <th className="px-3 py-3">Costo unit.</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Comprobante</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.items.map((purchase) => (
                    <tr key={purchase.id} className="border-t border-white/10">
                      <td className="px-3 py-3 text-zinc-400">
                        {formatDateOnly(purchase.fechaCompra)}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {purchase.proveedorNombre}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-white">
                          {purchase.productoNombre}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {purchase.productoCategoria}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {purchase.cantidad}
                      </td>
                      <td className="px-3 py-3 text-zinc-300">
                        {money(purchase.costoUnitario)}
                      </td>
                      <td className="px-3 py-3 font-bold text-white">
                        {money(purchase.costoTotal)}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">
                        {purchase.comprobante ?? "-"}
                      </td>
                    </tr>
                  ))}
                  {purchases.items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-3 py-8 text-center text-zinc-400"
                      >
                        No hay compras registradas.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationControls
            pagination={purchases}
            basePath="/admin/stock"
            pageParam="comprasPagina"
            query={purchasesQuery}
          />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-white/10 bg-black p-5">
          <h2 className="text-xl font-black text-white">Movimiento manual</h2>
          <form action={registerStockMovementAction} className="mt-5 grid gap-4">
            <StockProductSelector
              products={activeProducts}
              name="productoId"
              label="Producto"
            />

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
                placeholder="Rotura, conteo manual, ajuste..."
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
              />
            </label>

            <button className="rounded-md border border-lime-300/70 px-5 py-3 text-sm font-black text-lime-100 transition hover:bg-lime-950">
              Registrar ajuste manual
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
                  {movements.items.map((movement) => (
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
                  {movements.items.length === 0 ? (
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
          <PaginationControls
            pagination={movements}
            basePath="/admin/stock"
            pageParam="movimientosPagina"
            query={movementsQuery}
          />
        </section>
      </div>
    </AppShell>
  );
}
