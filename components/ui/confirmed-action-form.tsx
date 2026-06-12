"use client";

import {
  type FormEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type ConfirmedActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  cancelLabel?: string;
  children: ReactNode;
  className?: string;
  confirmLabel: string;
  description: string;
  title: string;
  tone?: "default" | "danger";
};

export function ConfirmedActionForm({
  action,
  cancelLabel,
  children,
  className,
  confirmLabel,
  description,
  title,
  tone = "default",
}: ConfirmedActionFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const confirmedSubmitRef = useRef(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (confirmedSubmitRef.current) {
      confirmedSubmitRef.current = false;
      return;
    }

    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    setIsConfirmOpen(true);
  }

  function submitConfirmedAction() {
    confirmedSubmitRef.current = true;
    setIsConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form
        ref={formRef}
        action={action}
        className={className}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        tone={tone}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={submitConfirmedAction}
      />
    </>
  );
}
