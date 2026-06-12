## Overview

Add barcode capture to the admin product form without changing how products are persisted. The decoded barcode value will populate the existing `codigoBarras` input, so current validation, uniqueness checks, create, and edit actions continue to work unchanged.

## Decisions

- Use `html5-qrcode`, matching the POS scanner dependency already used in the project.
- Build a small scanner component focused on returning a decoded string instead of looking up a product.
- Keep the barcode field controlled so manual typing and scanner updates stay in sync.
- Stop the camera stream after a successful scan and on component unmount.

## UX

- The barcode section shows the normal input plus a scan button.
- Users can type or paste a code manually at any time.
- Pressing scan opens the camera preview in-place.
- On success, the input is filled and a confirmation message is shown.
- On camera permission or scanning errors, the form shows a readable inline message.

## Risks

- Camera scanning requires browser/device permission and usually a secure context. If unavailable, manual entry remains the fallback.
- Some physical USB barcode readers behave like keyboards and will continue to work through the manual input.
