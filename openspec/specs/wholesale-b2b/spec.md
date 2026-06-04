## Purpose

Define the wholesale customer catalog, cart, delivery date, and order history experience.

## Requirements

### Requirement: Wholesale Catalog
The system SHALL show wholesale users only products enabled for wholesale.

#### Scenario: Wholesaler opens catalog
- **WHEN** a wholesale user views the catalog
- **THEN** the system shows only products where `habilitadoMayorista` is true
- **AND** supports category filters
- **AND** displays the applicable wholesale price

### Requirement: Real-time Quantity Special Price
The wholesale cart SHALL recalculate unit price based on quantity.

#### Scenario: Quantity is below special threshold
- **WHEN** item quantity is lower than `cantidadEspecial`
- **THEN** the unit price is `precioMayoristaFijo`

#### Scenario: Quantity reaches special threshold
- **WHEN** item quantity is greater than or equal to `cantidadEspecial`
- **AND** a special price exists
- **THEN** the unit price is `precioMayoristaEspecial`
- **AND** the cart displays "Precio especial por X unidades aplicado"

### Requirement: Saturday Delivery Date
The wholesale order flow SHALL allow only Saturday delivery dates.

#### Scenario: Order before weekly cutoff
- **WHEN** today is Thursday before 23:59
- **THEN** the wholesaler can choose the Saturday of the same week

#### Scenario: Order after weekly cutoff
- **WHEN** today is Friday or Saturday
- **THEN** the wholesaler can choose the next Saturday

#### Scenario: Backend validates delivery date
- **WHEN** a wholesale order is submitted
- **THEN** the backend validates the Saturday and cutoff rules

### Requirement: Pending Order Creation Without Stock Deduction
Wholesale orders SHALL be created as pending and SHALL NOT deduct stock until admin confirmation.

#### Scenario: Wholesaler confirms order
- **WHEN** the wholesaler submits items, desired delivery date, and optional comment
- **THEN** the system creates an order with status `pendiente`
- **AND** does not modify product stock
- **AND** redirects to "Mis Pedidos" with a success message

### Requirement: Wholesale Order History
The system SHALL let wholesale users view their own orders and statuses.

#### Scenario: Wholesaler views history
- **WHEN** a wholesale user opens order history
- **THEN** the system lists only that user's orders
- **AND** allows filtering by status
- **AND** supports statuses `pendiente`, `confirmado`, `entregado`, and `rechazado`

#### Scenario: Wholesaler reviews order outcome
- **WHEN** an order is confirmed or rejected
- **THEN** confirmed orders show assigned delivery date
- **AND** rejected orders may show a rejection reason
