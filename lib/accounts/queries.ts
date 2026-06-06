import { createClient } from "@/lib/supabase/server";
import type {
  AccountMovement,
  AccountMovementRow,
  AccountPaymentTicket,
  CustomerAccountSummary,
} from "@/lib/accounts/types";

const movementSelect = `
  id,
  cliente_id,
  perfil_id,
  venta_id,
  tipo,
  forma_pago,
  monto,
  nota,
  created_at,
  clientes (
    nombre,
    telefono,
    razon_social,
    documento_numero
  ),
  profiles (
    nombre
  )
`;

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function movementSign(tipo: string) {
  return tipo === "venta" ? 1 : -1;
}

function mapMovement(row: AccountMovementRow): AccountMovement {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    clienteNombre: row.clientes?.nombre ?? "Cliente",
    clienteTelefono: row.clientes?.telefono ?? null,
    tipo: row.tipo,
    formaPago: row.forma_pago,
    monto: toNumber(row.monto),
    nota: row.nota,
    createdAt: row.created_at,
    ventaId: row.venta_id,
    operadorNombre: row.profiles?.nombre ?? "Operador",
  };
}

export async function listCustomerAccountSummaries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_cuenta_movimientos")
    .select(movementSelect)
    .order("created_at", { ascending: false })
    .limit(1000)
    .returns<AccountMovementRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  const summaries = new Map<string, CustomerAccountSummary>();

  for (const row of data) {
    const current = summaries.get(row.cliente_id) ?? {
      clienteId: row.cliente_id,
      clienteNombre: row.clientes?.nombre ?? "Cliente",
      clienteTelefono: row.clientes?.telefono ?? null,
      clienteRazonSocial: row.clientes?.razon_social ?? null,
      clienteDocumento: row.clientes?.documento_numero ?? null,
      saldo: 0,
      ultimaActividad: row.created_at,
    };

    current.saldo += movementSign(row.tipo) * toNumber(row.monto);

    if (new Date(row.created_at) > new Date(current.ultimaActividad)) {
      current.ultimaActividad = row.created_at;
    }

    summaries.set(row.cliente_id, current);
  }

  return Array.from(summaries.values())
    .map((summary) => ({ ...summary, saldo: Math.round(summary.saldo * 100) / 100 }))
    .sort((a, b) => b.saldo - a.saldo || b.ultimaActividad.localeCompare(a.ultimaActividad));
}

export async function listRecentAccountMovements(limit = 30) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_cuenta_movimientos")
    .select(movementSelect)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<AccountMovementRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapMovement);
}

export async function getAccountPaymentTicket(paymentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cliente_cuenta_movimientos")
    .select(movementSelect)
    .eq("id", paymentId)
    .eq("tipo", "pago")
    .maybeSingle<AccountMovementRow>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data || !data.forma_pago) {
    return null;
  }

  const { data: customerMovements, error: movementsError } = await supabase
    .from("cliente_cuenta_movimientos")
    .select("tipo, monto")
    .eq("cliente_id", data.cliente_id)
    .returns<Pick<AccountMovementRow, "tipo" | "monto">[]>();

  if (movementsError) {
    throw new Error(movementsError.message);
  }

  const saldoActual = customerMovements.reduce(
    (sum, movement) => sum + movementSign(movement.tipo) * toNumber(movement.monto),
    0,
  );
  const roundedSaldoActual = Math.round(saldoActual * 100) / 100;
  const monto = toNumber(data.monto);

  return {
    id: data.id,
    clienteId: data.cliente_id,
    clienteNombre: data.clientes?.nombre ?? "Cliente",
    clienteTelefono: data.clientes?.telefono ?? null,
    clienteRazonSocial: data.clientes?.razon_social ?? null,
    clienteDocumento: data.clientes?.documento_numero ?? null,
    operadorNombre: data.profiles?.nombre ?? "Administrador",
    monto,
    saldoActual: roundedSaldoActual,
    saldoAntes: Math.round((roundedSaldoActual + monto) * 100) / 100,
    formaPago: data.forma_pago,
    nota: data.nota,
    createdAt: data.created_at,
  } satisfies AccountPaymentTicket;
}
