## ADDED Requirements

### Requirement: Admin Wholesale Orders Route
The app SHALL expose an admin route for pending wholesale order management.

#### Scenario: Admin opens wholesale orders route
- **WHEN** an admin navigates to `/admin/pedidos`
- **THEN** the app shows pending wholesale orders and their available actions

#### Scenario: Non-admin opens wholesale orders route
- **WHEN** a non-admin navigates to `/admin/pedidos`
- **THEN** the app redirects according to existing admin route protection
