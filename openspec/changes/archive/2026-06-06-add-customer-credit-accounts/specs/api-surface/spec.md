## ADDED Requirements

### Requirement: Customer Account Admin Surface
The app SHALL expose an admin current-account page.

#### Scenario: Admin reviews accounts
- **WHEN** an admin navigates to `/admin/cuentas-corrientes`
- **THEN** the app shows customers with current balance
- **AND** the admin can register a partial or full payment
- **AND** each payment links to a printable internal receipt
