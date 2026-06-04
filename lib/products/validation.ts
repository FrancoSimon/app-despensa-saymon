import type { ProductInput } from "@/lib/products/types";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function readOptionalText(formData: FormData, key: string) {
  const value = readText(formData, key);
  return value.length > 0 ? value : null;
}

function readMoney(formData: FormData, key: string) {
  const value = Number(readText(formData, key).replace(",", "."));

  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`El campo ${key} debe ser un numero mayor o igual a 0.`);
  }

  return Math.round(value * 100) / 100;
}

function readInteger(formData: FormData, key: string) {
  const value = Number(readText(formData, key));

  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`El campo ${key} debe ser un entero mayor o igual a 0.`);
  }

  return value;
}

export function parseProductForm(formData: FormData): ProductInput {
  const nombre = readText(formData, "nombre");
  const categoria = readText(formData, "categoria") || "General";
  const precioMayoristaEspecialRaw = readOptionalText(
    formData,
    "precioMayoristaEspecial",
  );

  if (!nombre) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  const precioMayoristaEspecial = precioMayoristaEspecialRaw
    ? Math.round(Number(precioMayoristaEspecialRaw.replace(",", ".")) * 100) / 100
    : null;

  if (
    precioMayoristaEspecial !== null &&
    (!Number.isFinite(precioMayoristaEspecial) || precioMayoristaEspecial < 0)
  ) {
    throw new Error("El precio mayorista especial debe ser mayor o igual a 0.");
  }

  const cantidadEspecial = readInteger(formData, "cantidadEspecial");

  if (precioMayoristaEspecial !== null && cantidadEspecial === 0) {
    throw new Error("El precio especial requiere una cantidad especial mayor a 0.");
  }

  return {
    codigoBarras: readOptionalText(formData, "codigoBarras"),
    nombre,
    categoria,
    precioMostrador: readMoney(formData, "precioMostrador"),
    precioMayoristaFijo: readMoney(formData, "precioMayoristaFijo"),
    precioMayoristaEspecial,
    cantidadEspecial,
    stock: readInteger(formData, "stock"),
    stockMinimo: readInteger(formData, "stockMinimo"),
    habilitadoMayorista: formData.get("habilitadoMayorista") === "on",
    imagenUrl: readOptionalText(formData, "imagenUrl"),
    activo: formData.getAll("activo").includes("on"),
  };
}

export function toProductPayload(input: ProductInput) {
  return {
    codigo_barras: input.codigoBarras,
    nombre: input.nombre,
    categoria: input.categoria,
    precio_mostrador: input.precioMostrador,
    precio_mayorista_fijo: input.precioMayoristaFijo,
    precio_mayorista_especial: input.precioMayoristaEspecial,
    cantidad_especial: input.cantidadEspecial,
    stock: input.stock,
    stock_minimo: input.stockMinimo,
    habilitado_mayorista: input.habilitadoMayorista,
    imagen_url: input.imagenUrl,
    activo: input.activo,
  };
}
