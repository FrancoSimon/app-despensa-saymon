## ADDED Requirements

### Requirement: Wholesale Order Detail Modal
The wholesale portal SHALL allow wholesalers to inspect a previous order without leaving the page.

#### Scenario: Wholesaler opens order detail
- **WHEN** a wholesaler clicks "Ver detalle" on a previous order
- **THEN** the app shows a modal with order status, delivery date, items, quantities, prices, subtotals, and total

#### Scenario: Wholesaler closes order detail
- **WHEN** a wholesaler closes the detail modal
- **THEN** the app returns to the order list without navigation
