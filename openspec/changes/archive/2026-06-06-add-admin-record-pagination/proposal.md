## Why

Admin record pages currently render full or fixed-size record lists. As sales, products, cash registers, orders, users, purchases, and stock movements grow, those pages need pagination to avoid loading too many records at once.

## What Changes

- Add reusable pagination UI and parsing helpers.
- Paginate primary admin record lists while preserving existing filters.
- Query paginated records with range/count instead of loading all rows.

## Impact

- Affected specs: api-surface, reports-analytics
- Affected code: admin list pages and queries for sales, products, users, cash registers, wholesale orders, and stock records
