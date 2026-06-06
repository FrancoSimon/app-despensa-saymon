## MODIFIED Requirements

### Requirement: Admins can confirm wholesale orders with stock control

Admin order confirmation SHALL verify stock before deducting stock, changing state, and storing stock movements for deducted products.

#### Scenario: Admin confirms with enough stock
- **WHEN** all order items have enough available stock
- **THEN** the system deducts stock for each product
- **AND** marks the order as confirmed
- **AND** stores a stock movement linked to the wholesale order for each deducted product

