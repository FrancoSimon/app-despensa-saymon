## MODIFIED Requirements

### Requirement: Wholesale User Creation
The system SHALL allow admins to create wholesale users without public self-registration.

#### Scenario: Admin creates wholesaler
- **WHEN** an admin opens the new user form
- **THEN** the system requires name, email, password, locality, and phone for wholesale users
- **AND** creates a Supabase Auth user
- **AND** creates the related application profile with role `mayorista`

### Requirement: Admin User Management
The system SHALL allow admins to manage application users.

#### Scenario: Admin creates seller or admin
- **WHEN** an admin submits a valid user form
- **THEN** the system creates a Supabase Auth user
- **AND** creates the related application profile with the selected role

#### Scenario: Admin edits profile
- **WHEN** an admin updates name, role, contact, email, active state, or password
- **THEN** the system updates Supabase Auth where needed
- **AND** updates the application profile

#### Scenario: Service role missing
- **WHEN** admin user creation or Auth updates require service-role access
- **AND** the server key is not configured
- **THEN** the system shows a clear configuration error
