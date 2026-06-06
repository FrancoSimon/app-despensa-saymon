## MODIFIED Requirements

### Requirement: POS confirms sales with stock control

The POS SHALL register counter sales only when stock is sufficient and the seller has an open cash register.

#### Scenario: Seller confirms sale with open cash register
- **WHEN** the seller confirms checkout
- **THEN** the system verifies stock for each item
- **AND** associates the sale with the open cash register
- **AND** deducts product stock
- **AND** registers a sale with type `mostrador`
- **AND** shows the sale ticket

#### Scenario: Seller confirms sale without open cash register
- **WHEN** the seller has no open cash register
- **THEN** the system blocks checkout
- **AND** tells the seller to open a cash register

