## MODIFIED Requirements

### Requirement: Optional Counter Customers
The POS SHALL allow counter sales to remain anonymous or be linked to an optional customer.

#### Scenario: Seller confirms sale without customer
- **WHEN** the seller confirms a counter sale without selecting a customer
- **THEN** the sale is registered normally
- **AND** no customer is required

#### Scenario: Seller confirms sale with customer
- **WHEN** the seller searches and selects an active customer before confirming a sale
- **THEN** the sale stores the customer reference
- **AND** the internal ticket shows the customer name

#### Scenario: Seller creates customer from modal
- **WHEN** the seller opens the customer creation modal
- **THEN** the system allows entering name, phone, email, business name, document data, tax condition, address, locality, and notes
- **AND** the newly created customer is selected for the current sale
