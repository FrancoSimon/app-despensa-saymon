## ADDED Requirements

### Requirement: Supabase supports counter sale cancellation

The schema SHALL support canceling counter sales while preserving sale records and restoring stock transactionally.

#### Scenario: Developer applies sale cancellation migration
- **WHEN** the migration runs
- **THEN** `ventas` can store cancellation state, reason, timestamp, and actor
- **AND** Supabase exposes an authorized RPC for canceling active sales

