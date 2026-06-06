## MODIFIED Requirements

### Requirement: Cash Register Routes

The app SHALL expose cash register routes and shortcuts for sellers and admins.

#### Scenario: Seller sees register action on counter panel
- **WHEN** an authorized seller or admin navigates to `/vendedor`
- **THEN** the app shows whether a cash register is open
- **AND** the app links to `/vendedor/caja` to open or close the register
