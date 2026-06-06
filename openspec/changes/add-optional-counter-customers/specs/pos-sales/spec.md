## ADDED Requirements

### Requirement: Optional Counter Customers
The POS SHALL allow counter sales to remain anonymous or be linked to an optional customer.

#### Scenario: Seller confirms sale without customer
- **WHEN** the seller confirms a counter sale without selecting a customer
- **THEN** the sale is registered normally
- **AND** no customer is required

#### Scenario: Seller confirms sale with customer
- **WHEN** the seller selects an active customer before confirming a sale
- **THEN** the sale stores the customer reference
- **AND** the internal ticket shows the customer name

#### Scenario: Seller creates quick customer
- **WHEN** the seller enters a new customer name and optional contact data
- **THEN** the system creates an active customer
- **AND** the seller can associate it with the current sale
