import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "@/components/auth/logout-button";
import { roleLabels } from "@/lib/auth/roles";
import type { UserProfile } from "@/lib/auth/types";

type AppShellProps = {
  profile: UserProfile;
  title: string;
  children: React.ReactNode;
};

export function AppShell({ profile, title, children }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo-saymon.jpeg"
              alt="Logo SAYMON"
              width={40}
              height={40}
              className="size-10 rounded-full border border-lime-400/70 object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">
                SAYMON
              </p>
              <p className="text-sm text-zinc-300">{roleLabels[profile.rol]}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-300 sm:inline">
              {profile.nombre}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-lime-300">
            Panel
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
