import type { UserRole } from "@/lib/auth/types";

export const roleLabels: Record<UserRole, string> = {
  admin: "Administracion",
  vendedor: "Mostrador",
  mayorista: "Mayorista",
};

export const roleHome: Record<UserRole, string> = {
  admin: "/admin",
  vendedor: "/vendedor",
  mayorista: "/mayorista",
};

const protectedPrefixes: Record<UserRole, string[]> = {
  admin: ["/admin", "/vendedor", "/mayorista"],
  vendedor: ["/vendedor"],
  mayorista: ["/mayorista"],
};

export function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "vendedor" || value === "mayorista";
}

export function isAllowedPath(role: UserRole, pathname: string) {
  return protectedPrefixes[role].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isProtectedPath(pathname: string) {
  return Object.values(roleHome).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

