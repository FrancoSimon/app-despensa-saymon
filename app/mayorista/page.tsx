import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { WholesaleOrderTerminal } from "@/components/wholesale/wholesale-order-terminal";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listWholesaleProducts } from "@/lib/products/wholesale-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getWholesaleDeliveryOptions } from "@/lib/wholesale/dates";
import { listMyWholesaleOrders } from "@/lib/wholesale/queries";

export default async function WholesalePage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  const [products, orders] = await Promise.all([
    listWholesaleProducts(),
    listMyWholesaleOrders(),
  ]);

  return (
    <AppShell profile={profile} title="Portal mayorista">
      <WholesaleOrderTerminal
        products={products}
        deliveryOptions={getWholesaleDeliveryOptions()}
        orders={orders}
      />
    </AppShell>
  );
}
