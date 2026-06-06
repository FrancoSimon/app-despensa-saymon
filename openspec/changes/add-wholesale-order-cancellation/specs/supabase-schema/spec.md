## ADDED Requirements

### Requirement: Supabase supports wholesale order cancellation

The schema SHALL support canceling confirmed wholesale orders while preserving order records and restoring stock transactionally.

#### Scenario: Developer applies wholesale cancellation migration
- **WHEN** the migration runs
- **THEN** `estado_pedido_mayorista` accepts `cancelado`
- **AND** Supabase exposes an admin-only RPC to cancel confirmed orders with stock restoration

