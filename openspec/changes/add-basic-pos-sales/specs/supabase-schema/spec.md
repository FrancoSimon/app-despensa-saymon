## ADDED Requirements

### Requirement: Sales Migration
The system SHALL provide a checked-in Supabase migration for counter sales.

#### Scenario: Developer applies sales migration
- **WHEN** the migration is run
- **THEN** Supabase has `ventas`, `venta_items`, indexes, RLS policies, and a counter sale confirmation RPC

### Requirement: Seller Checkout RPC
The schema SHALL expose a secure RPC for seller checkout.

#### Scenario: Seller calls checkout RPC
- **WHEN** an authenticated seller or admin calls the RPC with valid items
- **THEN** the RPC confirms the sale if stock is sufficient
- **AND** returns the created sale id and totals
