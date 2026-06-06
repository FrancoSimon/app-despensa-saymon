export type StockMovementType = "entrada" | "salida";

export type StockMovementRow = {
  id: string;
  tipo: StockMovementType;
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  motivo: string | null;
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
  createdAt: string;
  productoNombre: string;
  productoCategoria: string;
  adminNombre: string;
};
