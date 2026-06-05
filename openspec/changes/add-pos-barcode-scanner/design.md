## Context

The POS already loads available products into the client and supports exact barcode search. The scanner can use that product list to resolve scans without extra network calls.

## Decisions

1. Use `html5-qrcode`.
   - Rationale: the existing specification names it and it handles camera stream and barcode detection.

2. Keep scanner logic in a dedicated client component.
   - Rationale: camera access is browser-only and should stay isolated from POS cart logic.

3. Close the scanner after a successful product match.
   - Rationale: repeated scans can be started again intentionally and the seller gets clear feedback.

## Non-Goals

- USB scanner support.
- Continuous multi-item scanning mode.
- Creating products from unknown scanned barcodes.
