import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/auth/types";
import {
  createPaginatedResult,
  getPagination,
  type PaginationInput,
} from "@/lib/pagination";
import type { AdminUser } from "@/lib/users/types";

function mapProfile(row: ProfileRow): AdminUser {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    localidad: row.localidad,
    telefono: row.telefono,
    activo: row.activo,
  };
}

const profileSelect = `
  id,
  auth_user_id,
  nombre,
  email,
  rol,
  localidad,
  telefono,
  activo
`;

export async function listAdminUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .order("activo", { ascending: false })
    .order("rol", { ascending: true })
    .order("nombre", { ascending: true })
    .returns<ProfileRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data.map(mapProfile);
}

export async function listAdminUsersPaginated(
  paginationInput: PaginationInput = {},
) {
  const supabase = await createClient();
  const pagination = getPagination(paginationInput);
  const { data, error, count } = await supabase
    .from("profiles")
    .select(profileSelect, { count: "exact" })
    .order("activo", { ascending: false })
    .order("rol", { ascending: true })
    .order("nombre", { ascending: true })
    .range(pagination.from, pagination.to)
    .returns<ProfileRow[]>();

  if (error) {
    throw new Error(error.message);
  }

  return createPaginatedResult<AdminUser>({
    items: data.map(mapProfile),
    total: count,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });
}

export async function getAdminUser(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", id)
    .single<ProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}
