# Backend Schema
## Construction E-commerce Marketplace

**Version:** 1.0  
**Database:** Supabase Postgres  
**Brand:** TBD  
**Status:** Proposed logical schema; migrate only after review.

---

## 1. Schema Principles

- Use `auth.users` as the authentication identity source; do not duplicate passwords.
- Use UUID primary keys, `timestamptz` timestamps, foreign keys and explicit status constraints.
- Enable RLS on every exposed table and create least-privilege policies.
- Prefer normalized relational tables for ownership, pricing, orders and state transitions.
- Store money as integer minor units plus ISO currency code. Do not use floating-point values.
- Global market means currency, country, address, tax and shipping assumptions must be configurable.
- Keep an order's historical product/commercial snapshot even if a product is later edited or deleted.
- Never accept user-provided totals, role values, approval states or commission values as authoritative.
- The SQL implementation must be reviewed and tested before use in production.

## 2. Core Tables

### `profiles`
Purpose: public/basic application profile linked to Supabase Auth.

Suggested columns:
- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `preferred_locale text not null default 'en' check in ('en','ta')`
- `phone_e164 text null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access:
- User can read/update allowed fields of own profile.
- Admin access is limited to operational need.
- Users cannot update privileged role or verification fields through this table.

### `user_platform_roles`
Purpose: protected platform-level roles.

Columns:
- `user_id uuid references auth.users(id) on delete cascade`
- `role text check in ('admin','support')`
- `granted_by uuid references auth.users(id)`
- `granted_at timestamptz not null default now()`
- `primary key (user_id, role)`

Access:
- No self-assignment.
- Writes restricted to a trusted admin workflow or controlled migration/seed.
- Avoid putting a user-editable `is_admin` boolean in `profiles`.

### `customer_addresses`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id)`
- `label text`
- `recipient_name text not null`
- `phone_e164 text`
- `address_line1 text not null`
- `address_line2 text`
- `locality text`
- `region text`
- `postal_code text`
- `country_code char(2) not null`
- `delivery_instructions text`
- `is_default boolean not null default false`
- `created_at`, `updated_at`

RLS: owner can CRUD own addresses; admin only as operationally authorized. Order records must snapshot the address at purchase time.

### `vendors`
Purpose: vendor organization and selling status.

Columns:
- `id uuid primary key default gen_random_uuid()`
- `legal_name text not null`
- `display_name text not null`
- `slug text unique`
- `status text check in ('pending','approved','needs_information','rejected','suspended')`
- `business_email text`
- `business_phone_e164 text`
- `country_code char(2)`
- `business_address jsonb` (validated structured address, not arbitrary executable content)
- `website_url text`
- `registration_reference text null`
- `tax_reference text null`
- `reviewed_by uuid references auth.users(id)`
- `reviewed_at timestamptz`
- `review_reason text`
- `created_at`, `updated_at`

Sensitive registration/tax references must have narrowly scoped access and retention rules.

### `vendor_members`
Purpose: map users to vendor organizations.

Columns:
- `vendor_id uuid references vendors(id) on delete cascade`
- `user_id uuid references auth.users(id) on delete cascade`
- `member_role text check in ('owner','manager','catalog_manager','fulfillment_manager')`
- `status text check in ('invited','active','revoked')`
- `created_at timestamptz not null default now()`
- `primary key (vendor_id, user_id)`

RLS: a user sees only membership records they belong to, and only scoped vendor data for active membership. Membership writes require an authorized owner/admin workflow. For MVP, a single vendor owner is sufficient if multi-user vendor management is not approved.

### `vendor_applications`
Purpose: application submission and review history.

Columns:
- `id uuid primary key default gen_random_uuid()`
- `applicant_user_id uuid not null references auth.users(id)`
- `vendor_id uuid references vendors(id)`
- `status text check in ('draft','submitted','under_review','needs_information','approved','rejected','withdrawn')`
- `submitted_payload jsonb not null` (validate against a versioned schema)
- `reviewed_by uuid references auth.users(id)`
- `reviewed_at timestamptz`
- `review_reason text`
- `created_at`, `updated_at`

Access: applicant can view their own application; admin can review all. Private documents should live in a private Storage bucket with scoped policies, not inline binary data.

