## Why

Several admin and seller actions affect stock, cash, customer debt, or historical records immediately after pressing submit. These actions should ask for explicit confirmation to reduce accidental changes.

## What Changes

- Add a reusable confirmation form wrapper for Server Action forms.
- Require confirmation before deactivating products, annulling counter sales, registering stock purchases/manual movements, registering account payments, registering cash movements, and creating/updating users.
- Preserve existing native/server validation by showing confirmation only after the form is valid.
- Keep non-critical filter/search forms unchanged.

## Capabilities

### New Capabilities

### Modified Capabilities
- `api-surface`: Critical mutation forms use in-app confirmation dialogs.
- `auth`: User creation and updates require confirmation before changing access.
- `product-management`: Product deactivation requires confirmation.
- `pos-sales`: Counter sale cancellation requires confirmation.

## Impact

- Affected UI: admin products, stock, account-current, cash register, user management, and ticket cancellation pages.
- Reuses existing `ConfirmDialog`.
- No database or API schema changes.
