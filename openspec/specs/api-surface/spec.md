## Purpose

Define the initial API surface expected by the SAYMON MVP.
## Requirements
### Requirement: Authentication API
The system SHALL expose or integrate authentication through Supabase Auth.

#### Scenario: Login request
- **WHEN** a client submits email and password from `/login`
- **THEN** the system authenticates through Supabase Auth
- **AND** loads the application profile and role for authorization

### Requirement: Products API
The system SHALL expose product listing and admin creation endpoints.

#### Scenario: Product list request
- **WHEN** a client requests `GET /api/productos`
- **THEN** the system returns active products filtered by optional category, wholesale-enabled flag, or search query according to caller role

#### Scenario: Product creation request
- **WHEN** an admin posts product data to `POST /api/productos`
- **THEN** the system creates the product when validation passes

### Requirement: Bulk Price API
The system SHALL expose an admin bulk price update endpoint.

#### Scenario: Bulk price update request
- **WHEN** an admin posts category, price type, action, and value to `POST /api/productos/actualizar-masiva`
- **THEN** the system applies the requested bulk price update after validation

### Requirement: Sales API
The system SHALL expose a seller sale creation endpoint.

#### Scenario: Sale creation request
- **WHEN** a seller posts items, discount, surcharge, and payment method to `POST /api/ventas`
- **THEN** the system registers the sale and returns sale data plus an internal ticket URL when stock is sufficient

### Requirement: Wholesale Orders API
The system SHALL expose wholesale order creation and admin confirmation endpoints.

#### Scenario: Wholesale order creation request
- **WHEN** a wholesale user posts items, desired delivery date, and optional comment to `POST /api/pedidos`
- **THEN** the system creates a pending order without deducting stock

#### Scenario: Wholesale order confirmation request
- **WHEN** an admin puts assigned delivery date to `PUT /api/pedidos/:id/confirmar`
- **THEN** the system confirms the order when stock is sufficient

### Requirement: Upload API
The system SHALL expose an admin file upload endpoint.

#### Scenario: Product image upload request
- **WHEN** an admin posts multipart form data to `POST /api/upload`
- **THEN** the system uploads the file and returns a public URL

### Requirement: Customer Account Admin Surface
The app SHALL preserve admin navigation when opening related receipts from current-account pages.

#### Scenario: Admin returns from account sale ticket
- **WHEN** an admin opens a sale ticket from a customer current-account detail
- **THEN** the ticket page "Volver" link returns to the customer current-account detail

### Requirement: Admin Record Pagination
Admin record list pages SHALL paginate results and preserve active filters.

#### Scenario: Admin navigates paginated records
- **WHEN** an admin opens a record list page with many records
- **THEN** the app shows only the selected page of records
- **AND** provides previous and next page links when available

#### Scenario: Pagination preserves filters
- **WHEN** an admin changes page while filters are active
- **THEN** the app keeps the existing filters in the pagination links

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

### Requirement: Compact Wholesale Order History
The wholesale portal SHALL keep the previous order list compact on small screens.

#### Scenario: Wholesaler views previous orders
- **WHEN** a wholesaler opens the portal with previous orders
- **THEN** the app shows only the two newest orders in the first view
- **AND** provides controls to navigate older orders when available

### Requirement: Single Entry Home Screen
The public home screen SHALL present one login entry and avoid exposing role-specific module shortcuts.

#### Scenario: Visitor opens home
- **WHEN** a visitor opens the home screen
- **THEN** the app shows a commerce welcome message
- **AND** provides a single login call to action
- **AND** does not show separate module labels under the logo

### Requirement: Motivational Login Copy
The login screen SHALL greet users with a motivational message instead of listing role modules.

#### Scenario: User opens login
- **WHEN** a user opens the login screen
- **THEN** the app shows a motivational welcome message for starting the work session

### Requirement: Fast POS Search
The POS SHALL support fast product selection by search, barcode, and keyboard.

#### Scenario: Seller searches products
- **WHEN** a seller types in the product search
- **THEN** matching products are prioritized by exact barcode, name prefix, name match, category, and barcode match

#### Scenario: Seller uses keyboard product entry
- **WHEN** the product search is focused and the seller presses Enter
- **THEN** the first visible product is added to the cart when available

### Requirement: POS Keyboard Shortcuts
The POS SHALL provide keyboard shortcuts for frequent counter actions.

#### Scenario: Seller uses shortcuts
- **WHEN** a seller is on the POS screen
- **THEN** the app supports shortcuts for focusing search, selecting payment method, clearing the cart, and confirming the sale

### Requirement: POS Confirmation And Safety
The POS SHALL clearly confirm the sale before submitting and keep server-side permission checks enforced.

#### Scenario: Seller confirms sale
- **WHEN** a seller attempts to confirm a sale
- **THEN** the app shows a summary of the sale before submitting

#### Scenario: Sale is blocked
- **WHEN** the cash register is closed or account-current sale has no customer
- **THEN** the app blocks confirmation and explains the required action

### Requirement: POS Cash Change Helper
The POS SHALL calculate change for cash payments during sale confirmation.

#### Scenario: Seller confirms cash sale
- **WHEN** a seller confirms a counter sale with cash payment
- **THEN** the app asks for the amount received
- **AND** shows the exact change to give
- **AND** prevents confirming when the received amount is less than the sale total

### Requirement: Wholesale Ordering UX
The wholesale portal SHALL provide fast product selection, keyboard shortcuts, and clear order confirmation.

#### Scenario: Wholesaler searches products
- **WHEN** a wholesaler types in product search
- **THEN** matching products are prioritized by exact barcode, name prefix, name match, category, and barcode match

#### Scenario: Wholesaler confirms order
- **WHEN** a wholesaler attempts to send an order
- **THEN** the app shows a summary before submitting the order

#### Scenario: Wholesaler uses shortcuts
- **WHEN** a wholesaler is on the ordering screen
- **THEN** the app supports shortcuts for focusing search, focusing category, clearing the cart, and confirming the order

### Requirement: Wholesale Order Detail Modal
The wholesale portal SHALL allow wholesalers to inspect a previous order without leaving the page.

#### Scenario: Wholesaler opens order detail
- **WHEN** a wholesaler clicks "Ver detalle" on a previous order
- **THEN** the app shows a modal with order status, delivery date, items, quantities, prices, subtotals, and total

#### Scenario: Wholesaler closes order detail
- **WHEN** a wholesaler closes the detail modal
- **THEN** the app returns to the order list without navigation

### Requirement: In-App Confirmation Dialogs
Critical actions SHALL use styled in-app confirmation dialogs instead of browser-native confirm dialogs.

#### Scenario: User submits critical mutation form
- **WHEN** a user submits a form that changes stock, cash, customer debt, product active state, or sale status
- **THEN** the app shows an in-app confirmation dialog before executing the mutation
- **AND** executes the mutation only after the user confirms

#### Scenario: Critical form is invalid
- **WHEN** a user submits an invalid critical mutation form
- **THEN** the app shows validation feedback before showing a confirmation dialog

### Requirement: Inline Validation Feedback
Forms SHALL show validation feedback inside the app UI instead of relying on browser-native validation bubbles for supported forms.

#### Scenario: User submits an incomplete supported form
- **WHEN** a user submits a supported form with missing or invalid required values
- **THEN** the app shows a clear inline validation message near the related field or action
