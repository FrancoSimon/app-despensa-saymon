## MODIFIED Requirements

### Requirement: Customer Account Admin Surface
The app SHALL expose admin current-account list and detail pages for balance management and audit.

#### Scenario: Admin opens customer account detail
- **WHEN** an admin opens `/admin/cuentas-corrientes/:clienteId`
- **THEN** the app shows customer identity, current balance, debit total, payment total, and movement count
- **AND** the app shows all account movements in chronological order with running balance

#### Scenario: Admin audits related receipts
- **WHEN** a movement has a related sale or payment receipt
- **THEN** the detail page links to the corresponding sale ticket or payment receipt

#### Scenario: Admin records payment from detail
- **WHEN** an admin registers a payment from the customer account detail
- **THEN** the payment reduces only the customer account balance by the payment amount
- **AND** the payment receipt remains printable
