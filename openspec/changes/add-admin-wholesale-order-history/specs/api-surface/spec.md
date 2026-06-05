## MODIFIED Requirements

### Requirement: Admin Wholesale Orders Route
The app SHALL expose an admin route for wholesale order management.

#### Scenario: Admin opens wholesale orders route
- **WHEN** an admin navigates to `/admin/pedidos`
- **THEN** the app shows wholesale orders using the selected status filter
- **AND** defaults to pending orders

#### Scenario: Admin changes status filter
- **WHEN** an admin navigates to `/admin/pedidos?estado=confirmado`
- **THEN** the app shows confirmed wholesale orders
