import Link from "next/link";
import Image from "next/image";

export default function PendingProfilePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 text-white">
      <section className="w-full max-w-lg rounded-lg border border-lime-300/30 bg-zinc-950 p-6 text-center">
        <Image
          src="/logo-saymon.jpeg"
          alt="Logo SAYMON"
          width={56}
          height={56}
          className="mx-auto size-14 rounded-full border border-lime-400/70 object-cover"
        />
        <h1 className="mt-5 text-2xl font-black">Perfil pendiente</h1>
        <p className="mt-3 leading-7 text-zinc-300">
          Tu usuario de Supabase existe, pero todavia no tiene un perfil de
          SAYMON con rol asignado.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-md bg-lime-300 px-5 py-3 font-bold text-black transition hover:bg-lime-200"
        >
          Volver al ingreso
        </Link>
      </section>
    </main>
  );
}
