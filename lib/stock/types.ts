export type StockMovementType = "entrada" | "salida";
export type StockMovementOrigin =
  | "manual"
  | "venta_mostrador"
  | "pedido_mayorista"
  | "compra";

export type StockMovementRow = {
  id: string;
  tipo: StockMovementType;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string | null;
  origen?: StockMovementOrigin;
  referencia_id?: string | null;
  created_at: string;
  productos: {
    nombre: string;
    categoria: string;
  } | null;
  profiles: {
    nombre: string;
  } | null;
};

export type StockMovement = {
  id: string;
  tipo: StockMovementType;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string | null;
  origen: StockMovementOrigin;
  referenciaId: string | null;
  createdAt: string;
  productoNombre: string;
  productoCategoria: string;
  adminNombre: string;
};

export type SupplierRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email?: string | null;
  cuit?: string | null;
  condicion_iva?: string | null;
  direccion?: string | null;
  localidad?: string | null;
  contacto?: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  cuit: string | null;
  condicionIva: string | null;
  direccion: string | null;
  localidad: string | null;
  contacto: string | null;
  notas: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StockPurchaseRow = {
  id: string;
  cantidad: number;
  costo_unitario: number | string;
  costo_total: number | string;
  fecha_compra: string;
  comprobante: string | null;
  notas: string | null;
  created_at: string;
  productos: {
    nombre: string;
    categoria: string;
  } | null;
  proveedores: {
    nombre: string;
  } | null;
  profiles: {
    nombre: string;
  } | null;
};

export type StockPurchase = {
  id: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  fechaCompra: string;
  comprobante: string | null;
  notas: string | null;
  createdAt: string;
  productoNombre: string;
  productoCategoria: string;
  proveedorNombre: string;
  adminNombre: string;
};
