import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PaginationControls } from "@/components/navigation/pagination-controls";
import { AdminPendingOrders } from "@/components/wholesale/admin-pending-orders";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { parsePage } from "@/lib/pagination";
import { getWholesaleDeliveryOptions } from "@/lib/wholesale/dates";
import {
  isAdminWholesaleOrderStatusFilter,
  listWholesaleOrdersForAdmin,
} from "@/lib/wholesale/queries";

type AdminWholesaleOrdersPageProps = {
  searchParams: Promise<{ estado?: string; pagina?: string; volver?: string }>;
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
  const { estado, pagina, volver } = await searchParams;
  const status = isAdminWholesaleOrderStatusFilter(estado) ? estado : "pendiente";
  const backHref = getBackHref(volver);
  const page = parsePage(pagina);
  const paginationQuery = new URLSearchParams();

  if (status !== "pendiente") {
    paginationQuery.set("estado", status);
  }

  if (backHref !== "/admin") {
    paginationQuery.set("volver", backHref);
  }

  const orders = await listWholesaleOrdersForAdmin(status, { page });

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
        orders={orders.items}
        selectedStatus={status}
        deliveryOptions={getWholesaleDeliveryOptions(10)}
        returnHref={backHref === "/admin" ? null : backHref}
      />
      <PaginationControls
        pagination={orders}
        basePath="/admin/pedidos"
        query={paginationQuery}
      />
    </AppShell>
  );
}
