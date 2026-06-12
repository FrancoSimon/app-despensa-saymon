## Overview

The product form is a client component that receives a Server Action through the `action` prop. To add confirmation without changing the action contract, the form will intercept submit attempts, validate the native form constraints, show a `ConfirmDialog`, and then call `requestSubmit()` after confirmation.

## Decisions

- Use the existing `ConfirmDialog` to match other confirmation flows.
- Scope confirmation to product creation by detecting the absence of an existing `product`.
- Preserve native required/number validation by calling `reportValidity()` before opening the modal.
- Use a ref flag to allow the confirmed submission through without reopening the modal.

## Risks

- If future product edit screens also need confirmation, this component can accept an explicit prop instead of deriving from `product`.
- If native validation is later replaced with inline validation, the confirmation guard should remain after validation passes.
