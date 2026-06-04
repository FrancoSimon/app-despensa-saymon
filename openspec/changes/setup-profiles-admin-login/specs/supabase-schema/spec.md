## ADDED Requirements

### Requirement: Profiles Migration
The system SHALL provide a checked-in Supabase migration for the initial profiles schema.

#### Scenario: Developer reviews database setup
- **WHEN** a developer opens the Supabase migration files
- **THEN** they can find SQL that creates the app role enum, profiles table, indexes, updated timestamp trigger, and RLS policies

### Requirement: First Admin Bootstrap Instructions
The system SHALL document how to create the first admin Auth user and application profile.

#### Scenario: Operator prepares first login
- **WHEN** the operator follows the setup guide
- **THEN** they can create a Supabase Auth user
- **AND** insert a matching `profiles` row with role `admin`
- **AND** use that account to log into `/admin`

### Requirement: Profile Row Security
The profiles schema SHALL protect user profile rows with RLS.

#### Scenario: Authenticated user reads own profile
- **WHEN** an authenticated user queries `profiles`
- **THEN** they can read their own profile row

#### Scenario: Admin manages profiles
- **WHEN** an authenticated admin manages `profiles`
- **THEN** they can read, insert, update, and deactivate profile rows
