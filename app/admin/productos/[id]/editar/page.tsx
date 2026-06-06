import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/products/product-form";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { updateProductAction } from "@/lib/products/actions";
import { getAdminProduct } from "@/lib/products/queries";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    volver?: string;
  }>;
};

function getReturnHref(value: string | undefined) {
  if (value?.startsWith("/admin/stock")) {
    return value;
  }

  return "/admin/productos";
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const profile = await requireAdminProfile();
  const { id } = await params;
  const { volver } = await searchParams;
  const returnHref = getReturnHref(volver);
  const action = updateProductAction.bind(null, id);
  const product = await getAdminProduct(id).catch(() => null);

  if (!product) {
    notFound();
  }

  return (
    <AppShell profile={profile} title={`Editar ${product.nombre}`}>
      <div className="mb-5">
        <Link
          href={returnHref}
          className="text-sm font-semibold text-lime-200 hover:text-lime-100"
        >
          {returnHref === "/admin/productos" ? "Volver a productos" : "Volver a stock"}
        </Link>
      </div>
      <section className="rounded-lg border border-white/10 bg-zinc-950 p-5">
        <ProductForm
          action={action}
          product={product}
          submitLabel="Guardar cambios"
          returnTo={returnHref}
        />
      </section>
    </AppShell>
  );
}
