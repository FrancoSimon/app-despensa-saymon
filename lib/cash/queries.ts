import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { CashRegister, CashRegisterRow } from "@/lib/cash/types";

type LiveTotalsRow = {
  forma_pago: string;
  total: number | string;
};

function toNumber(value: number | string | null) {
  if (value === null) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}

function mapCashRegister(row: CashRegisterRow): CashRegister {
  return {
    id: row.id,
    perfilId: row.perfil_id,
    estado: row.estado,
    abiertaAt: row.abierta_at,
    cerradaAt: row.cerrada_at,
    efectivoInicial: toNumber(row.efectivo_inicial) ?? 0,
    efectivoVentas: toNumber(row.efectivo_ventas) ?? 0,
    efectivoEsperado: toNumber(row.efectivo_esperado) ?? 0,
    efectivoReal: toNumber(row.efectivo_real),
    diferenciaEfectivo: toNumber(row.diferencia_efectivo),
    qrTotal: toNumber(row.qr_total) ?? 0,
    tarjetaCreditoTotal: toNumber(row.tarjeta_credito_total) ?? 0,
    tarjetaDebitoTotal: toNumber(row.tarjeta_debito_total) ?? 0,
    transferenciaTotal: toNumber(row.transferencia_total) ?? 0,
    totalVentas: toNumber(row.total_ventas) ?? 0,
    cantidadVentas: row.cantidad_ventas,
    observaciones: row.observaciones,
    operadorNombre: row.profiles?.nombre ?? "Mostrador",
    operadorEmail: row.profiles?.email ?? "-",
  };
}

async function getLiveTotals(cajaId: string, efectivoInicial: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ventas")
    .select("forma_pago, total")
    .eq("caja_id", cajaId)
    .eq("estado", "activa")
    .returns<LiveTotalsRow[]>();

  if (error) {
    return {
      efectivoVentas: 0,
      efectivoEsperado: efectivoInicial,
      qrTotal: 0,
      tarjetaCreditoTotal: 0,
      tarjetaDebitoTotal: 0,
      transferenciaTotal: 0,
      totalVentas: 0,
      cantidadVentas: 0,
    };
  }

  return data.reduce(
    (totals, row) => {
      const total = Number(row.total);

      return {
        efectivoVentas:
          totals.efectivoVentas + (row.forma_pago === "efectivo" ? total : 0),
        efectivoEsperado:
          totals.efectivoEsperado + (row.forma_pago === "efectivo" ? total : 0),
        qrTotal: totals.qrTotal + (row.forma_pago === "qr" ? total : 0),
        tarjetaCreditoTotal:
          totals.tarjetaCreditoTotal +
          (row.forma_pago === "tarjeta_credito" ? total : 0),
        tarjetaDebitoTotal:
          totals.tarjetaDebitoTotal +
          (row.forma_pago === "tarjeta_debito" ? total : 0),
        transferenciaTotal:
          totals.transferenciaTotal +
          (row.forma_pago === "transferencia" ? total : 0),
        totalVentas: totals.totalVentas + total,
        cantidadVentas: totals.cantidadVentas + 1,
      };
    },
    {
      efectivoVentas: 0,
      efectivoEsperado: efectivoInicial,
      qrTotal: 0,
      tarjetaCreditoTotal: 0,
      tarjetaDebitoTotal: 0,
      transferenciaTotal: 0,
      totalVentas: 0,
      cantidadVentas: 0,
    },
  );
}

export async function getCurrentCashRegister() {
  const { profile } = await getCurrentProfile();

  if (!profile || (profile.rol !== "admin" && profile.rol !== "vendedor")) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cajas")
    .select(
      `
        id,
        perfil_id,
        estado,
        abierta_at,
        cerrada_at,
        efectivo_inicial,
        efectivo_ventas,
        efectivo_esperado,
        efectivo_real,
        diferencia_efectivo,
        qr_total,
        tarjeta_credito_total,
        tarjeta_debito_total,
        transferencia_total,
        total_ventas,
        cantidad_ventas,
        observaciones,
        profiles (
          nombre,
          email
        )
      `,
    )
    .eq("estado", "abierta")
    .eq("perfil_id", profile.id)
    .order("abierta_at", { ascending: false })
    .limit(1)
    .maybeSingle<CashRegisterRow>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return null;
    }

    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const cashRegister = mapCashRegister(data);
  const liveTotals = await getLiveTotals(
    cashRegister.id,
    cashRegister.efectivoInicial,
  );

  return {
    ...cashRegister,
    ...liveTotals,
  };
}

export async function listRecentCashRegisters(limit = 30) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cajas")
    .select(
      `
        id,
        perfil_id,
        estado,
        abierta_at,
        cerrada_at,
        efectivo_inicial,
        efectivo_ventas,
        efectivo_esperado,
        efectivo_real,
        diferencia_efectivo,
        qr_total,
        tarjeta_credito_total,
        tarjeta_debito_total,
        transferencia_total,
        total_ventas,
        cantidad_ventas,
        observaciones,
        profiles (
          nombre,
          email
        )
      `,
    )
    .order("abierta_at", { ascending: false })
    .limit(limit)
    .returns<CashRegisterRow[]>();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }

    throw new Error(error.message);
  }

  return data.map(mapCashRegister);
}
