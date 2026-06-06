## MODIFIED Requirements

### Requirement: Cash Register Routes

The app SHALL expose cash register routes and shortcuts for sellers and admins.

#### Scenario: Seller records manual movement
- **WHEN** an authorized seller or admin opens `/vendedor/caja` with an open register
- **THEN** the app allows recording a cash income or withdrawal with amount and reason
- **AND** the movement appears in the register history
