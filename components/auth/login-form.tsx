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
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const nextFieldErrors: typeof fieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextFieldErrors.email = "Ingresa el email del usuario.";
    } else if (!trimmedEmail.includes("@")) {
      nextFieldErrors.email = "Ingresa un email valido.";
    }

    if (!password) {
      nextFieldErrors.password = "Ingresa la contrasena.";
    }

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    if (!hasSupabaseConfig) {
      setError("Faltan las variables de entorno de Supabase.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Email
        </label>
        <input
          id="login-email"
          className={
            fieldErrors.email
              ? "h-12 w-full rounded-md border border-yellow-300/50 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-300"
              : "h-12 w-full rounded-md border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          }
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }}
          placeholder="usuario@saymon.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p
            id="login-email-error"
            className="mt-2 rounded-md border border-yellow-300/30 bg-yellow-950/20 px-3 py-2 text-sm text-yellow-100"
          >
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Contrasena
        </label>
        <input
          id="login-password"
          className={
            fieldErrors.password
              ? "h-12 w-full rounded-md border border-yellow-300/50 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-300"
              : "h-12 w-full rounded-md border border-white/10 bg-black px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300"
          }
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }}
          placeholder="Tu contrasena"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "login-password-error" : undefined
          }
        />
        {fieldErrors.password ? (
          <p
            id="login-password-error"
            className="mt-2 rounded-md border border-yellow-300/30 bg-yellow-950/20 px-3 py-2 text-sm text-yellow-100"
          >
            {fieldErrors.password}
          </p>
        ) : null}
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
