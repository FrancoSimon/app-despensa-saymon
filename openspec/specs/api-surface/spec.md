## Purpose

Define the initial API surface expected by the SAYMON MVP.
## Requirements
### Requirement: Authentication API
The system SHALL expose or integrate authentication through Supabase Auth.

#### Scenario: Login request
- **WHEN** a client submits email and password from `/login`
- **THEN** the system authenticates through Supabase Auth
- **AND** loads the application profile and role for authorization

### Requirement: Products API
The system SHALL expose product listing and admin creation endpoints.

#### Scenario: Product list request
- **WHEN** a client requests `GET /api/productos`
- **THEN** the system returns active products filtered by optional category, wholesale-enabled flag, or search query according to caller role

#### Scenario: Product creation request
- **WHEN** an admin posts product data to `POST /api/productos`
- **THEN** the system creates the product when validation passes

### Requirement: Bulk Price API
The system SHALL expose an admin bulk price update endpoint.

#### Scenario: Bulk price update request
- **WHEN** an admin posts category, price type, action, and value to `POST /api/productos/actualizar-masiva`
- **THEN** the system applies the requested bulk price update after validation

### Requirement: Sales API
The system SHALL expose a seller sale creation endpoint.

#### Scenario: Sale creation request
- **WHEN** a seller posts items, discount, surcharge, and payment method to `POST /api/ventas`
- **THEN** the system registers the sale and returns sale data plus an internal ticket URL when stock is sufficient

### Requirement: Wholesale Orders API
The system SHALL expose wholesale order creation and admin confirmation endpoints.

#### Scenario: Wholesale order creation request
- **WHEN** a wholesale user posts items, desired delivery date, and optional comment to `POST /api/pedidos`
- **THEN** the system creates a pending order without deducting stock

#### Scenario: Wholesale order confirmation request
- **WHEN** an admin puts assigned delivery date to `PUT /api/pedidos/:id/confirmar`
- **THEN** the system confirms the order when stock is sufficient

### Requirement: Upload API
The system SHALL expose an admin file upload endpoint.

#### Scenario: Product image upload request
- **WHEN** an admin posts multipart form data to `POST /api/upload`
- **THEN** the system uploads the file and returns a public URL

### Requirement: Customer Account Admin Surface
The app SHALL expose an admin current-account page.

#### Scenario: Admin reviews accounts
- **WHEN** an admin navigates to `/admin/cuentas-corrientes`
- **THEN** the app shows customers with current balance
- **AND** the admin can register a partial or full payment
- **AND** each payment links to a printable internal receipt
