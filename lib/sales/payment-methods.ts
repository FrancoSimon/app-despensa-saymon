import type { PaymentMethod } from "@/lib/sales/types";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  qr: "QR",
  tarjeta_credito: "Tarjeta credito",
  tarjeta_debito: "Tarjeta debito",
  transferencia: "Transferencia",
  cuenta_corriente: "Cuenta corriente",
};

export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: "efectivo", label: paymentMethodLabels.efectivo },
  { value: "qr", label: paymentMethodLabels.qr },
  { value: "tarjeta_credito", label: paymentMethodLabels.tarjeta_credito },
  { value: "tarjeta_debito", label: paymentMethodLabels.tarjeta_debito },
  { value: "transferencia", label: paymentMethodLabels.transferencia },
  { value: "cuenta_corriente", label: paymentMethodLabels.cuenta_corriente },
];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === "efectivo" ||
    value === "qr" ||
    value === "tarjeta_credito" ||
    value === "tarjeta_debito" ||
    value === "transferencia" ||
    value === "cuenta_corriente"
  );
}
