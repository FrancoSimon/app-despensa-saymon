## ADDED Requirements

### Requirement: Supabase supports cash register shifts

The schema SHALL persist cash register shifts and link counter sales to the open shift.

#### Scenario: Developer applies cash register migration
- **WHEN** the migration runs
- **THEN** Supabase has cash register shift table, sale linkage, RLS policies, and open/close RPCs
- **AND** counter sale confirmation requires an open cash register

