"use client";

export function PrintTicketButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md bg-lime-300 px-4 py-3 text-sm font-black text-black transition hover:bg-lime-200"
    >
      Imprimir / guardar PDF
    </button>
  );
}
