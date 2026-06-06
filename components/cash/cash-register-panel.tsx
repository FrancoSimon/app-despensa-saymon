"use client";

import { useActionState } from "react";
import {
  closeCashRegisterAction,
  openCashRegisterAction,
  registerCashMovementAction,
} from "@/lib/cash/actions";
import type {
  CashRegister,
  CashRegisterActionState,
  CashRegisterMovement,
} from "@/lib/cash/types";

type CashRegisterPanelProps = {
  cashRegister: CashRegister | null;
  movements: CashRegisterMovement[];
};

const initialState: CashRegisterActionState = {
  ok: false,
  message: null,
};

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CashRegisterPanel({
  cashRegister,
  movements,
}: CashRegisterPanelProps) {
  const [openState, openAction, opening] = useActionState(
    openCashRegisterAction,
    initialState,
  );
  const [movementState, movementAction, moving] = useActionState(
    registerCashMovementAction,
    initialState,
  );
  const [closeState, closeAction, closing] = useActionState(
    closeCashRegisterAction,
    initialState,
  );
  const state = movementState.message
    ? movementState
    : closeState.message
      ? closeState
      : openState;

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-white/10 bg-black p-5">
        <h2 className="text-xl font-black text-white">
          {cashRegister ? "Caja abierta" : "Abrir caja"}
        </h2>

        {state.message ? (
          <p
            className={
              state.ok
                ? "mt-4 rounded-md border border-lime-300/30 bg-lime-950/20 px-4 py-3 text-sm text-lime-100"
                : "mt-4 rounded-md border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-100"
            }
          >
            {state.message}
          </p>
        ) : null}

        {cashRegister ? (
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
              <p className="text-zinc-500">Apertura</p>
              <p className="mt-1 font-bold text-white">
                {formatDateTime(cashRegister.abiertaAt)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
                <p className="text-zinc-500">Efectivo inicial</p>
                <p className="mt-1 text-xl font-black text-white">
                  {money(cashRegister.efectivoInicial)}
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
                <p className="text-zinc-500">Efectivo esperado</p>
                <p className="mt-1 text-xl font-black text-lime-300">
                  {money(cashRegister.efectivoEsperado)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form action={openAction} className="mt-5 grid gap-4">
            <label className="text-sm font-semibold text-zinc-200">
              Efectivo inicial
              <input
                name="efectivoInicial"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
                required
              />
            </label>
            <button
              disabled={opening}
              className="rounded-md bg-lime-300 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {opening ? "Abriendo..." : "Abrir caja"}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-lg border border-white/10 bg-black p-5">
        <h2 className="text-xl font-black text-white">Resumen del turno</h2>
        {cashRegister ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <Metric label="Ventas" value={String(cashRegister.cantidadVentas)} />
              <Metric label="Total vendido" value={money(cashRegister.totalVentas)} />
              <Metric
                label="Efectivo ventas"
                value={money(cashRegister.efectivoVentas)}
              />
              <Metric label="Ingresos caja" value={money(cashRegister.ingresosCaja)} />
              <Metric label="Retiros caja" value={money(cashRegister.retirosCaja)} />
              <Metric label="QR" value={money(cashRegister.qrTotal)} />
              <Metric
                label="Tarjeta credito"
                value={money(cashRegister.tarjetaCreditoTotal)}
              />
              <Metric
                label="Tarjeta debito"
                value={money(cashRegister.tarjetaDebitoTotal)}
              />
              <Metric
                label="Transferencia"
                value={money(cashRegister.transferenciaTotal)}
              />
            </div>

            <form
              action={movementAction}
              className="mt-5 rounded-md border border-white/10 bg-zinc-950 p-4"
            >
              <input type="hidden" name="cajaId" value={cashRegister.id} />
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-lime-300">
                Movimientos de efectivo
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-[0.8fr_1fr]">
                <label className="text-sm font-semibold text-zinc-200">
                  Tipo
                  <select
                    name="tipo"
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-white outline-none transition focus:border-lime-300"
                    required
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="retiro">Retiro</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-zinc-200">
                  Importe
                  <input
                    name="monto"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-white outline-none transition focus:border-lime-300"
                    required
                  />
                </label>
              </div>
              <label className="mt-3 block text-sm font-semibold text-zinc-200">
                Motivo
                <input
                  name="motivo"
                  maxLength={160}
                  placeholder="Ej: cambio inicial, retiro para proveedor"
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black px-3 text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
              <button
                disabled={moving}
                className="mt-4 rounded-md border border-lime-300/40 px-5 py-3 text-sm font-black text-lime-100 transition hover:bg-lime-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {moving ? "Registrando..." : "Registrar movimiento"}
              </button>
            </form>

            <div className="mt-5 overflow-hidden rounded-md border border-white/10">
              <div className="border-b border-white/10 bg-zinc-950 px-4 py-3">
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-zinc-300">
                  Historial de movimientos
                </h3>
              </div>
              {movements.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {movements.map((movement) => (
                    <div
                      key={movement.id}
                      className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[0.8fr_1fr_1.4fr]"
                    >
                      <span
                        className={
                          movement.tipo === "ingreso"
                            ? "font-black uppercase text-lime-300"
                            : "font-black uppercase text-yellow-200"
                        }
                      >
                        {movement.tipo}
                      </span>
                      <span className="font-bold text-white">
                        {money(movement.monto)}
                      </span>
                      <span className="text-zinc-400">{movement.motivo}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-6 text-center text-sm text-zinc-500">
                  No hay movimientos registrados.
                </p>
              )}
            </div>

            <form action={closeAction} className="mt-5 grid gap-4">
              <input type="hidden" name="cajaId" value={cashRegister.id} />
              <label className="text-sm font-semibold text-zinc-200">
                Efectivo real contado
                <input
                  name="efectivoReal"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={cashRegister.efectivoEsperado.toFixed(2)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-lime-300"
                  required
                />
              </label>
              <label className="text-sm font-semibold text-zinc-200">
                Observaciones
                <textarea
                  name="observaciones"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none transition focus:border-lime-300"
                />
              </label>
              <button
                disabled={closing}
                onClick={(event) => {
                  if (!window.confirm("Cerrar esta caja?")) {
                    event.preventDefault();
                  }
                }}
                className="rounded-md border border-lime-300/40 px-5 py-3 text-sm font-black text-lime-100 transition hover:bg-lime-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closing ? "Cerrando..." : "Cerrar caja"}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-5 rounded-md border border-white/10 bg-zinc-950 p-6 text-center text-zinc-400">
            Abri una caja para empezar a registrar ventas mostrador.
          </p>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-zinc-950 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}
