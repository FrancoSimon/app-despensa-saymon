import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { PosTerminal } from "@/components/pos/pos-terminal";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getCurrentCashRegister } from "@/lib/cash/queries";
import { listPosProducts } from "@/lib/products/pos-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function SellerPage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const [products, cashRegister] = await Promise.all([
    listPosProducts(),
    getCurrentCashRegister(),
  ]);

  return (
    <AppShell profile={profile} title="Mostrador">
      <PosTerminal products={products} hasOpenCashRegister={!!cashRegister} />
    </AppShell>
  );
}
