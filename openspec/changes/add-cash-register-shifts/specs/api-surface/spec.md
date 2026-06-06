## ADDED Requirements

### Requirement: Cash Register Routes

The app SHALL expose cash register routes for sellers and admins.

#### Scenario: Seller opens cash register page
- **WHEN** an authorized seller or admin navigates to `/vendedor/caja`
- **THEN** the app shows the current open register or controls to open one

#### Scenario: Admin opens cash register history
- **WHEN** an admin navigates to `/admin/cajas`
- **THEN** the app shows recent cash register shifts

