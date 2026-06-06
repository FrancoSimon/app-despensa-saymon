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
  searchParams: Promise<{ estado?: string; volver?: string }>;
};

function getBackHref(value: string | undefined) {
  if (value?.startsWith("/admin/reportes")) {
    return value;
  }

  return "/admin";
}

export default async function AdminWholesaleOrdersPage({
  searchParams,
}: AdminWholesaleOrdersPageProps) {
  const profile = await requireAdminProfile();
  const { estado, volver } = await searchParams;
  const status = isAdminWholesaleOrderStatusFilter(estado) ? estado : "pendiente";
  const backHref = getBackHref(volver);
  const orders = await listWholesaleOrdersForAdmin(status);

  return (
    <AppShell profile={profile} title="Pedidos mayoristas">
      <div className="mb-5">
        <Link
          href={backHref}
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          {backHref.startsWith("/admin/reportes")
            ? "Volver a reportes"
            : "Volver al panel"}
        </Link>
      </div>
      <AdminPendingOrders
        orders={orders}
        selectedStatus={status}
        deliveryOptions={getWholesaleDeliveryOptions(10)}
        returnHref={backHref === "/admin" ? null : backHref}
      />
    </AppShell>
  );
}
