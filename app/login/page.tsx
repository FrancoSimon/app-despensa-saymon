import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { getSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const hasSupabaseConfig = Boolean(getSupabaseEnv());

  return (
    <main className="grid min-h-dvh bg-black text-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between border-r border-white/10 px-6 py-8 sm:px-10">
        <Link href="/" className="flex items-center gap-3">
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
            <p className="font-black">SAYMON</p>
          </div>
        </Link>
        <div className="py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-lime-300">
            Acceso seguro
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-black leading-tight">
            Mostrador, administracion y mayoristas en un solo sistema.
          </h1>
        </div>
        <p className="text-sm text-zinc-500">
          Fiambala, Catamarca. POS + B2B para el comercio SAYMON.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-6">
          <h2 className="text-2xl font-black">Iniciar sesion</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Ingresa con tu usuario de Supabase Auth asignado por SAYMON.
          </p>
          {!hasSupabaseConfig ? (
            <div className="mt-5 rounded-md border border-yellow-300/30 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-100">
              Configura `NEXT_PUBLIC_SUPABASE_URL` y
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local`.
            </div>
          ) : null}
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="h-12 rounded-md border border-white/10 bg-black" />
              }
            >
              <LoginForm hasSupabaseConfig={hasSupabaseConfig} />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
