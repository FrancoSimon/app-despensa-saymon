export type CustomerRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  razon_social?: string | null;
  documento_tipo?: string | null;
  documento_numero?: string | null;
  condicion_iva?: string | null;
  direccion?: string | null;
  localidad?: string | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  razonSocial: string | null;
  documentoTipo: string | null;
  documentoNumero: string | null;
  condicionIva: string | null;
  direccion: string | null;
  localidad: string | null;
  notas: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};
