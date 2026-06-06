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
