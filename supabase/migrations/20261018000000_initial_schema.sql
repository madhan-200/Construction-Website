-- Construction E-commerce Marketplace
-- Migration: 20261018000000_initial_schema.sql
-- Description: Core schema, tables, constraints, indexes, and Row Level Security (RLS)

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. HELPER FUNCTION: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'ta')),
  phone_e164 text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- 4. USER PLATFORM ROLES
create table if not exists public.user_platform_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'support')),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- 5. CUSTOMER ADDRESSES
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone_e164 text,
  address_line1 text not null,
  address_line2 text,
  locality text,
  region text,
  postal_code text,
  country_code char(2) not null,
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_customer_addresses_updated_at
  before update on public.customer_addresses
  for each row execute function public.handle_updated_at();

-- 6. VENDORS TABLE
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  slug text unique not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'needs_information', 'rejected', 'suspended')),
  business_email text,
  business_phone_e164 text,
  country_code char(2) not null default 'IN',
  business_address jsonb not null default '{}'::jsonb,
  website_url text,
  registration_reference text,
  tax_reference text,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_vendors_updated_at
  before update on public.vendors
  for each row execute function public.handle_updated_at();

-- 7. VENDOR MEMBERS
create table if not exists public.vendor_members (
  vendor_id uuid references public.vendors(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  member_role text not null default 'owner' check (member_role in ('owner', 'manager', 'catalog_manager', 'fulfillment_manager')),
  status text not null default 'active' check (status in ('invited', 'active', 'revoked')),
  created_at timestamptz not null default now(),
  primary key (vendor_id, user_id)
);

-- 8. VENDOR APPLICATIONS
create table if not exists public.vendor_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'under_review', 'needs_information', 'approved', 'rejected', 'withdrawn')),
  submitted_payload jsonb not null,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_vendor_applications_updated_at
  before update on public.vendor_applications
  for each row execute function public.handle_updated_at();

-- 9. CATEGORIES
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  slug text unique not null,
  name_en text not null,
  name_ta text,
  description_en text,
  description_ta text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

-- 10. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('platform', 'vendor')),
  vendor_id uuid references public.vendors(id) on delete cascade,
  sku text not null,
  slug text unique not null,
  category_id uuid references public.categories(id) on delete set null,
  title_en text not null,
  title_ta text,
  description_en text,
  description_ta text,
  unit_code text not null default 'piece',
  currency_code char(3) not null default 'INR',
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  minimum_order_quantity numeric(14,3) not null default 1 check (minimum_order_quantity > 0),
  attributes jsonb not null default '{}'::jsonb,
  source_status text not null default 'draft' check (source_status in ('draft', 'pending_review', 'approved', 'rejected', 'unpublished')),
  availability_status text not null default 'available' check (availability_status in ('available', 'out_of_stock', 'discontinued')),
  is_active boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_platform_owner check (
    (owner_type = 'platform' and vendor_id is null) or
    (owner_type = 'vendor' and vendor_id is not null)
  )
);

create unique index if not exists uq_product_owner_sku on public.products(owner_type, coalesce(vendor_id, '00000000-0000-0000-0000-000000000000'::uuid), sku);

create trigger tr_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- 11. PRODUCT MEDIA
create table if not exists public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null unique,
  alt_en text,
  alt_ta text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- 12. INVENTORY
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  location_code text not null default 'DEFAULT',
  quantity_on_hand numeric(14,3) not null default 0 check (quantity_on_hand >= 0),
  quantity_reserved numeric(14,3) not null default 0 check (quantity_reserved >= 0),
  updated_at timestamptz not null default now(),
  unique (product_id, location_code),
  check (quantity_reserved <= quantity_on_hand)
);

-- 13. BULK PRICING TIERS
create table if not exists public.bulk_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  minimum_quantity numeric(14,3) not null check (minimum_quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  currency_code char(3) not null default 'INR',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. CARTS AND CART ITEMS
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'converted', 'abandoned')),
  currency_code char(3) not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric(14,3) not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

-- 15. QUOTE REQUESTS
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references auth.users(id) on delete cascade,
  reference_code text unique not null,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'under_review', 'quoted', 'accepted', 'declined', 'expired', 'cancelled', 'converted_to_order')),
  currency_code char(3) not null default 'INR',
  destination_address jsonb not null default '{}'::jsonb,
  required_by date,
  notes text,
  quoted_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_quote_requests_updated_at
  before update on public.quote_requests
  for each row execute function public.handle_updated_at();

