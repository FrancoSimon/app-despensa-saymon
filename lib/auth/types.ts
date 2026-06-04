export type UserRole = "admin" | "vendedor" | "mayorista";

export type UserProfile = {
  id: string;
  authUserId: string;
  nombre: string;
  email: string;
  rol: UserRole;
  localidad: string | null;
  telefono: string | null;
  activo: boolean;
};

export type ProfileRow = {
  id: string;
  auth_user_id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  localidad: string | null;
  telefono: string | null;
  activo: boolean;
};
