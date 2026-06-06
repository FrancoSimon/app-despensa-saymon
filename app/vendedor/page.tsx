import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppShell } from "@/components/layout/app-shell";
import { PosTerminal } from "@/components/pos/pos-terminal";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getCurrentCashRegister } from "@/lib/cash/queries";
import { listPosProducts } from "@/lib/products/pos-queries";
import { getSupabaseEnv } from "@/lib/supabase/env";

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      <section className="mb-5 flex flex-col gap-4 rounded-lg border border-white/10 bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
            Estado de caja
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            {cashRegister ? "Caja abierta" : "Caja sin abrir"}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {cashRegister
              ? `Apertura ${formatDateTime(cashRegister.abiertaAt)}. Ventas ${cashRegister.cantidadVentas}. Esperado ${money(cashRegister.efectivoEsperado)}.`
              : "Abri una caja para poder confirmar ventas mostrador."}
          </p>
        </div>
        <Link
          href="/vendedor/caja"
          className={
            cashRegister
              ? "inline-flex h-11 items-center justify-center rounded-md border border-lime-300/50 px-5 text-sm font-black text-lime-100 transition hover:bg-lime-950"
              : "inline-flex h-11 items-center justify-center rounded-md bg-lime-300 px-5 text-sm font-black text-black transition hover:bg-lime-200"
          }
        >
          {cashRegister ? "Cerrar caja" : "Abrir caja"}
        </Link>
      </section>
      <PosTerminal products={products} hasOpenCashRegister={!!cashRegister} />
    </AppShell>
  );
}
