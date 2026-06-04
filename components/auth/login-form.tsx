"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  hasSupabaseConfig: boolean;
};

export function LoginForm({ hasSupabaseConfig }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!hasSupabaseConfig) {
      setError("Faltan las variables de entorno de Supabase.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signInError) {
      setError("Credenciales invalidas");
      return;
    }

    router.replace(searchParams.get("next") ?? "/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Email
        </label>
        <input
          className="h-12 w-full rounded-md border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="usuario@saymon.com"
          required
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-200">
          Contrasena
        </label>
        <input
          className="h-12 w-full rounded-md border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Tu contrasena"
          required
        />
      </div>
      {error ? (
        <p className="rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}
      <button
        className="h-12 w-full rounded-md bg-lime-300 font-bold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}

