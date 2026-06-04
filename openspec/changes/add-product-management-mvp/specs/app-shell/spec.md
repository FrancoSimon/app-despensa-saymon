## MODIFIED Requirements

### Requirement: Authenticated App Shell
The system SHALL provide a shared authenticated shell for protected role areas.

#### Scenario: Authenticated user views protected area
- **WHEN** an authenticated user opens an allowed protected route
- **THEN** the system displays the SAYMON brand, current role context, navigation for the current area, and a logout action

#### Scenario: Admin navigates to product management
- **WHEN** an authenticated admin views the admin shell or dashboard
- **THEN** they can navigate to `/admin/productos`
