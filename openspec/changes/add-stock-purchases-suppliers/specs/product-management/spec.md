## ADDED Requirements

### Requirement: Supplier Stock Purchases
The system SHALL allow admins to register product stock entries as purchases from suppliers.

#### Scenario: Admin registers a product purchase
- **WHEN** an admin selects a product, supplier, quantity, unit cost, purchase date, and optional receipt data
- **THEN** the system stores the purchase
- **AND** increases product stock atomically
- **AND** stores a linked stock movement with origin `compra`
- **AND** updates the product latest purchase cost

#### Scenario: Admin creates supplier during purchase
- **WHEN** the admin enters a new supplier name instead of selecting an existing supplier
- **THEN** the system creates the supplier if it does not already exist
- **AND** links the purchase to that supplier

#### Scenario: Admin reviews purchase history
- **WHEN** the admin opens the stock panel
- **THEN** the system shows recent purchases with date, supplier, product, quantity, unit cost, and total cost
