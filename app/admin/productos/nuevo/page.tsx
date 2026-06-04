import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ProductForm } from "@/components/products/product-form";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createProductAction } from "@/lib/products/actions";

export default async function NewProductPage() {
  const profile = await requireAdminProfile();

  return (
    <AppShell profile={profile} title="Nuevo producto">
      <div className="mb-5">
        <Link
          href="/admin/productos"
          className="text-sm font-semibold text-lime-200 hover:text-lime-100"
        >
          Volver a productos
        </Link>
      </div>
      <section className="rounded-lg border border-white/10 bg-zinc-950 p-5">
        <ProductForm action={createProductAction} submitLabel="Crear producto" />
      </section>
    </AppShell>
  );
}

