## Why

The app has role-based route protection, but several server pages still fetch the current profile without a strict role guard. Seller ticket access also needs an ownership check so sellers cannot inspect unrelated tickets by URL.

## What Changes

- Add shared server guards for admin, seller/admin, and wholesale/admin access.
- Apply guards to admin, seller, wholesale, and ticket pages.
- Include sale seller ownership in ticket access checks.

## Impact

- Affected specs: `auth`, `api-surface`.
- Affected files: `lib/auth`, `app/admin`, `app/vendedor`, `app/mayorista`, `lib/sales`, OpenSpec artifacts.
