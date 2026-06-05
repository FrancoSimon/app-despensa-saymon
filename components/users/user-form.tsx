import { roleLabels } from "@/lib/auth/roles";
import type { AdminUser } from "@/lib/users/types";

type UserFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  user?: AdminUser;
  submitLabel: string;
  requirePassword?: boolean;
};

const inputClass =
  "h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-300";

const labelClass = "mb-2 block text-sm font-medium text-zinc-200";

export function UserForm({
  action,
  user,
  submitLabel,
  requirePassword = false,
}: UserFormProps) {
  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nombre</label>
          <input
            className={inputClass}
            name="nombre"
            defaultValue={user?.nombre}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            name="email"
            type="email"
            defaultValue={user?.email}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className={labelClass}>Rol</label>
          <select
            className={inputClass}
            name="rol"
            defaultValue={user?.rol ?? "vendedor"}
            required
          >
            <option value="admin">{roleLabels.admin}</option>
            <option value="vendedor">{roleLabels.vendedor}</option>
            <option value="mayorista">{roleLabels.mayorista}</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Localidad</label>
          <input
            className={inputClass}
            name="localidad"
            defaultValue={user?.localidad ?? ""}
            placeholder="Obligatoria para mayoristas"
          />
        </div>
        <div>
          <label className={labelClass}>Telefono</label>
          <input
            className={inputClass}
            name="telefono"
            defaultValue={user?.telefono ?? ""}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {requirePassword ? "Password" : "Nuevo password"}
        </label>
        <input
          className={inputClass}
          name="password"
          type="password"
          minLength={6}
          required={requirePassword}
          placeholder={requirePassword ? "Minimo 6 caracteres" : "Opcional"}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            name="activo"
            type="checkbox"
            value="on"
            defaultChecked={user?.activo ?? true}
            className="size-4 accent-lime-300"
          />
          Usuario activo
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
