import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { ModuleCard } from "@/components/layout/module-card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getLowStockCount } from "@/lib/products/queries";

export default async function AdminPage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const lowStockCount = await getLowStockCount();

  return (
    <AppShell profile={profile} title="Administracion">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ModuleCard
          title="Productos"
          description="Alta, precios, stock minimo, imagenes y activacion mayorista."
          href="/admin/productos"
        />
        <ModuleCard
          title="Pedidos"
          description="Confirmacion o rechazo de pedidos mayoristas con control de stock."
        />
        <ModuleCard
          title="Stock bajo"
          description="Alertas para productos por debajo del minimo configurado."
          meta={lowStockCount === null ? "N/D" : String(lowStockCount)}
        />
        <ModuleCard
          title="Reportes"
          description="Ventas de hoy, productos mas vendidos y exportaciones futuras."
        />
      </div>
    </AppShell>
  );
}
