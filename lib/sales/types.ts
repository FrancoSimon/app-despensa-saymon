export type PaymentMethod = "efectivo" | "qr";

export type ConfirmSaleItemInput = {
  productoId: string;
  cantidad: number;
};

export type ConfirmSaleInput = {
  items: ConfirmSaleItemInput[];
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
  formaPago: PaymentMethod;
};

export type ConfirmSaleResult = {
  ventaId: string;
  subtotal: number;
  descuentoMonto: number;
  recargoMonto: number;
  total: number;
  fecha: string;
};

export type ConfirmSaleRpcRow = {
  venta_id: string;
  subtotal: number | string;
  descuento_monto: number | string;
  recargo_monto: number | string;
  total: number | string;
  fecha: string;
};

