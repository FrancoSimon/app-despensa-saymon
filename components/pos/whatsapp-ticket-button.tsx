"use client";

type WhatsAppTicketButtonProps = {
  message: string;
};

export function WhatsAppTicketButton({ message }: WhatsAppTicketButtonProps) {
  const href = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-md border border-lime-300/60 px-4 py-3 text-sm font-black text-lime-100 transition hover:bg-lime-950"
    >
      Enviar por WhatsApp
    </a>
  );
}
