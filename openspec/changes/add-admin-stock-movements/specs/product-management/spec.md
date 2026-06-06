## ADDED Requirements

### Requirement: Stock Movement Registration
The system SHALL allow admins to register manual stock movements.

#### Scenario: Admin registers stock entry
- **WHEN** an admin records an entry for a product
- **THEN** the system increases product stock
- **AND** stores a movement with product, admin, type, quantity, previous stock, resulting stock, reason, and timestamp

#### Scenario: Admin registers stock exit
- **WHEN** an admin records an exit for a product
- **THEN** the system decreases product stock only if enough stock exists
- **AND** stores a movement with product, admin, type, quantity, previous stock, resulting stock, reason, and timestamp

### Requirement: Stock Movement History
Admins SHALL be able to review recent manual stock movements.

#### Scenario: Admin opens stock management
- **WHEN** an admin opens the stock page
- **THEN** the system shows recent stock movements sorted newest first
