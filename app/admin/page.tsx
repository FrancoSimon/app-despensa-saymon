import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { ModuleCard } from "@/components/layout/module-card";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getLowStockCount } from "@/lib/products/queries";
import { getTodayReportDateRange } from "@/lib/reports/dates";
import {
  getCashRegisterReportSummary,
  getSalesSummary,
} from "@/lib/reports/queries";
import { getPendingWholesaleOrderCount } from "@/lib/wholesale/queries";

function money(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits,
  }).format(value);
}

export default async function AdminPage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const profile = await requireAdminProfile();

  const todayRange = getTodayReportDateRange();
  const todaySalesHref = `/admin/ventas?desde=${todayRange.from}&hasta=${todayRange.to}`;
  const todayCashRegistersHref = `/admin/cajas?desde=${todayRange.from}&hasta=${todayRange.to}`;
  const [
    lowStockCount,
    pendingOrdersCount,
    todaySales,
    todayCashRegisters,
  ] = await Promise.all([
    getLowStockCount(),
    getPendingWholesaleOrderCount(),
    getSalesSummary(todayRange),
    getCashRegisterReportSummary(todayRange),
  ]);

  return (
    <AppShell profile={profile} title="Administracion">
      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <IndicatorCard
          title="Ventas hoy"
          value={money(todaySales.total)}
          detail={`${todaySales.count} operaciones`}
          href={todaySalesHref}
        />
        <IndicatorCard
          title="Efectivo"
          value={money(todaySales.cashTotal)}
          detail="Ventas mostrador"
          href={todaySalesHref}
        />
        <IndicatorCard
          title="Cajas hoy"
          value={String(todayCashRegisters.count)}
          detail={`${todayCashRegisters.closedCount} cerradas`}
          href={todayCashRegistersHref}
        />
        <IndicatorCard
          title="Diferencia caja"
          value={money(todayCashRegisters.cashDifferenceTotal)}
          detail="Cierres del dia"
          href={todayCashRegistersHref}
          tone={todayCashRegisters.cashDifferenceTotal < 0 ? "warning" : "ok"}
        />
        <IndicatorCard
          title="Stock bajo"
          value={lowStockCount === null ? "N/D" : String(lowStockCount)}
          detail="Productos a revisar"
          href="/admin/stock"
          tone="warning"
        />
        <IndicatorCard
          title="Pedidos pendientes"
          value={
            pendingOrdersCount === null ? "N/D" : String(pendingOrdersCount)
          }
          detail="Mayoristas"
          href="/admin/pedidos?estado=pendiente"
        />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <ModuleCard
          title="Ventas"
          description="Listado de ventas mostrador, tickets y anulaciones."
          href="/admin/ventas"
        />
        <ModuleCard
          title="Cajas"
          description="Aperturas, cierres y diferencias por operador."
          href="/admin/cajas"
        />
        <ModuleCard
          title="Cuentas corrientes"
          description="Saldos de clientes, pagos parciales y recibos."
          href="/admin/cuentas-corrientes"
        />
        <ModuleCard
          title="Productos"
          description="Alta, precios, stock minimo, imagenes y activacion mayorista."
          href="/admin/productos"
        />
        <ModuleCard
          title="Usuarios"
          description="Alta y edicion de administradores, vendedores y mayoristas."
          href="/admin/usuarios"
        />
        <ModuleCard
          title="Pedidos"
          description="Confirmacion o rechazo de pedidos mayoristas con control de stock."
          href="/admin/pedidos"
          meta={pendingOrdersCount === null ? "N/D" : String(pendingOrdersCount)}
        />
        <ModuleCard
          title="Stock bajo"
          description="Alertas para productos por debajo del minimo configurado."
          href="/admin/stock"
          meta={lowStockCount === null ? "N/D" : String(lowStockCount)}
        />
        <ModuleCard
          title="Reportes"
          description="Ventas, cajas, stock bajo, pedidos y exportaciones CSV."
          href="/admin/reportes"
          meta={money(todaySales.total)}
        />
      </div>
    </AppShell>
  );
}

function IndicatorCard({
  title,
  value,
  detail,
  href,
  tone = "default",
}: {
  title: string;
  value: string;
  detail: string;
  href: string;
  tone?: "default" | "ok" | "warning";
}) {
  const valueClass =
    tone === "warning"
      ? "mt-3 text-2xl font-black text-yellow-200"
      : tone === "ok"
        ? "mt-3 text-2xl font-black text-lime-300"
        : "mt-3 text-2xl font-black text-white";

  return (
    <Link
      href={href}
      className="rounded-lg border border-white/10 bg-black p-5 transition hover:border-lime-300"
    >
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </p>
      <p className={valueClass}>{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{detail}</p>
    </Link>
  );
}
