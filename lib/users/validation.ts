import { isUserRole } from "@/lib/auth/roles";
import type { UserFormInput } from "@/lib/users/types";

function requiredString(formData: FormData, field: string, label: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} es obligatorio.`);
  }

  return value.trim();
}

function optionalString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

export function parseUserForm(
  formData: FormData,
  options: { requirePassword: boolean },
): UserFormInput {
  const nombre = requiredString(formData, "nombre", "Nombre");
  const email = requiredString(formData, "email", "Email").toLowerCase();
  const rol = requiredString(formData, "rol", "Rol");
  const password = optionalString(formData, "password");
  const localidad = optionalString(formData, "localidad");
  const telefono = optionalString(formData, "telefono");

  if (!isUserRole(rol)) {
    throw new Error("Rol invalido.");
  }

  if (!email.includes("@")) {
    throw new Error("Email invalido.");
  }

  if (options.requirePassword && !password) {
    throw new Error("Password es obligatorio.");
  }

  if (password && password.length < 6) {
    throw new Error("Password debe tener al menos 6 caracteres.");
  }

  if (rol === "mayorista" && !localidad) {
    throw new Error("Localidad es obligatoria para mayoristas.");
  }

  return {
    nombre,
    email,
    password,
    rol,
    localidad,
    telefono,
    activo: formData.get("activo") === "on",
  };
}
