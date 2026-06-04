import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";

export async function requireAdminProfile() {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    redirect("/perfil-pendiente");
  }

  if (profile.rol !== "admin") {
    redirect("/");
  }

  return profile;
}

