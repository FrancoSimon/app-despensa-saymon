## MODIFIED Requirements

### Requirement: Supabase Email Password Login
The system SHALL authenticate users with Supabase Auth email and password credentials.

#### Scenario: Existing user logs in
- **WHEN** a registered user submits a valid email and password
- **THEN** the system authenticates the user through Supabase Auth
- **AND** loads the user's application profile
- **AND** grants access according to the user's role

#### Scenario: Invalid credentials
- **WHEN** a user submits an unknown email or incorrect password
- **THEN** the system denies access
- **AND** shows the error message "Credenciales invalidas"

### Requirement: Role Based Access Control
The system SHALL restrict routes and actions by user role.

#### Scenario: Admin accesses protected routes
- **WHEN** an admin is authenticated
- **THEN** they can access `/admin/*`, `/vendedor/*`, and `/mayorista/*`

#### Scenario: Seller accesses protected routes
- **WHEN** a seller is authenticated
- **THEN** they can access `/vendedor/*`
- **AND** can view products
- **AND** cannot access admin or wholesale-only routes

#### Scenario: Wholesaler accesses protected routes
- **WHEN** a wholesale user is authenticated
- **THEN** they can access `/mayorista/*`
- **AND** cannot access admin or seller-only routes

#### Scenario: Anonymous user opens protected route
- **WHEN** an unauthenticated user opens a protected route
- **THEN** the system redirects them to `/login`

#### Scenario: Authenticated user opens disallowed protected route
- **WHEN** an authenticated user opens a protected route outside their role permissions
- **THEN** the system redirects them to their allowed role home

### Requirement: Password Security
The system SHALL delegate password storage and hashing to Supabase Auth.

#### Scenario: User password is saved
- **WHEN** a password is created or updated
- **THEN** application tables do not store the password or password hash
- **AND** authentication secrets remain managed by Supabase Auth
