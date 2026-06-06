## MODIFIED Requirements

### Requirement: Supabase supports stock movement persistence

The schema SHALL persist stock movements with enough metadata to identify manual adjustments, counter sales, and wholesale order confirmations.

#### Scenario: Developer applies automatic stock history migration
- **WHEN** the migration runs
- **THEN** Supabase can store stock movement origin and optional reference ids
- **AND** sale and wholesale confirmation RPCs insert stock movement rows in the same transaction as stock deduction

