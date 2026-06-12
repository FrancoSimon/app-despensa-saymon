## MODIFIED Requirements

### Requirement: Sale Confirmation and Stock Deduction
The POS SHALL register counter sales, deduct stock only when stock is sufficient, and require confirmation before cancellation.

#### Scenario: Seller confirms sale with enough stock
- **WHEN** the seller confirms checkout
- **THEN** the system verifies stock for each item
- **AND** deducts product stock
- **AND** registers a sale with type `mostrador`
- **AND** shows the sale ticket

#### Scenario: Seller confirms sale without enough stock
- **WHEN** any cart item exceeds available stock
- **THEN** the system blocks checkout
- **AND** shows a stock insufficiency error
- **AND** does not register the sale

#### Scenario: User cancels counter sale
- **WHEN** an authorized user submits a counter sale cancellation with a reason
- **THEN** the app asks for explicit confirmation before cancelling
- **AND** the sale is marked annulled only after confirmation
- **AND** stock and totals are adjusted according to the cancellation rules
