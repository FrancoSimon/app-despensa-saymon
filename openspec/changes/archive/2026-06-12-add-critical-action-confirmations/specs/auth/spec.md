## MODIFIED Requirements

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

#### Scenario: Admin changes user access
- **WHEN** an admin creates or updates a user with role or active-state permissions
- **THEN** the app asks for explicit confirmation before saving the change

#### Scenario: Anonymous user opens protected route
- **WHEN** an unauthenticated user opens a protected route
- **THEN** the system redirects them to `/login`
