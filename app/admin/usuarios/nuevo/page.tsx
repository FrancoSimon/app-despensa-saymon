import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { UserForm } from "@/components/users/user-form";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createUserAction } from "@/lib/users/actions";

export default async function NewUserPage() {
  const profile = await requireAdminProfile();

  return (
    <AppShell profile={profile} title="Nuevo usuario">
      <div className="mb-5">
        <Link
          href="/admin/usuarios"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver a usuarios
        </Link>
      </div>
      <section className="rounded-lg border border-white/10 bg-zinc-950 p-5">
        <UserForm
          action={createUserAction}
          submitLabel="Crear usuario"
          requirePassword
        />
      </section>
    </AppShell>
  );
}
