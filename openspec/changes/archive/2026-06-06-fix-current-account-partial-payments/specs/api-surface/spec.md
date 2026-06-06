## MODIFIED Requirements

### Requirement: Customer Account Admin Surface
The app SHALL expose an admin current-account page with safe payment controls and customer search.

#### Scenario: Admin searches current-account customers
- **WHEN** an admin enters a customer search term
- **THEN** the current-account page filters customer account cards by name, phone, business name, or document

#### Scenario: Admin registers partial payment
- **WHEN** an admin records a payment lower than the customer balance
- **THEN** the receipt identifies the operation as a partial payment
- **AND** the customer remains with pending balance

#### Scenario: Admin records full debt cancellation
- **WHEN** an admin records a payment equal to the customer balance
- **THEN** the receipt identifies the operation as a full cancellation
- **AND** the customer balance is zero
