# Supabase setup

This project uses Supabase Auth for login and `public.profiles` for SAYMON roles.

Admin user management from the app requires a server-only service role key in `.env.local`:

```text
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Never expose this key with `NEXT_PUBLIC_`.

## 1. Apply the profiles migration

Open the Supabase project SQL Editor and run:

```sql
-- Paste and run the contents of:
-- supabase/migrations/20260603233000_create_profiles.sql
```

The publishable key in `.env.local` cannot create tables or bypass RLS, so this step must be done from the Supabase Dashboard, Supabase CLI with project access, or another admin database connection.

## 2. Create the first admin Auth user

In Supabase Dashboard:

1. Go to Authentication > Users.
2. Create a user with the admin email and password you want to use.
3. Confirm the user if email confirmation is enabled.
4. Copy the user's UUID.

## 3. Insert the first admin profile

Run this in the SQL Editor, replacing the placeholders:

```sql
insert into public.profiles (
  auth_user_id,
  nombre,
  email,
  rol,
  activo
) values (
  'AUTH_USER_UUID_HERE',
  'Admin SAYMON',
  'admin@saymon.local',
  'admin',
  true
);
```

After this row exists, logging in with that Auth user should route to `/admin`.

## 4. Create future profiles

Once the first admin exists, admin users can manage future profile rows through app features or SQL. Public self-registration is not part of the MVP.

## 5. Apply the products migration

After the profiles migration is applied and the first admin works, run the contents of:

```text
supabase/migrations/20260604000000_create_productos.sql
```

This creates `public.productos`, product indexes, and RLS policies for admin, seller, and wholesale reads.

## 6. Apply the product images Storage migration

Run the contents of:

```text
supabase/migrations/20260604003000_create_product_images_bucket.sql
```

This creates the public `product-images` bucket with JPG, PNG, WEBP and 2MB limits, plus Storage policies that allow public reads and admin-only writes.

## 7. Apply the counter sales migration

Run the contents of:

```text
supabase/migrations/20260604010000_create_counter_sales.sql
```

This creates `ventas`, `venta_items`, RLS policies, and the `confirmar_venta_mostrador` RPC used by the POS to register sales and decrement stock atomically.

If Supabase reports `column reference "fecha" is ambiguous` when confirming a sale, run:

```text
supabase/fixes/20260604_fix_confirmar_venta_fecha_ambiguous.sql
```

## 8. Apply the wholesale orders migration

Run the contents of:

```text
supabase/migrations/20260605000000_create_wholesale_orders.sql
```

This creates `pedidos_mayoristas`, `pedido_mayorista_items`, RLS policies, and the `crear_pedido_mayorista` RPC used by the wholesale portal to create pending orders without decrementing stock.

## 9. Apply the wholesale admin RPC migration

Run the contents of:

```text
supabase/migrations/20260605010000_create_wholesale_order_admin_rpcs.sql
```

This creates the admin-only `confirmar_pedido_mayorista` and `rechazar_pedido_mayorista` RPCs. Confirmation verifies current stock, deducts it atomically, and marks the order as confirmed. Rejection does not change stock.

## 10. Apply the wholesale delivery RPC migration

Run the contents of:

```text
supabase/migrations/20260605020000_create_wholesale_order_delivery_rpc.sql
```

This creates the admin-only `entregar_pedido_mayorista` RPC used to mark confirmed wholesale orders as delivered without modifying stock.

## 11. Apply the counter sale payment methods migration

Run the contents of:

```text
supabase/migrations/20260605030000_add_counter_sale_payment_methods.sql
```

This extends `forma_pago_venta` with `tarjeta_credito`, `tarjeta_debito`, and `transferencia` for the POS checkout.
