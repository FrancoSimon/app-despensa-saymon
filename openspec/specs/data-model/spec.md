## Purpose

Define core data entities required by the SAYMON MVP.
## Requirements
### Requirement: User Profile Entity
The system SHALL store application user profiles linked to Supabase Auth users.

#### Scenario: User profile is persisted
- **WHEN** a user profile is saved
- **THEN** the system stores id, Supabase Auth user id, name, unique email, role, and profile data
- **AND** role is one of `admin`, `vendedor`, or `mayorista`
- **AND** locality is required when role is `mayorista`
- **AND** the application does not store password hashes in profile tables

### Requirement: Product Entity
The system SHALL store product data for counter and wholesale sales.

#### Scenario: Product is persisted
- **WHEN** a product is saved
- **THEN** the system stores id, optional unique barcode, name, category, counter price, fixed wholesale price, optional special wholesale price, special quantity, stock, minimum stock, wholesale enabled flag, active flag, and optional image URL
- **AND** inactive products remain available for historical relationships

### Requirement: Sale Entity
The system SHALL store counter sale transactions.

#### Scenario: Counter sale is persisted
- **WHEN** a sale is registered
- **THEN** the system stores id, seller user id, date, total, type `mostrador`, optional discount, and optional surcharge

### Requirement: Wholesale Order Entity
The system SHALL store wholesale orders.

#### Scenario: Wholesale order is persisted
- **WHEN** a wholesale order is created
- **THEN** the system stores id, wholesale user id, order date, desired delivery date, optional assigned delivery date, status, total, and optional comment
- **AND** status is one of `pendiente`, `confirmado`, `entregado`, or `rechazado`

### Requirement: Customer Account Movement Entity
The system SHALL store customer current-account debit and payment movements.

#### Scenario: Account movement is persisted
- **WHEN** a current-account sale or payment is registered
- **THEN** the system stores id, customer id, admin/seller profile id, optional sale id, type, amount, payment method when applicable, note, and timestamp
- **AND** movement type is one of `venta` or `pago`

#### Scenario: Current-account sale is canceled
- **WHEN** a current-account sale is canceled
- **THEN** the account movement linked to that sale no longer contributes to the customer balance
