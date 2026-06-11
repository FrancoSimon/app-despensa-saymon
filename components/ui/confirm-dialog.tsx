"use client";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pending?: boolean;
  title: string;
  tone?: "default" | "danger";
};

export function ConfirmDialog({
  cancelLabel = "Cancelar",
  confirmLabel,
  description,
  isOpen,
  onCancel,
  onConfirm,
  pending = false,
  title,
  tone = "default",
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-lg border border-white/10 bg-zinc-950 p-5 shadow-2xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
          Confirmacion
        </p>
        <h2 id="confirm-dialog-title" className="mt-2 text-2xl font-black text-white">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:border-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={
              tone === "danger"
                ? "rounded-md border border-red-400/40 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
                : "rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            }
          >
            {pending ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
