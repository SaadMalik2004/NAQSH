# NAQSH — Wear Your Identity

Full-stack e-commerce store for a Pakistani fashion brand.
**React 19 + Vite + Tailwind 4 + Supabase (Postgres, Auth, Storage) — deployed on Vercel.**

## Features
- **Auth:** register, login, logout, forgot/reset password, protected routes, admin-only routes
- **Shop:** live products from the database, filters/search/sort, skeleton loaders, sold-out + low-stock states
- **Cart & wishlist:** persistent cart; wishlist syncs to the database after login
- **Checkout:** saved addresses, promo codes, Cash on Delivery / bank transfer, orders created **server-side**
- **Account:** profile, saved addresses, order history, order detail, cancel pending orders
- **Reviews:** verified buyers only, ratings recalculated automatically
- **Admin dashboard (`/admin`):** manage orders, products (with image upload), contact messages
- **Pages:** About, Contact (saved to DB), Shipping & Returns, Size Guide, Privacy, Terms, 404
- **Production/security checklist:** rate limiting (client + server), input validation, RLS on every table, env variables, error boundary, friendly errors, lazy-loaded pages, WebP images

## Setup (10 minutes)

### 1. Supabase
1. Create a project at supabase.com.
2. **SQL Editor** → run `supabase/schema.sql`, then `supabase/seed.sql`.
3. **Project Settings → API** → copy the *Project URL* and *anon public* key.
4. (Recommended for testing) **Authentication → Providers → Email** → turn *Confirm email* OFF. Leave ON for production.
5. **Authentication → URL Configuration** → set *Site URL* to your Vercel URL and add `https://YOUR-APP.vercel.app/**` and `http://localhost:5173/**` to *Redirect URLs* (needed for password-reset emails).

### 2. Run locally
```bash
npm install
cp .env.example .env      # then paste your two Supabase values
npm run dev
```

### 3. Make yourself admin
Register on the site, then run in the Supabase SQL Editor:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```
Sign out/in — an **Admin Dashboard** link appears in the account menu.

### 4. Deploy to Vercel
1. Push to GitHub (`.env` is git-ignored).
2. Vercel → *Add New Project* → import the repo (framework: Vite is auto-detected).
3. **Environment Variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` already handles page refreshes on routes like `/shop`.

## Before you go live — edit these
- `src/config/site.js` → your real email, phone, address, social links
- Promo codes: table `promo_codes` in Supabase
- Shipping rule ($100 free / $15 flat): `SHOP_RULES` in `src/config/site.js` **and** the two constants in `place_order()` in `supabase/schema.sql`
- Prices are in USD — change the `money()` helper in `src/utils/format.js` if you switch to PKR

## Security notes
- Only the public **anon** key is used in the browser. Never put the `service_role` key in `.env` or the frontend.
- Prices, stock, discounts and shipping are calculated by the database function `place_order()`; the browser cannot tamper with them.
- `profiles.role` cannot be changed from the app — only from the SQL Editor.

## Project structure
```
src/
  config/       business details & rules
  context/      Auth, Products, Shop (cart/wishlist) state
  services/     all Supabase calls (one file per area)
  pages/        Home, Shop, Product, Cart, Checkout, Auth, Account, Info, Admin
  components/   layout, home, product, cart, account, common UI
  routes/       AppRouter, ProtectedRoute, AdminRoute
  utils/        validators, errors, rate limiter, cache, formatting
supabase/       schema.sql (tables, RLS, functions) + seed.sql
```
