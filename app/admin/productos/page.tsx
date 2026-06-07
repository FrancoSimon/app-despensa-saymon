import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { deactivateProductAction } from "@/lib/products/actions";
import { listAdminProductsPaginated } from "@/lib/products/queries";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parsePage } from "@/lib/pagination";

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; pagina?: string }>;
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function AdminProductsPage({
  searchParams,
}: ProductsPageProps) {
  const profile = await requireAdminProfile();
  const { q, pagina } = await searchParams;
  const products = await listAdminProductsPaginated(q, {
    page: parsePage(pagina),
  });
  const paginationQuery = new URLSearchParams();

  if (q) {
    paginationQuery.set("q", q);
  }

  return (
    <AppShell profile={profile} title="Productos">
      <div className="mb-5">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex w-full gap-2 sm:max-w-md">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, categoria o codigo"
            className="h-11 min-w-0 flex-1 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          />
          <button className="rounded-md border border-white/15 px-4 text-sm font-bold text-white transition hover:border-lime-300 hover:text-lime-200">
            Buscar
          </button>
        </form>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-md bg-lime-300 px-4 py-3 text-center text-sm font-black text-black transition hover:bg-lime-200"
        >
          Nuevo producto
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Mostrador</th>
                <th className="px-4 py-3">Mayorista</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.items.map((product) => {
                const lowStock = product.stock < product.stockMinimo;

                return (
                  <tr key={product.id} className="border-t border-white/10">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">{product.nombre}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {product.codigoBarras ?? "Sin codigo"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {product.categoria}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {money(product.precioMostrador)}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {money(product.precioMayoristaFijo)}
                    </td>
                    <td className="px-4 py-4 text-zinc-300">
                      {money(product.costoCompra)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          lowStock
                            ? "font-black text-yellow-200"
                            : "text-zinc-300"
                        }
                      >
                        {product.stock}
                      </span>
                      <span className="text-zinc-600"> / min {product.stockMinimo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-zinc-200">
                          {product.activo ? "Activo" : "Inactivo"}
                        </span>
                        {product.habilitadoMayorista ? (
                          <span className="rounded-full bg-lime-300 px-2.5 py-1 text-xs font-bold text-black">
                            Mayorista
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/productos/${product.id}/editar`}
                          className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                        >
                          Editar
                        </Link>
                        {product.activo ? (
                          <form action={deactivateProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <button className="rounded-md border border-red-400/30 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-950">
                              Desactivar
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                    No hay productos para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <PaginationControls
        pagination={products}
        basePath="/admin/productos"
        query={paginationQuery}
      />
    </AppShell>
  );
}
