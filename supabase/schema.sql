-- =====================================================================
-- NAQSH — Supabase schema (PostgreSQL)
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query.
-- It is safe to re-run. After it succeeds, run seed.sql.
-- Security model: Row Level Security (RLS) is ON for every table.
-- Orders are created ONLY through the place_order() function so prices,
-- stock and discounts are always calculated on the server, never trusted
-- from the browser.
-- =====================================================================

-- ---------- helpers ---------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles --------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text check (full_name is null or char_length(full_name) between 2 and 100),
  phone          text check (phone is null or phone ~ '^\+?[0-9 ()\-]{7,20}$'),
  preferred_size text check (preferred_size is null or char_length(preferred_size) <= 10),
  silhouette     text check (silhouette is null or char_length(silhouette) <= 40),
  role           text not null default 'customer' check (role in ('customer', 'admin')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Users may change ONLY these columns. "role" can never be changed from the app.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone, preferred_size, silhouette) on public.profiles to authenticated;

-- create a profile automatically for every new sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_name text := left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 100);
begin
  insert into public.profiles (id, full_name)
  values (new.id, case when char_length(v_name) >= 2 then v_name else null end)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- backfill profiles for users that already exist
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

-- ---------- addresses -------------------------------------------------
create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  label        text not null default 'Home' check (char_length(label) between 1 and 30),
  full_name    text not null check (char_length(full_name) between 2 and 100),
  phone        text not null check (phone ~ '^\+?[0-9 ()\-]{7,20}$'),
  address_line text not null check (char_length(address_line) between 5 and 200),
  city         text not null check (char_length(city) between 2 and 80),
  postal_code  text not null check (char_length(postal_code) between 3 and 12),
  country      text not null default 'Pakistan' check (char_length(country) between 2 and 60),
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);
alter table public.addresses enable row level security;

drop policy if exists "addresses_own" on public.addresses;
create policy "addresses_own" on public.addresses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.addresses_guard()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' and (select count(*) from public.addresses a where a.user_id = new.user_id) >= 10 then
    raise exception 'ADDRESS_LIMIT';
  end if;
  if new.is_default then
    update public.addresses a set is_default = false where a.user_id = new.user_id and a.id <> new.id;
  end if;
  return new;
end $$;

drop trigger if exists addresses_guard on public.addresses;
create trigger addresses_guard before insert or update on public.addresses
  for each row execute function public.addresses_guard();