### `categories`
- `id uuid primary key default gen_random_uuid()`
- `parent_id uuid references categories(id)`
- `slug text unique not null`
- `name_en text not null`
- `name_ta text`
- `description_en text`
- `description_ta text`
- `sort_order integer not null default 0`
- `is_active boolean not null default true`
- `created_at`, `updated_at`

Writes restricted to admin. Public reads only active categories.

### `products`
Purpose: common catalog for first-party and vendor products.

Columns:
- `id uuid primary key default gen_random_uuid()`
- `owner_type text not null check in ('platform','vendor')`
- `vendor_id uuid references vendors(id)`
- `sku text not null`
- `slug text unique not null`
- `category_id uuid references categories(id)`
- `title_en text not null`
- `title_ta text`
- `description_en text`
- `description_ta text`
- `unit_code text not null`
- `currency_code char(3) not null`
- `unit_price_minor bigint not null check (unit_price_minor >= 0)`
- `minimum_order_quantity numeric(14,3) not null default 1 check (minimum_order_quantity > 0)`
- `attributes jsonb not null default '{}'::jsonb`
- `source_status text check in ('draft','pending_review','approved','rejected','unpublished')`
- `availability_status text check in ('available','out_of_stock','discontinued')`
- `is_active boolean not null default false`
- `approved_by uuid references auth.users(id)`
- `approved_at timestamptz`
- `rejection_reason text`
- `created_at`, `updated_at`

Constraints:
- `owner_type='platform'` requires `vendor_id is null`.
- `owner_type='vendor'` requires a valid `vendor_id`.
- SKU uniqueness must be defined explicitly. Recommended: unique `(owner_type, vendor_id, sku)` with a separate platform SKU constraint or normalized owner key.
- Public catalog requires `source_status='approved'`, `is_active=true`, `availability_status <> 'discontinued'`, and approved vendor status for vendor-owned products.
- Vendor cannot modify platform products or other vendors' products.

### `product_media`
- `id uuid primary key default gen_random_uuid()`
- `product_id uuid not null references products(id) on delete cascade`
- `storage_path text not null unique`
- `alt_en text`
- `alt_ta text`
- `sort_order integer not null default 0`
- `is_primary boolean not null default false`
- `created_at timestamptz not null default now()`

Media access follows product ownership and moderation rules. Validate MIME type, extension, file size and ownership.

### `inventory`
Purpose: quantity available per product and stock location.

Columns:
- `id uuid primary key default gen_random_uuid()`
- `product_id uuid not null references products(id)`
- `location_code text not null`
- `quantity_on_hand numeric(14,3) not null default 0 check (quantity_on_hand >= 0)`
- `quantity_reserved numeric(14,3) not null default 0 check (quantity_reserved >= 0)`
- `updated_at timestamptz not null default now()`
- unique `(product_id, location_code)`
- check `quantity_reserved <= quantity_on_hand`

Available quantity is derived as `quantity_on_hand - quantity_reserved`; updates must be atomic. For a vendor marketplace, the platform may record vendor-provided inventory while making the data source clear. Do not imply real-time stock accuracy unless verified.

### `bulk_pricing_tiers`
- `id uuid primary key default gen_random_uuid()`
- `product_id uuid not null references products(id) on delete cascade`
- `minimum_quantity numeric(14,3) not null check (minimum_quantity > 0)`
- `unit_price_minor bigint not null check (unit_price_minor >= 0)`
- `currency_code char(3) not null`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `is_active boolean not null default true`
- `created_at`, `updated_at`

Enforce no overlapping active tiers for the same product/currency where feasible. The server selects the valid tier; browser calculations are informational only.

### `carts` and `cart_items` (optional MVP)
`carts`:
- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `status text check in ('active','converted','abandoned')`
- `currency_code char(3)`
- `created_at`, `updated_at`

`cart_items`:
- `id uuid primary key`
- `cart_id uuid references carts(id) on delete cascade`
- `product_id uuid references products(id)`
- `quantity numeric(14,3) not null check (quantity > 0)`
- `created_at`, `updated_at`
- unique `(cart_id, product_id)`

Never store cart price as authoritative. If cached, mark it as a display-only snapshot and revalidate on checkout.

### `quote_requests`
- `id uuid primary key default gen_random_uuid()`
- `requester_user_id uuid not null references auth.users(id)`
- `reference_code text unique not null`
- `status text check in ('draft','submitted','under_review','quoted','accepted','declined','expired','cancelled','converted_to_order')`
- `currency_code char(3)`
- `destination_address jsonb not null`
- `required_by date`
- `notes text`
- `quoted_at timestamptz`
- `expires_at timestamptz`
- `accepted_at timestamptz`
- `created_at`, `updated_at`

