## MODIFIED Requirements

### Requirement: Supabase Email Password Login
The system SHALL authenticate users with Supabase Auth email and password credentials.

#### Scenario: Existing user logs in
- **WHEN** a registered user submits a valid email and password
- **THEN** the system authenticates the user through Supabase Auth
- **AND** loads the user's application profile from `public.profiles`
- **AND** grants access according to the user's role

#### Scenario: Invalid credentials
- **WHEN** a user submits an unknown email or incorrect password
- **THEN** the system denies access
- **AND** shows the error message "Credenciales invalidas"

#### Scenario: First admin logs in
- **WHEN** the first admin Auth user has a matching profile row with role `admin`
- **THEN** the system routes the user to `/admin`

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

#### Scenario: Admin creates profile after bootstrap
- **WHEN** the first admin profile already exists
- **THEN** RLS allows admins to manage future application profiles
