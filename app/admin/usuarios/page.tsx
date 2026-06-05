import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { roleLabels } from "@/lib/auth/roles";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { listAdminUsers } from "@/lib/users/queries";

export default async function AdminUsersPage() {
  const profile = await requireAdminProfile();
  const users = await listAdminUsers();

  return (
    <AppShell profile={profile} title="Usuarios">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin"
          className="text-sm font-bold text-lime-300 transition hover:text-lime-200"
        >
          Volver al panel
        </Link>
        <Link
          href="/admin/usuarios/nuevo"
          className="rounded-md bg-lime-300 px-4 py-3 text-center text-sm font-black text-black transition hover:bg-lime-200"
        >
          Nuevo usuario
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-[0.16em] text-zinc-400">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Localidad</th>
                <th className="px-4 py-3">Telefono</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/10">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{user.nombre}</p>
                    <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {roleLabels[user.rol]}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {user.localidad ?? "-"}
                  </td>
                  <td className="px-4 py-4 text-zinc-300">
                    {user.telefono ?? "-"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        user.activo
                          ? "rounded-full bg-lime-300 px-2.5 py-1 text-xs font-bold text-black"
                          : "rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-zinc-200"
                      }
                    >
                      {user.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/usuarios/${user.id}/editar`}
                      className="rounded-md border border-white/15 px-3 py-2 text-xs font-bold text-white transition hover:border-lime-300 hover:text-lime-200"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
