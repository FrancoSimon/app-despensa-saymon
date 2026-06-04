import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { ModuleCard } from "@/components/layout/module-card";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function WholesalePage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return (
    <AppShell profile={profile} title="Portal mayorista">
      <div className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          title="Catalogo"
          description="Productos habilitados para mayoristas con precio fijo y especial."
        />
        <ModuleCard
          title="Nuevo pedido"
          description="Carrito mayorista con fecha de reparto limitada a sabados."
        />
        <ModuleCard
          title="Mis pedidos"
          description="Historial de pedidos pendientes, confirmados, entregados o rechazados."
        />
      </div>
    </AppShell>
  );
}
