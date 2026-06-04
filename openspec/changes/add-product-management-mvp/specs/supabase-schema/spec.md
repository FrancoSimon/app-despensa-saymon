## ADDED Requirements

### Requirement: Products Migration
The system SHALL provide a checked-in Supabase migration for the products schema.

#### Scenario: Developer reviews product database setup
- **WHEN** a developer opens the Supabase migrations
- **THEN** they can find SQL that creates `public.productos`, constraints, indexes, timestamp trigger, and RLS policies

### Requirement: Product RLS
The products schema SHALL enforce role-aware access with RLS.

#### Scenario: Admin manages products
- **WHEN** an authenticated admin accesses products
- **THEN** they can select, insert, update, and deactivate products

#### Scenario: Seller reads products
- **WHEN** an authenticated seller reads products
- **THEN** they can read active products

#### Scenario: Wholesaler reads products
- **WHEN** an authenticated wholesaler reads products
- **THEN** they can read only active products enabled for wholesale
