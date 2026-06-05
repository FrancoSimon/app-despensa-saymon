import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { UserForm } from "@/components/users/user-form";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { updateUserAction } from "@/lib/users/actions";
import { getAdminUser } from "@/lib/users/queries";

type EditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const profile = await requireAdminProfile();
  const { id } = await params;
  const user = await getAdminUser(id);
  const action = updateUserAction.bind(null, id);

  return (
    <AppShell profile={profile} title="Editar usuario">
      <div className="mb-5">
        <Link
          href="/admin/usuarios"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver a usuarios
        </Link>
      </div>
      <section className="rounded-lg border border-white/10 bg-zinc-950 p-5">
        <UserForm action={action} user={user} submitLabel="Guardar cambios" />
      </section>
    </AppShell>
  );
}
