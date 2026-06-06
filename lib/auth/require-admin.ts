import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/profile";
import { roleHome } from "@/lib/auth/roles";
import type { UserProfile, UserRole } from "@/lib/auth/types";

async function requireRole(allowedRoles: UserRole[]): Promise<UserProfile> {
  const { profile } = await getCurrentProfile();

  if (!profile) {
    redirect("/perfil-pendiente");
  }

  if (!allowedRoles.includes(profile.rol)) {
    redirect(roleHome[profile.rol]);
  }

  return profile;
}

export async function requireAdminProfile() {
  return requireRole(["admin"]);
}

export async function requireSellerProfile() {
  return requireRole(["admin", "vendedor"]);
}

export async function requireWholesaleProfile() {
  return requireRole(["admin", "mayorista"]);
}
