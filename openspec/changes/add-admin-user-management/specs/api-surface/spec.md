## ADDED Requirements

### Requirement: Admin Users Route
The app SHALL expose admin user management routes.

#### Scenario: Admin opens users route
- **WHEN** an admin navigates to `/admin/usuarios`
- **THEN** the app lists app profiles and user management actions

#### Scenario: Non-admin opens users route
- **WHEN** a non-admin navigates to `/admin/usuarios`
- **THEN** the app redirects according to existing admin route protection
