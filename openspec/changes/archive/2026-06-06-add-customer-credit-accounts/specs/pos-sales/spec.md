## ADDED Requirements

### Requirement: Current Account Sales
The POS SHALL allow sellers to register counter sales on customer current account.

#### Scenario: Seller confirms current-account sale
- **WHEN** the seller selects `cuenta_corriente`
- **THEN** the system requires an active customer
- **AND** registers the sale
- **AND** creates a customer account debit movement for the sale total

#### Scenario: Seller confirms current-account sale without customer
- **WHEN** the seller selects `cuenta_corriente` without a customer
- **THEN** the system blocks checkout with an actionable error
