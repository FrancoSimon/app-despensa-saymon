export type ProductRow = {
  id: string;
  codigo_barras: string | null;
  nombre: string;
  categoria: string;
  precio_mostrador: number | string;
  precio_mayorista_fijo: number | string;
  precio_mayorista_especial: number | string | null;
  cantidad_especial: number;
  stock: number;
  stock_minimo: number;
  costo_compra?: number | string;
  habilitado_mayorista: boolean;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  codigoBarras: string | null;
  nombre: string;
  categoria: string;
  precioMostrador: number;
  precioMayoristaFijo: number;
  precioMayoristaEspecial: number | null;
  cantidadEspecial: number;
  stock: number;
  stockMinimo: number;
  costoCompra: number;
  habilitadoMayorista: boolean;
  imagenUrl: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  codigoBarras: string | null;
  nombre: string;
  categoria: string;
  precioMostrador: number;
  precioMayoristaFijo: number;
  precioMayoristaEspecial: number | null;
  cantidadEspecial: number;
  stock: number;
  stockMinimo: number;
  habilitadoMayorista: boolean;
  imagenUrl: string | null;
  activo: boolean;
};
