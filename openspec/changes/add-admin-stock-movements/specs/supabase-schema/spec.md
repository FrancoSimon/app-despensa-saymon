## ADDED Requirements

### Requirement: Stock Movement Schema
The schema SHALL persist manual stock movements.

#### Scenario: Developer applies stock movement migration
- **WHEN** the migration is run
- **THEN** Supabase has stock movement table, indexes, RLS policies, and an admin-only stock movement RPC