RLS: requester sees own requests; admins see all; vendor access is limited to assigned quote lines. Quote status changes must be validated server-side.

### `quote_request_items`
- `id uuid primary key default gen_random_uuid()`
- `quote_request_id uuid not null references quote_requests(id) on delete cascade`
- `product_id uuid references products(id)`
- `assigned_vendor_id uuid references vendors(id)`
- `requested_title_snapshot text not null`
- `requested_sku_snapshot text`
- `unit_code text not null`
- `requested_quantity numeric(14,3) not null check (requested_quantity > 0)`
- `quoted_unit_price_minor bigint check (quoted_unit_price_minor >= 0)`
- `currency_code char(3)`
- `delivery_terms text`
- `vendor_response_notes text`
- `created_at`, `updated_at`

Vendor policies restrict access to lines assigned to their own vendor; do not expose other lines or other vendors' prices.

### `orders`
- `id uuid primary key default gen_random_uuid()`
- `order_number text unique not null`
- `customer_user_id uuid not null references auth.users(id)`
- `source_quote_id uuid references quote_requests(id)`
- `status text check in ('draft','pending_payment','confirmed','processing','partially_fulfilled','fulfilled','cancelled','refunded')`
- `currency_code char(3) not null`
- `subtotal_minor bigint not null check (subtotal_minor >= 0)`
- `shipping_total_minor bigint check (shipping_total_minor >= 0)`
- `tax_total_minor bigint check (tax_total_minor >= 0)`
- `discount_total_minor bigint not null default 0 check (discount_total_minor >= 0)`
- `grand_total_minor bigint not null check (grand_total_minor >= 0)`
- `shipping_address_snapshot jsonb not null`
- `commercial_terms_snapshot jsonb not null default '{}'::jsonb`
- `created_at`, `updated_at`

No live checkout until the payment/order acceptance policy is approved. Totals are computed server-side and persisted with the transaction.

### `order_items`
- `id uuid primary key default gen_random_uuid()`
- `order_id uuid not null references orders(id)`
- `product_id uuid references products(id)`
- `vendor_id uuid references vendors(id)`
- `product_title_snapshot text not null`
- `sku_snapshot text`
- `unit_code text not null`
- `quantity numeric(14,3) not null check (quantity > 0)`
- `unit_price_minor bigint not null check (unit_price_minor >= 0)`
- `line_subtotal_minor bigint not null check (line_subtotal_minor >= 0)`
- `currency_code char(3) not null`
- `commission_rate_snapshot numeric(7,4)` nullable until approved
- `commission_basis_snapshot text`
- `created_at timestamptz not null default now()`

Snapshot the product title, SKU, unit, quantity, price and relevant commercial terms so order history remains stable.

### `order_fulfillments`
- `id uuid primary key default gen_random_uuid()`
- `order_id uuid not null references orders(id)`
- `vendor_id uuid references vendors(id)`
- `status text check in ('pending','ready_to_ship','shipped','in_transit','delivered','delivery_exception','cancelled','returned')`
- `carrier_name text`
- `tracking_number text`
- `tracking_url text`
- `shipped_at timestamptz`
- `delivered_at timestamptz`
- `platform_notes text`
- `created_at`, `updated_at`

Platform admins manage overall fulfillment. Vendor access is restricted to their assigned fulfillment group and necessary order-line information. Tracking URLs must be validated.

### `order_status_events`
- `id uuid primary key default gen_random_uuid()`
- `order_id uuid not null references orders(id)`
- `fulfillment_id uuid references order_fulfillments(id)`
- `previous_status text`
- `new_status text not null`
- `actor_user_id uuid references auth.users(id)`
- `actor_type text check in ('customer','vendor','admin','system')`
- `reason text`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Append-only for application users; only trusted server operations can insert. Do not permit ordinary users to rewrite history.

### `commission_rules`
- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `rate_percent numeric(7,4) not null check (rate_percent >= 0 and rate_percent <= 100)`
- `calculation_basis text not null` — value must be chosen from an approved vocabulary.
- `currency_code char(3)` nullable for market-specific rules.
- `country_code char(2)` nullable for market-specific rules.
- `effective_from timestamptz not null`
- `effective_to timestamptz`
- `is_active boolean not null default false`
- `created_by uuid references auth.users(id)`
- `created_at`, `updated_at`

