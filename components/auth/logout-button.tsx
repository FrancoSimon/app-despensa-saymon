"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-white/15 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-lime-300 hover:text-lime-200"
    >
      Salir
    </button>
  );
}

