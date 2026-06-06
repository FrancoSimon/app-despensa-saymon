import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { CashRegisterPanel } from "@/components/cash/cash-register-panel";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth/profile";
import {
  getCurrentCashRegister,
  listCashRegisterMovements,
} from "@/lib/cash/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function SellerCashRegisterPage() {
  await connection();

  if (!getSupabaseEnv()) {
    redirect("/login");
  }

  const { profile } = await getCurrentProfile();

  if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
    redirect("/");
  }

  const cashRegister = await getCurrentCashRegister();
  const movements = cashRegister
    ? await listCashRegisterMovements(cashRegister.id)
    : [];

  return (
    <AppShell profile={profile} title="Caja">
      <div className="mb-5">
        <Link
          href="/vendedor"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al mostrador
        </Link>
      </div>
      <CashRegisterPanel cashRegister={cashRegister} movements={movements} />
    </AppShell>
  );
}
