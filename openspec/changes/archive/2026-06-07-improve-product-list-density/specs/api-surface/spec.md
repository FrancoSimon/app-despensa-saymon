## ADDED Requirements

### Requirement: Compact Product Browsing
Product sale surfaces SHALL avoid rendering the full product catalog by default.

#### Scenario: Counter opens with compact catalog
- **WHEN** a seller opens the counter panel without a product search
- **THEN** the app shows a limited set of active products and keeps search/scanner available

#### Scenario: Wholesale portal opens with compact catalog
- **WHEN** a wholesaler opens the portal without a product search or category filter
- **THEN** the app shows a limited set of wholesale products and keeps search/category filtering available

### Requirement: Compact Cart Lists
Cart item lists SHALL stay visually compact as the number of selected products grows.

#### Scenario: Counter cart grows
- **WHEN** a seller adds many products to the cart
- **THEN** the cart item area scrolls within a constrained height

#### Scenario: Wholesale cart grows
- **WHEN** a wholesaler adds many products to a new order
- **THEN** the cart item area scrolls within a constrained height

### Requirement: Product Category Suggestions
The admin product form SHALL suggest common categories while allowing custom category values.

#### Scenario: Admin enters product category
- **WHEN** an admin creates or edits a product
- **THEN** the category field offers predefined options and also accepts custom text
