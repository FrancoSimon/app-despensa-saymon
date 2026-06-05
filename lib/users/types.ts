import type { UserRole } from "@/lib/auth/types";

export type AdminUser = {
  id: string;
  authUserId: string;
  nombre: string;
  email: string;
  rol: UserRole;
  localidad: string | null;
  telefono: string | null;
  activo: boolean;
};

export type UserFormInput = {
  nombre: string;
  email: string;
  password: string | null;
  rol: UserRole;
  localidad: string | null;
  telefono: string | null;
  activo: boolean;
};
