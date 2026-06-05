## Context

Sales and item data already exist in `ventas` and `venta_items`. Wholesale order status data exists in `pedidos_mayoristas`. The first reporting pass can query those tables directly through existing admin RLS.

## Decisions

1. Use server-side queries and JS aggregation.
   - Rationale: avoids a new SQL migration for the first report screen and keeps the report easy to evolve.

2. Use date inputs via search params.
   - Rationale: keeps reports linkable and avoids complex client state.

3. Export best sellers from current table data.
   - Rationale: the CSV should match exactly what the admin is viewing.

## Non-Goals

- Advanced charts.
- PDF exports.
- Cash drawer closing.
- Profit or margin reports.
