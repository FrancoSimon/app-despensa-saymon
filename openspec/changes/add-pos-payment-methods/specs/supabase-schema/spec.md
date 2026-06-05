## ADDED Requirements

### Requirement: Sale Payment Method Enum Values
The schema SHALL support all POS payment methods.

#### Scenario: Developer applies payment method migration
- **WHEN** the migration is run
- **THEN** `public.forma_pago_venta` accepts `tarjeta_credito`, `tarjeta_debito`, and `transferencia`
