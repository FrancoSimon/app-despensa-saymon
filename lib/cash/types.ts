export type CashRegisterStatus = "abierta" | "cerrada";

export type CashRegisterRow = {
  id: string;
  perfil_id: string;
  estado: CashRegisterStatus;
  abierta_at: string;
  cerrada_at: string | null;
  efectivo_inicial: number | string;
  efectivo_ventas: number | string;
  efectivo_esperado: number | string;
  efectivo_real: number | string | null;
  diferencia_efectivo: number | string | null;
  qr_total: number | string;
  tarjeta_credito_total: number | string;
  tarjeta_debito_total: number | string;
  transferencia_total: number | string;
  total_ventas: number | string;
  cantidad_ventas: number;
  observaciones: string | null;
  profiles?: {
    nombre: string;
    email: string;
  } | null;
};

export type CashRegister = {
  id: string;
  perfilId: string;
  estado: CashRegisterStatus;
  abiertaAt: string;
  cerradaAt: string | null;
  efectivoInicial: number;
  efectivoVentas: number;
  efectivoEsperado: number;
  efectivoReal: number | null;
  diferenciaEfectivo: number | null;
  qrTotal: number;
  tarjetaCreditoTotal: number;
  tarjetaDebitoTotal: number;
  transferenciaTotal: number;
  totalVentas: number;
  cantidadVentas: number;
  observaciones: string | null;
  operadorNombre: string;
  operadorEmail: string;
};

export type CashRegisterActionState = {
  ok: boolean;
  message: string | null;
};

