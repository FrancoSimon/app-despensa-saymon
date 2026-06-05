export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export type SupabaseAdminEnv = SupabaseEnv & {
  serviceRoleKey: string;
};

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function requireSupabaseEnv(): SupabaseEnv {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return env;
}

export function getSupabaseAdminEnv(): SupabaseAdminEnv | null {
  const env = getSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!env || !serviceRoleKey) {
    return null;
  }

  return { ...env, serviceRoleKey };
}

export function requireSupabaseAdminEnv(): SupabaseAdminEnv {
  const env = getSupabaseAdminEnv();

  if (!env) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local for admin user management.",
    );
  }

  return env;
}
