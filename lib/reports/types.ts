import type { PaymentMethod } from "@/lib/sales/types";

export type ReportDateRange = {
  from: string;
  to: string;
  fromIso: string;
  toIsoExclusive: string;
};

export type SalesSummary = {
  total: number;
  count: number;
  cashTotal: number;
  qrTotal: number;
  cardTotal: number;
  transferTotal: number;
};

export type CashRegisterReportSummary = {
  count: number;
  openCount: number;
  closedCount: number;
  expectedCashTotal: number;
  countedCashTotal: number;
  cashDifferenceTotal: number;
  incomeMovementsTotal: number;
  withdrawalMovementsTotal: number;
};

export type CashRegisterReportRow = {
  id: string;
  operatorName: string;
  status: "abierta" | "cerrada";
  openedAt: string;
  closedAt: string | null;
  expectedCash: number;
  countedCash: number | null;
  cashDifference: number | null;
  salesTotal: number;
  salesCount: number;
};

export type DailySalesRow = {
  date: string;
  count: number;
  total: number;
};

export type BestSellerRow = {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
};

export type LowStockReportRow = {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
};

export type WholesaleStatusCount = {
  estado: "pendiente" | "confirmado" | "entregado" | "rechazado" | "cancelado";
  count: number;
};

export type SaleRow = {
  fecha: string;
  forma_pago: PaymentMethod;
  total: number | string;
};

export type SaleItemReportRow = {
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  subtotal: number | string;
};

export type CashRegisterReportDbRow = {
  id: string;
  estado: "abierta" | "cerrada";
  abierta_at: string;
  cerrada_at: string | null;
  efectivo_esperado: number | string;
  efectivo_real: number | string | null;
  diferencia_efectivo: number | string | null;
  total_ventas: number | string;
  cantidad_ventas: number;
  profiles?: {
    nombre: string;
  } | null;
};

export type CashMovementReportDbRow = {
  tipo: "ingreso" | "retiro";
  monto: number | string;
};
