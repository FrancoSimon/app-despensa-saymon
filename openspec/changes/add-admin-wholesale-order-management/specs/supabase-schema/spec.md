## MODIFIED Requirements

### Requirement: Wholesale Orders Migration
The system SHALL provide checked-in Supabase SQL for wholesale orders and admin order management.

#### Scenario: Developer applies wholesale admin migration
- **WHEN** the migration is run after wholesale orders exist
- **THEN** Supabase has admin-only RPCs to confirm and reject wholesale orders

### Requirement: Wholesale Order RLS
The schema SHALL enforce role-aware access to wholesale orders.

#### Scenario: Admin transitions pending order
- **WHEN** an authenticated admin confirms or rejects a pending wholesale order through the RPC
- **THEN** the RPC validates the admin role before making changes
- **AND** direct stock changes are not required from the client
