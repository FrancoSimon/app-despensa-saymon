export type PaymentMethod =
  | "efectivo"
  | "qr"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia";

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

export type SaleTicketItemRow = {
  id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
};

export type SaleTicketRow = {
  id: string;
  fecha: string;
  forma_pago: PaymentMethod;
  subtotal: number | string;
  descuento_porcentaje: number | string;
  recargo_porcentaje: number | string;
  total: number | string;
  profiles: {
    nombre: string;
  } | null;
  venta_items: SaleTicketItemRow[];
};

export type SaleTicketItem = {
  id: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type SaleTicket = {
  id: string;
  fecha: string;
  formaPago: PaymentMethod;
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  recargoPorcentaje: number;
  recargoMonto: number;
  total: number;
  vendedorNombre: string;
  items: SaleTicketItem[];
};
