import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { AdminPendingOrders } from "@/components/wholesale/admin-pending-orders";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getWholesaleDeliveryOptions } from "@/lib/wholesale/dates";
import {
  isAdminWholesaleOrderStatusFilter,
  listWholesaleOrdersForAdmin,
} from "@/lib/wholesale/queries";

type AdminWholesaleOrdersPageProps = {
  searchParams: Promise<{ estado?: string }>;
};

export default async function AdminWholesaleOrdersPage({
  searchParams,
}: AdminWholesaleOrdersPageProps) {
  const profile = await requireAdminProfile();
  const { estado } = await searchParams;
  const status = isAdminWholesaleOrderStatusFilter(estado) ? estado : "pendiente";
  const orders = await listWholesaleOrdersForAdmin(status);

  return (
    <AppShell profile={profile} title="Pedidos mayoristas">
      <div className="mb-5">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
      </div>
      <AdminPendingOrders
        orders={orders}
        selectedStatus={status}
        deliveryOptions={getWholesaleDeliveryOptions(10)}
      />
    </AppShell>
  );
}
