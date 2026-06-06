import type { PaymentMethod } from "@/lib/sales/types";

export type AccountMovementType = "venta" | "pago";

export type AccountMovementRow = {
  id: string;
  cliente_id: string;
  perfil_id: string;
  venta_id: string | null;
  tipo: AccountMovementType;
  forma_pago: PaymentMethod | null;
  monto: number | string;
  nota: string | null;
  created_at: string;
  clientes: {
    nombre: string;
    telefono: string | null;
    razon_social?: string | null;
    documento_numero?: string | null;
  } | null;
  profiles: {
    nombre: string;
  } | null;
};

export type CustomerAccountSummary = {
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteRazonSocial: string | null;
  clienteDocumento: string | null;
  saldo: number;
  ultimaActividad: string;
};

export type AccountMovement = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  tipo: AccountMovementType;
  formaPago: PaymentMethod | null;
  monto: number;
  nota: string | null;
  createdAt: string;
  ventaId: string | null;
  operadorNombre: string;
};

export type CustomerAccountLedgerMovement = AccountMovement & {
  saldo: number;
};

export type CustomerAccountDetail = {
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteRazonSocial: string | null;
  clienteDocumento: string | null;
  saldo: number;
  totalVentas: number;
  totalPagos: number;
  cantidadMovimientos: number;
  ultimaActividad: string | null;
  movimientos: CustomerAccountLedgerMovement[];
};

export type AccountPaymentRpcRow = {
  pago_id: string;
  cliente_id: string;
  monto: number | string;
  saldo: number | string;
  created_at: string;
};

export type AccountPaymentTicket = {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteTelefono: string | null;
  clienteRazonSocial: string | null;
  clienteDocumento: string | null;
  operadorNombre: string;
  monto: number;
  saldoActual: number;
  saldoAntes: number;
  formaPago: PaymentMethod;
  nota: string | null;
  createdAt: string;
};
