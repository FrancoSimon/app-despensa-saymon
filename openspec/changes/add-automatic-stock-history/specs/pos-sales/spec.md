## MODIFIED Requirements

### Requirement: POS confirms sales with stock control

The POS SHALL register counter sales, deduct stock only when stock is sufficient, and store a stock movement for each product deducted by the sale.

#### Scenario: Seller confirms sale with enough stock
- **WHEN** the seller confirms a sale with cart items
- **THEN** the system verifies stock for each item
- **AND** deducts product stock
- **AND** stores a stock movement linked to the sale for each deducted product

