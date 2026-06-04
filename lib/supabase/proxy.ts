import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedPath, isProtectedPath, roleHome } from "@/lib/auth/roles";
import type { ProfileRow } from "@/lib/auth/types";
import { getSupabaseEnv } from "@/lib/supabase/env";

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();
  let response = NextResponse.next({ request });

  if (!env) {
    return isProtectedPath(request.nextUrl.pathname)
      ? redirectToLogin(request)
      : response;
  }

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  if (!isProtectedPath(pathname)) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin(request);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol, activo")
    .eq("auth_user_id", user.id)
    .eq("activo", true)
    .maybeSingle<Pick<ProfileRow, "rol" | "activo">>();

  if (!profile) {
    const url = request.nextUrl.clone();
    url.pathname = "/perfil-pendiente";
    return NextResponse.redirect(url);
  }

  if (!isAllowedPath(profile.rol, pathname)) {
    return NextResponse.redirect(new URL(roleHome[profile.rol], request.url));
  }

  return response;
}
