## ADDED Requirements

### Requirement: Wholesale Orders Migration
The system SHALL provide a checked-in Supabase migration for wholesale orders.

#### Scenario: Developer applies wholesale migration
- **WHEN** the migration is run
- **THEN** Supabase has wholesale order tables, indexes, RLS policies, and a pending-order creation RPC

### Requirement: Wholesale Order RLS
The schema SHALL enforce role-aware access to wholesale orders.

#### Scenario: Wholesaler reads own orders
- **WHEN** an authenticated wholesale user reads wholesale orders
- **THEN** they can read only their own orders and items

#### Scenario: Admin reads wholesale orders
- **WHEN** an authenticated admin reads wholesale orders
- **THEN** they can read all wholesale orders and items
