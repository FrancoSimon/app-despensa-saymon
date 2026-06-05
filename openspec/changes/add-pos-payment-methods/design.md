## Context

`ventas.forma_pago` uses the PostgreSQL enum `public.forma_pago_venta`, currently with `efectivo` and `qr`. The RPC already accepts this enum and stores it on the sale row, so adding enum values plus application validation is enough.

## Decisions

1. Use enum values `tarjeta_credito`, `tarjeta_debito`, and `transferencia`.
   - Rationale: keeps credit and debit distinguishable while avoiding spaces or accents in database values.

2. Keep POS payment selection as buttons.
   - Rationale: sellers need fast, repeated checkout actions.

3. Keep reports grouped into cash, QR, card, and transfer.
   - Rationale: both card types are often operationally reviewed together, while ticket data preserves the exact method.

## Non-Goals

- Card processor integration.
- Payment terminal reconciliation.
- Transfer receipt upload.
