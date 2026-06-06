## Why

Sale tickets opened from a customer current-account detail page receive a `volver` URL, but the ticket page only accepts admin return URLs for sales and cash-register pages. As a result, "Volver" falls back to the seller counter panel instead of the customer account detail.

## What Changes

- Allow sale tickets to return to admin current-account pages.

## Impact

- Affected specs: api-surface
- Affected code: sale ticket back-link handling
