import { createClient } from "@/lib/supabase/server";
import type { ProfileRow, UserProfile } from "@/lib/auth/types";
import { isUserRole } from "@/lib/auth/roles";

function mapProfile(row: ProfileRow): UserProfile {
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

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, auth_user_id, nombre, email, rol, localidad, telefono, activo")
    .eq("auth_user_id", user.id)
    .eq("activo", true)
    .maybeSingle<ProfileRow>();

  if (error || !data || !isUserRole(data.rol)) {
    return { user, profile: null };
  }

  return { user, profile: mapProfile(data) };
}
