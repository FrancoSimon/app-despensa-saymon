# Supabase setup

This project uses Supabase Auth for login and `public.profiles` for SAYMON roles.

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
