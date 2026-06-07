import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { roleHome } from "@/lib/auth/roles";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default async function Home() {
  const hasSupabaseConfig = Boolean(getSupabaseEnv());

  if (hasSupabaseConfig) {
    await connection();
    const { profile } = await getCurrentProfile();

    if (profile) {
      redirect(roleHome[profile.rol]);
    }
  }

  return (
    <main className="min-h-dvh bg-black text-white">
      <section className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-saymon.jpeg"
              alt="Logo SAYMON"
              width={44}
              height={44}
              className="size-11 rounded-full border border-lime-400/70 object-cover"
              priority
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-lime-300">
                Comercio
              </p>
              <p className="text-lg font-black">SAYMON</p>
            </div>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-lime-300/60 px-4 py-2 text-sm font-semibold text-lime-200 transition hover:bg-lime-300 hover:text-black"
          >
            Ingresar
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-lime-300">
              Bienvenido
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-7xl">
              Comercio SAYMON, cerca de cada cliente.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Un espacio preparado para trabajar con orden, atender mejor y
              acompañar el movimiento diario del comercio.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-full bg-lime-300 px-6 py-3 text-center font-bold text-black transition hover:bg-lime-200"
              >
                Iniciar sesion
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-lime-300/30 bg-zinc-950 p-6 shadow-2xl shadow-lime-500/10">
            <Image
              src="/logo-saymon.jpeg"
              alt="Logo SAYMON"
              width={640}
              height={640}
              className="aspect-square w-full rounded-md object-cover"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
