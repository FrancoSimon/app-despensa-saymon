## MODIFIED Requirements

### Requirement: Camera Barcode Scanner
The POS SHALL support barcode scanning with a webcam using `html5-qrcode`.

#### Scenario: Seller scans product
- **WHEN** the seller presses "Escanear"
- **THEN** the system opens the camera stream
- **AND** detects a barcode automatically
- **AND** adds the detected product to the cart when the barcode matches an available product
- **AND** closes the camera after a successful scan

#### Scenario: Barcode scan fails
- **WHEN** camera access fails or the detected barcode does not match an available product
- **THEN** the system shows an actionable error
