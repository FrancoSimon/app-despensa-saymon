## Context

The `cajas` table stores opening/closing snapshots. Counter sales are linked through `ventas.caja_id`. The application needs a separate audit trail for manual cash changes that are not sales.

## Decisions

1. Store movements in `caja_movimientos` instead of mutating the cash register snapshot directly.
2. Use `tipo text` with a check constraint (`ingreso`, `retiro`) to keep the migration idempotent-friendly.
3. Use a security definer RPC for inserts so the same authorization rules apply consistently.
4. Keep closed cash register totals as snapshots. New closures include movement totals in `efectivo_esperado`.
5. List movements by `caja_id` in seller/admin views.

## Cash Formula

`efectivo_esperado = efectivo_inicial + ventas_efectivo + ingresos_caja - retiros_caja`
