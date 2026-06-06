## Why

The stock panel now links low-stock products to product editing, but returning from the product edit page always goes to the products panel. The stock purchase and manual movement forms also use long product selects, which becomes slow as the catalog grows.

## What Changes

- Preserve the stock panel as the return destination when editing products from stock.
- Add searchable product selectors to stock purchase and manual movement forms.

## Impact

- Affected specs: product-management
- Affected code: product edit route/actions, stock panel UI