Do not seed an assumed commission rate or activate a rule until the owner approves the rate and basis.

### `audit_events`
- `id uuid primary key default gen_random_uuid()`
- `actor_user_id uuid references auth.users(id)`
- `actor_type text check in ('customer','vendor','admin','system')`
- `action text not null`
- `entity_type text not null`
- `entity_id uuid`
- `reason text`
- `request_id text`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Append-only, access restricted. Do not log passwords, access tokens, full payment data, or unnecessary personal information.

## 3. Future / Deferred Tables

Do not create unless a reviewed requirement needs them:
- `payments` and `payment_events` — provider not selected.
- `refunds` — refund policy/provider not selected.
- `vendor_payouts` and settlement ledger — settlement model not selected.
- `shipping_rate_quotes` — shipping provider/rate model not selected.
- `reviews` — moderation and anti-fraud policy needed.
- `notifications` — notification provider and retention policy needed.
- `wishlists` — optional enhancement.

## 4. RLS Policy Matrix

| Resource | Guest | Customer | Vendor | Admin |
|---|---|---|---|---|
| Public approved products/categories | Read | Read | Read | Full authorized control |
| Own profile/addresses | None | Own records | Own records | Limited operational access |
| Vendor application | None | Own application | Own application/status | Review all |
| Vendor records/memberships | Public profile only | Public profile only | Own authorized vendor | Authorized full access |
| Product draft/pending | None | None | Own vendor's products | Review/manage |
| Quote requests | None by default | Own requests | Assigned quote lines only | All |
| Orders/order items | None | Own orders | Assigned fulfillment scope only | All authorized |
| Audit events | None | None | No general access | Authorized read; trusted inserts |
| Commission rules | None | None | Read only if policy permits | Manage |
| Roles | None | No self-write | No self-write | Controlled assignment |

This is a logical matrix, not deployable SQL. Exact policies must be implemented and tested per table, including joins and Storage objects.

## 5. Storage Buckets

Recommended:
- `product-media`: public read only for approved product assets, or signed/controlled access if required. Upload/write paths scoped to product owner and review state.
- `vendor-documents`: private; applicant and authorized admin only.
- `avatars`: optional, with strict file type and size restrictions.

Never allow a client to choose arbitrary storage paths that can overwrite another user's files. Validate file metadata server-side and apply policies to `storage.objects`.

## 6. Required Constraints, Indexes and Functions

Indexes:
- `products(category_id, source_status, is_active)`
- `products(vendor_id, source_status)`
- normalized/search indexes for title, SKU and descriptions
- `orders(customer_user_id, created_at desc)`
- `quote_requests(requester_user_id, created_at desc)`
- `quote_request_items(assigned_vendor_id)`
- `order_fulfillments(vendor_id, status)`
- foreign keys and status-queue columns

Trusted database functions/services should handle:
- atomic inventory reservation and order creation;
- quote acceptance/conversion;
- authorized status transitions;
- audit event creation;
- commission snapshot calculation only after rule approval.

Do not expose privileged functions to `anon` or `authenticated` without strict permission checks. Use transactions and idempotency for retryable workflows.

## 7. Data Lifecycle and Privacy

- Define retention periods for vendor documents, quote requests, orders and audit events before launch.
- Support account closure/deactivation without breaking legally required order records.
- Avoid copying unnecessary PII into logs or analytics.
- Restrict business/tax identifiers to users with an operational need.
- Define export/delete request handling according to applicable jurisdictions.
- Have legal counsel review global privacy and consumer obligations before production.

## 8. Schema Acceptance Criteria

- Every exposed table has RLS enabled and tested.
- A customer cannot read another customer's addresses, quotes or orders.
- A vendor cannot access another vendor's products, assigned quote lines or fulfillment data.
- No user can self-assign admin role or approve their own vendor application.
- Platform products cannot be changed by vendors.
- Public catalog queries exclude unapproved/unpublished products.
- Inventory reservation and quote conversion are transaction-safe and idempotent.
- Monetary fields use integer minor units and explicit currency codes.
- Historical order data is preserved via snapshots.
- Audit records cannot be modified by normal users.
- Storage access mirrors database ownership and moderation rules.
