## MODIFIED Requirements

### Requirement: Role-Based Authorization

The system SHALL restrict authenticated users to role-appropriate server-rendered areas and mutations.

#### Scenario: Role accesses protected area
- **WHEN** a user opens a protected admin, seller, or wholesale route
- **THEN** the server verifies the user's active profile and role before rendering protected data

#### Scenario: Seller opens sale ticket
- **WHEN** a seller opens a sale ticket URL
- **THEN** the system only shows the ticket if the sale belongs to that seller
- **AND** admins can view any sale ticket