-- 16. QUOTE REQUEST ITEMS
create table if not exists public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  assigned_vendor_id uuid references public.vendors(id) on delete set null,
  requested_title_snapshot text not null,
  requested_sku_snapshot text,
  unit_code text not null default 'piece',
  requested_quantity numeric(14,3) not null check (requested_quantity > 0),
  quoted_unit_price_minor bigint check (quoted_unit_price_minor >= 0),
  currency_code char(3) not null default 'INR',
  delivery_terms text,
  vendor_response_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 17. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  source_quote_id uuid references public.quote_requests(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'pending_payment', 'confirmed', 'processing', 'partially_fulfilled', 'fulfilled', 'cancelled', 'refunded')),
  currency_code char(3) not null default 'INR',
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  shipping_total_minor bigint not null default 0 check (shipping_total_minor >= 0),
  tax_total_minor bigint not null default 0 check (tax_total_minor >= 0),
  discount_total_minor bigint not null default 0 check (discount_total_minor >= 0),
  grand_total_minor bigint not null default 0 check (grand_total_minor >= 0),
  shipping_address_snapshot jsonb not null default '{}'::jsonb,
  commercial_terms_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- 18. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  product_title_snapshot text not null,
  sku_snapshot text,
  unit_code text not null default 'piece',
  quantity numeric(14,3) not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  line_subtotal_minor bigint not null check (line_subtotal_minor >= 0),
  currency_code char(3) not null default 'INR',
  commission_rate_snapshot numeric(7,4),
  commission_basis_snapshot text,
  created_at timestamptz not null default now()
);

-- 19. ORDER FULFILLMENTS
create table if not exists public.order_fulfillments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'ready_to_ship', 'shipped', 'in_transit', 'delivered', 'delivery_exception', 'cancelled', 'returned')),
  carrier_name text,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  platform_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tr_order_fulfillments_updated_at
  before update on public.order_fulfillments
  for each row execute function public.handle_updated_at();

-- 20. ORDER STATUS EVENTS
create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  fulfillment_id uuid references public.order_fulfillments(id) on delete set null,
  previous_status text,
  new_status text not null,
  actor_user_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('customer', 'vendor', 'admin', 'system')),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 21. COMMISSION RULES
create table if not exists public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rate_percent numeric(7,4) not null check (rate_percent >= 0 and rate_percent <= 100),
  calculation_basis text not null check (calculation_basis in ('subtotal', 'subtotal_plus_tax', 'grand_total')),
  currency_code char(3),
  country_code char(2),
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  is_active boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 22. AUDIT EVENTS
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  actor_type text not null check (actor_type in ('customer', 'vendor', 'admin', 'system')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 23. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.user_platform_roles enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_members enable row level security;
alter table public.vendor_applications enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.inventory enable row level security;
alter table public.bulk_pricing_tiers enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_fulfillments enable row level security;
alter table public.order_status_events enable row level security;
alter table public.commission_rules enable row level security;
alter table public.audit_events enable row level security;

-- 24. RLS POLICIES (Key Policies)
-- Public read on active categories
create policy "Public categories viewable by everyone"
  on public.categories for select
  using (is_active = true);

-- Public read on approved and active products
create policy "Approved active products viewable by everyone"
  on public.products for select
  using (
    source_status = 'approved' and
    is_active = true and
    availability_status <> 'discontinued'
  );

-- Profiles: users can select and update their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Customer Addresses: users can manage own addresses
create policy "Users can manage own addresses"
  on public.customer_addresses for all
  using (auth.uid() = user_id);

-- Quote requests: requester can view their own
create policy "Requesters can view own quotes"
  on public.quote_requests for select
  using (auth.uid() = requester_user_id);

-- Orders: customers can view own orders
create policy "Customers can view own orders"
  on public.orders for select
  using (auth.uid() = customer_user_id);

-- Indexes for performance
create index if not exists idx_products_cat_status on public.products(category_id, source_status, is_active);
create index if not exists idx_products_vendor on public.products(vendor_id, source_status);
create index if not exists idx_orders_customer on public.orders(customer_user_id, created_at desc);
create index if not exists idx_quotes_requester on public.quote_requests(requester_user_id, created_at desc);
create index if not exists idx_quote_items_vendor on public.quote_request_items(assigned_vendor_id);
