export type WholesaleOrderStatus =
  | "pendiente"
  | "confirmado"
  | "entregado"
  | "rechazado"
  | "cancelado";

export type WholesaleOrderInput = {
  items: {
    productoId: string;
    cantidad: number;
  }[];
  fechaEntregaDeseada: string;
  comentario: string | null;
};

export type WholesaleOrderResult = {
  pedidoId: string;
  total: number;
  fechaPedido: string;
  fechaEntregaDeseada: string;
};

export type WholesaleOrderRpcRow = {
  pedido_id: string;
  total: number | string;
  fecha_pedido: string;
  fecha_entrega_deseada: string;
};

export type WholesaleOrderRow = {
  id: string;
  fecha_pedido: string;
  fecha_entrega_deseada: string;
  fecha_entrega_asignada: string | null;
  estado: WholesaleOrderStatus;
  total: number | string;
  comentario: string | null;
  motivo_rechazo: string | null;
};

export type WholesaleOrder = {
  id: string;
  fechaPedido: string;
  fechaEntregaDeseada: string;
  fechaEntregaAsignada: string | null;
  estado: WholesaleOrderStatus;
  total: number;
  comentario: string | null;
  motivoRechazo: string | null;
};

export type CreateWholesaleOrderState = {
  ok: boolean;
  message: string | null;
  order: WholesaleOrderResult | null;
};

export type AdminWholesaleOrderItemRow = {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number | string;
  precio_especial_aplicado: boolean;
  subtotal: number | string;
  productos: {
    stock: number;
  } | null;
};

export type AdminWholesaleOrderRow = WholesaleOrderRow & {
  profiles: {
    nombre: string;
    email: string;
    localidad: string | null;
    telefono: string | null;
  } | null;
  pedido_mayorista_items: AdminWholesaleOrderItemRow[];
};

export type AdminWholesaleOrderItem = {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  precioEspecialAplicado: boolean;
  subtotal: number;
  stockActual: number | null;
};

export type AdminWholesaleOrder = WholesaleOrder & {
  mayorista: {
    nombre: string;
    email: string;
    localidad: string | null;
    telefono: string | null;
  };
  items: AdminWholesaleOrderItem[];
};

export type AdminWholesaleOrderActionState = {
  ok: boolean;
  message: string | null;
};
