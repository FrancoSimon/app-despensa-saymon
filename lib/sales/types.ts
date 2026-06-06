export type PaymentMethod =
  | "efectivo"
  | "qr"
  | "tarjeta_credito"
  | "tarjeta_debito"
  | "transferencia"
  | "cuenta_corriente";

export type ConfirmSaleItemInput = {
  productoId: string;
  cantidad: number;
};

export type ConfirmSaleInput = {
  items: ConfirmSaleItemInput[];
  descuentoPorcentaje: number;
  recargoPorcentaje: number;
  formaPago: PaymentMethod;
  clienteId?: string | null;
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

export type SaleStatus = "activa" | "anulada";

export type SaleTicketItemRow = {
  id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number | string;
  subtotal: number | string;
};

export type SaleTicketRow = {
  id: string;
  vendedor_id: string;
  caja_id?: string | null;
  cliente_id?: string | null;
  fecha: string;
  estado?: SaleStatus;
  anulada_at?: string | null;
  motivo_anulacion?: string | null;
  forma_pago: PaymentMethod;
  subtotal: number | string;
  descuento_porcentaje: number | string;
  recargo_porcentaje: number | string;
  total: number | string;
  profiles: {
    nombre: string;
  } | null;
  clientes?: {
    nombre: string;
    telefono: string | null;
    email: string | null;
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
  vendedorId: string;
  cajaId: string | null;
  fecha: string;
  estado: SaleStatus;
  anuladaAt: string | null;
  motivoAnulacion: string | null;
  formaPago: PaymentMethod;
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  recargoPorcentaje: number;
  recargoMonto: number;
  total: number;
  vendedorNombre: string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  items: SaleTicketItem[];
};

export type AdminSaleStatusFilter = SaleStatus | "todas";

export type AdminSaleRow = {
  id: string;
  fecha: string;
  estado?: SaleStatus;
  anulada_at?: string | null;
  motivo_anulacion?: string | null;
  forma_pago: PaymentMethod;
  total: number | string;
  profiles: {
    nombre: string;
  } | null;
};

export type AdminSale = {
  id: string;
  fecha: string;
  estado: SaleStatus;
  anuladaAt: string | null;
  motivoAnulacion: string | null;
  formaPago: PaymentMethod;
  total: number;
  vendedorNombre: string;
};