-- ---------- products --------------------------------------------------
create table if not exists public.products (
  id            bigint generated by default as identity primary key,
  name          text not null check (char_length(name) between 2 and 150),
  category      text not null check (category in ('Men', 'Women', 'Unisex', 'Footwear', 'Accessories')),
  sub_category  text,
  price         numeric(10,2) not null check (price >= 0),
  old_price     numeric(10,2) check (old_price is null or old_price >= 0),
  rating        numeric(2,1) not null default 0 check (rating between 0 and 5),
  reviews_count int not null default 0 check (reviews_count >= 0),
  badge         text,
  image_url     text not null,
  description   text not null default '',
  sizes         text[] not null default array['One Size'],
  stock         int not null default 0 check (stock >= 0),
  is_active     boolean not null default true,
  sort_order    int not null default 100,   -- lower = shown first on the storefront
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.products enable row level security;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

drop policy if exists "products_read" on public.products;
create policy "products_read" on public.products
  for select to anon, authenticated using (is_active or public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert to authenticated with check (public.is_admin());
drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete" on public.products
  for delete to authenticated using (public.is_admin());

-- ---------- promo codes ----------------------------------------------
create table if not exists public.promo_codes (
  code         text primary key check (code = upper(code) and char_length(code) between 3 and 30),
  percent      int not null check (percent between 1 and 90),
  min_subtotal numeric(10,2) not null default 0,
  is_active    boolean not null default true,
  expires_at   timestamptz
);
alter table public.promo_codes enable row level security;
drop policy if exists "promo_admin_all" on public.promo_codes;
create policy "promo_admin_all" on public.promo_codes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- (customers never read this table; they call validate_promo() below)

create or replace function public.validate_promo(p_code text, p_subtotal numeric)
returns table (code text, percent int)
language plpgsql stable security definer set search_path = public as $$
begin
  return query
    select pc.code, pc.percent
    from public.promo_codes pc
    where pc.code = upper(trim(coalesce(p_code, '')))
      and pc.is_active
      and (pc.expires_at is null or pc.expires_at > now())
      and coalesce(p_subtotal, 0) >= pc.min_subtotal;
end $$;
revoke all on function public.validate_promo(text, numeric) from public;
grant execute on function public.validate_promo(text, numeric) to anon, authenticated;

-- ---------- orders ----------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique,
  user_id        uuid not null references auth.users (id),
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text not null check (payment_method in ('cod', 'bank_transfer')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  subtotal       numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  shipping       numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  promo_code     text,
  ship_name      text not null,
  ship_email     text not null,
  ship_phone     text not null,
  ship_address   text not null,
  ship_city      text not null,
  ship_postal    text not null,
  ship_country   text not null,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
alter table public.orders enable row level security;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
  for select to authenticated using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- no INSERT / DELETE policy on purpose: orders are created by place_order() only.

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    bigint references public.products (id) on delete set null,
  product_name  text not null,
  product_image text,
  size          text not null,
  quantity      int not null check (quantity between 1 and 10),
  unit_price    numeric(10,2) not null
);
create index if not exists order_items_order_idx on public.order_items (order_id);
alter table public.order_items enable row level security;

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o
            where o.id = order_items.order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

-- ---------- place_order(): the ONLY way an order is created ------------
create or replace function public.place_order(
  p_items          jsonb,
  p_shipping       jsonb,
  p_payment_method text,
  p_promo_code     text default null,
  p_notes          text default null
)
returns table (out_order_number text, out_total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_item      jsonb;
  v_prod      public.products%rowtype;
  v_qty       int;
  v_size      text;
  v_subtotal  numeric(10,2) := 0;
  v_discount  numeric(10,2) := 0;
  v_shipping  numeric(10,2) := 0;
  v_total     numeric(10,2) := 0;
  v_percent   int := 0;
  v_promo     text := null;
  v_order_id  uuid;
  v_number    text;
  v_tries     int := 0;
  v_name      text := trim(coalesce(p_shipping ->> 'name', ''));
  v_email     text := lower(trim(coalesce(p_shipping ->> 'email', '')));
  v_phone     text := trim(coalesce(p_shipping ->> 'phone', ''));
  v_address   text := trim(coalesce(p_shipping ->> 'address', ''));
  v_city      text := trim(coalesce(p_shipping ->> 'city', ''));
  v_postal    text := trim(coalesce(p_shipping ->> 'postal_code', ''));
  v_country   text := trim(coalesce(p_shipping ->> 'country', ''));
  c_free_over constant numeric := 100;  -- free shipping when subtotal >= this
  c_flat_ship constant numeric := 15;   -- otherwise flat shipping
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_payment_method not in ('cod', 'bank_transfer') then raise exception 'INVALID_PAYMENT'; end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'INVALID_ITEMS';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 100
     or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 254
     or v_phone !~ '^\+?[0-9 ()\-]{7,20}$'
     or char_length(v_address) not between 5 and 200
     or char_length(v_city) not between 2 and 80
     or char_length(v_postal) not between 3 and 12
     or char_length(v_country) not between 2 and 60 then
    raise exception 'INVALID_SHIPPING';
  end if;

  -- server-side rate limit: max 10 orders / hour / user
  if (select count(*) from public.orders o
      where o.user_id = v_uid and o.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'RATE_LIMITED';
  end if;

  loop
    v_number := 'NQ-' || to_char(now(), 'YYMM') || '-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.orders o where o.order_number = v_number);
    v_tries := v_tries + 1;
    if v_tries > 10 then raise exception 'ORDER_NUMBER_FAILED'; end if;
  end loop;

  insert into public.orders (order_number, user_id, payment_method, promo_code,
                             ship_name, ship_email, ship_phone, ship_address,
                             ship_city, ship_postal, ship_country, notes)
  values (v_number, v_uid, p_payment_method, null,
          v_name, v_email, v_phone, v_address, v_city, v_postal, v_country,
          nullif(left(trim(coalesce(p_notes, '')), 500), ''))
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty  := coalesce(nullif(v_item ->> 'quantity', '')::int, 0);
    v_size := trim(coalesce(v_item ->> 'size', ''));
    if v_qty < 1 or v_qty > 10 then raise exception 'INVALID_ITEMS'; end if;

    select * into v_prod from public.products p
     where p.id = (v_item ->> 'product_id')::bigint and p.is_active
     for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;
    if not (v_size = any (v_prod.sizes)) then raise exception 'INVALID_SIZE:%', v_prod.name; end if;
    if v_prod.stock < v_qty then raise exception 'OUT_OF_STOCK:%', v_prod.name; end if;

    update public.products p set stock = p.stock - v_qty where p.id = v_prod.id;

    insert into public.order_items (order_id, product_id, product_name, product_image, size, quantity, unit_price)
    values (v_order_id, v_prod.id, v_prod.name, v_prod.image_url, v_size, v_qty, v_prod.price);

    v_subtotal := v_subtotal + v_prod.price * v_qty;
  end loop;

  if p_promo_code is not null and trim(p_promo_code) <> '' then
    select pc.code, pc.percent into v_promo, v_percent
      from public.promo_codes pc
     where pc.code = upper(trim(p_promo_code)) and pc.is_active
       and (pc.expires_at is null or pc.expires_at > now())
       and v_subtotal >= pc.min_subtotal;
    if not found then raise exception 'INVALID_PROMO'; end if;
    v_discount := round(v_subtotal * v_percent / 100.0, 2);
  end if;

  v_shipping := case when v_subtotal >= c_free_over then 0 else c_flat_ship end;
  v_total    := v_subtotal - v_discount + v_shipping;

  update public.orders o
     set subtotal = v_subtotal, discount = v_discount, shipping = v_shipping,
         total = v_total, promo_code = v_promo
   where o.id = v_order_id;

  return query select v_number, v_total;
end $$;

revoke all on function public.place_order(jsonb, jsonb, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text, text, text) to authenticated;

-- customers can cancel their own order while it is still "pending"
create or replace function public.cancel_order(p_order_number text)
returns void language plpgsql security definer set search_path = public as $$
declare v_status text;
begin
  select o.status into v_status from public.orders o
   where o.order_number = p_order_number and o.user_id = auth.uid() for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_status <> 'pending' then raise exception 'ORDER_NOT_CANCELLABLE'; end if;
  update public.orders o set status = 'cancelled' where o.order_number = p_order_number;
end $$;
revoke all on function public.cancel_order(text) from public, anon;
grant execute on function public.cancel_order(text) to authenticated;

-- put stock back when an order is cancelled (by customer or admin)
create or replace function public.restore_stock_on_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'ORDER_CANCELLED';
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    for r in select oi.product_id, sum(oi.quantity)::int as qty
               from public.order_items oi where oi.order_id = new.id and oi.product_id is not null
              group by oi.product_id loop
      update public.products p set stock = p.stock + r.qty where p.id = r.product_id;
    end loop;
  end if;
  return new;
end $$;

drop trigger if exists orders_restore_stock on public.orders;
create trigger orders_restore_stock after update of status on public.orders
  for each row when (old.status is distinct from new.status)
  execute function public.restore_stock_on_cancel();

-- ---------- wishlist --------------------------------------------------
create table if not exists public.wishlist_items (
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id bigint not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlist_items enable row level security;
drop policy if exists "wishlist_own" on public.wishlist_items;
create policy "wishlist_own" on public.wishlist_items
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- reviews (verified buyers only) ------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    bigint not null references public.products (id) on delete cascade,
  user_id       uuid not null references auth.users (id) on delete cascade,
  reviewer_name text not null default 'NAQSH Customer',
  rating        int not null check (rating between 1 and 5),
  comment       text not null check (char_length(comment) between 5 and 1000),
  created_at    timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);
alter table public.reviews enable row level security;

drop policy if exists "reviews_read" on public.reviews;
create policy "reviews_read" on public.reviews for select to anon, authenticated using (true);

drop policy if exists "reviews_insert_buyer" on public.reviews;
create policy "reviews_insert_buyer" on public.reviews
  for insert to authenticated with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o join public.order_items oi on oi.order_id = o.id
       where o.user_id = auth.uid() and oi.product_id = reviews.product_id and o.status <> 'cancelled'
    )
  );

drop policy if exists "reviews_delete" on public.reviews;
create policy "reviews_delete" on public.reviews
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

create or replace function public.reviews_set_name()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_full text;
begin
  select p.full_name into v_full from public.profiles p where p.id = new.user_id;
  if v_full is not null then
    new.reviewer_name := split_part(v_full, ' ', 1)
      || coalesce(' ' || left(nullif(split_part(v_full, ' ', 2), ''), 1) || '.', '');
  end if;
  return new;
end $$;
drop trigger if exists reviews_set_name on public.reviews;
create trigger reviews_set_name before insert on public.reviews
  for each row execute function public.reviews_set_name();

create or replace function public.refresh_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid bigint := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    rating = coalesce((select round(avg(r.rating)::numeric, 1) from public.reviews r where r.product_id = pid), 0),
    reviews_count = (select count(*) from public.reviews r where r.product_id = pid)
  where p.id = pid;
  return null;
end $$;
drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating after insert or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ---------- contact form & newsletter ----------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 100),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject    text not null check (char_length(subject) between 3 and 150),
  message    text not null check (char_length(message) between 10 and 2000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;

drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages
  for insert to anon, authenticated with check (true);
drop policy if exists "contact_admin_select" on public.contact_messages;
create policy "contact_admin_select" on public.contact_messages
  for select to authenticated using (public.is_admin());
drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contact_admin_delete" on public.contact_messages;
create policy "contact_admin_delete" on public.contact_messages
  for delete to authenticated using (public.is_admin());

-- server-side rate limit: max 3 messages / hour / email
create or replace function public.contact_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.contact_messages c
       where lower(c.email) = lower(new.email) and c.created_at > now() - interval '1 hour') >= 3 then
    raise exception 'RATE_LIMITED';
  end if;
  return new;
end $$;
drop trigger if exists contact_rate_limit on public.contact_messages;
create trigger contact_rate_limit before insert on public.contact_messages
  for each row execute function public.contact_rate_limit();

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_email_unique on public.newsletter_subscribers (lower(email));
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "newsletter_insert" on public.newsletter_subscribers;
create policy "newsletter_insert" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
drop policy if exists "newsletter_admin_select" on public.newsletter_subscribers;
create policy "newsletter_admin_select" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

-- ---------- storage: product images (admin upload, public read) --------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "product_images_read" on storage.objects;
create policy "product_images_read" on storage.objects
  for select using (bucket_id = 'product-images');
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());

-- =====================================================================
-- To make YOUR account an admin (after you have registered on the site):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');
-- =====================================================================
