## ADDED Requirements

### Requirement: Branded Entry Surface
The system SHALL replace the default Next.js starter screen with a SAYMON-branded entry surface.

#### Scenario: Anonymous user opens root route
- **WHEN** an anonymous user opens `/`
- **THEN** the system displays SAYMON identity and entry actions
- **AND** the experience uses the black and neon green brand direction from the SAYMON logo

### Requirement: Role Home Pages
The system SHALL provide starter home pages for admin, seller, and wholesale roles.

#### Scenario: Admin opens dashboard
- **WHEN** an authenticated admin opens `/admin`
- **THEN** the system shows an admin home page with links or placeholders for products, orders, stock, and reports

#### Scenario: Seller opens POS home
- **WHEN** an authenticated seller opens `/vendedor`
- **THEN** the system shows a seller home page for POS work

#### Scenario: Wholesaler opens B2B home
- **WHEN** an authenticated wholesaler opens `/mayorista`
- **THEN** the system shows a wholesale home page for catalog and orders

### Requirement: Authenticated App Shell
The system SHALL provide a shared authenticated shell for protected role areas.

#### Scenario: Authenticated user views protected area
- **WHEN** an authenticated user opens an allowed protected route
- **THEN** the system displays the SAYMON brand, current role context, navigation for the current area, and a logout action

### Requirement: Pending Profile State
The system SHALL handle authenticated Supabase users whose application profile is not available.

#### Scenario: Authenticated user lacks profile
- **WHEN** a Supabase-authenticated user has no application profile
- **THEN** the system shows a clear pending-profile state
- **AND** avoids granting role-specific access
