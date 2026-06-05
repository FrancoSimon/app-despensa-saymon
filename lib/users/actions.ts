"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminProfile } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseUserForm } from "@/lib/users/validation";

export async function createUserAction(formData: FormData) {
  await requireAdminProfile();
  const input = parseUserForm(formData, { requirePassword: true });
  const supabase = createAdminClient();

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: input.email,
      password: input.password ?? undefined,
      email_confirm: true,
      user_metadata: {
        nombre: input.nombre,
        rol: input.rol,
      },
    });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "No se pudo crear el usuario Auth.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    auth_user_id: authData.user.id,
    nombre: input.nombre,
    email: input.email,
    rol: input.rol,
    localidad: input.localidad,
    telefono: input.telefono,
    activo: input.activo,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(profileError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateUserAction(id: string, formData: FormData) {
  await requireAdminProfile();
  const input = parseUserForm(formData, { requirePassword: false });
  const supabase = createAdminClient();

  const { data: profile, error: profileLoadError } = await supabase
    .from("profiles")
    .select("auth_user_id")
    .eq("id", id)
    .single<{ auth_user_id: string }>();

  if (profileLoadError) {
    throw new Error(profileLoadError.message);
  }

  const authUpdates: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, string>;
  } = {
    email: input.email,
    user_metadata: {
      nombre: input.nombre,
      rol: input.rol,
    },
  };

  if (input.password) {
    authUpdates.password = input.password;
  }

  const { error: authError } = await supabase.auth.admin.updateUserById(
    profile.auth_user_id,
    authUpdates,
  );

  if (authError) {
    throw new Error(authError.message);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      nombre: input.nombre,
      email: input.email,
      rol: input.rol,
      localidad: input.localidad,
      telefono: input.telefono,
      activo: input.activo,
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${id}/editar`);
  redirect("/admin/usuarios");
}
