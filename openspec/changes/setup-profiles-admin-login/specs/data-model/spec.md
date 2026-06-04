## MODIFIED Requirements

### Requirement: User Profile Entity
The system SHALL store application user profiles linked to Supabase Auth users.

#### Scenario: User profile is persisted
- **WHEN** a user profile is saved
- **THEN** the system stores id, Supabase Auth user id, name, unique email, role, active flag, and profile data
- **AND** role is one of `admin`, `vendedor`, or `mayorista`
- **AND** locality is required when role is `mayorista`
- **AND** the application does not store password hashes in profile tables
