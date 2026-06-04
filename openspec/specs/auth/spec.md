## Purpose

Define Supabase Auth authentication and role-based access control for admin, seller, and wholesale users.

## Requirements

### Requirement: Supabase Email Password Login
The system SHALL authenticate users with Supabase Auth email and password credentials.

#### Scenario: Existing user logs in
- **WHEN** a registered user submits a valid email and password
- **THEN** the system authenticates the user
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

### Requirement: Wholesale User Creation
The system SHALL allow admins to create wholesale users without public self-registration.

#### Scenario: Admin creates wholesaler
- **WHEN** an admin opens the new wholesaler form
- **THEN** the system requires name, email, password, locality, and phone
- **AND** creates a Supabase Auth user
- **AND** creates the related application profile with role `mayorista`

#### Scenario: Optional credential email
- **WHEN** a wholesale user is created
- **THEN** the system may send credentials by email as an optional MVP enhancement

### Requirement: Password Security
The system SHALL delegate password storage and hashing to Supabase Auth.

#### Scenario: User password is saved
- **WHEN** a password is created or updated
- **THEN** application tables do not store the password or password hash
- **AND** authentication secrets remain managed by Supabase Auth
