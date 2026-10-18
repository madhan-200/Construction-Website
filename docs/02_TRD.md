# Technical Requirements Document (TRD)
## Construction E-commerce Marketplace

**Version:** 1.0  
**Status:** Proposed architecture  
**Brand:** TBD  
**Rule:** Do not implement the application yet. Use this document as the technical contract after approval.

---

## 1. Recommended Stack

- **Web framework:** Next.js App Router with React and TypeScript.
- **UI:** Tailwind CSS, accessible component primitives, and the required `Leonxlnx/taste-skill` (`design-taste-frontend`) skill.
- **Backend/data:** Supabase Postgres, Supabase Auth, Supabase Storage, Row Level Security (RLS).
- **Hosting:** Vercel for the Next.js application; Supabase for database/auth/storage.
- **Testing:** TypeScript type-checking, linting, unit tests, integration tests against a safe test project, and end-to-end tests.
- **Payments:** Not selected; defer provider-specific implementation.
- **Shipping/carrier:** Platform-managed process; provider not selected. Manual tracking first is acceptable after approval.
- **Email/SMS:** Provider TBD; do not invent credentials or assume an installed provider.
- **Monitoring:** Structured server logs and deployment/platform monitoring, with secret and personal-data redaction.

Next.js is a React framework: use React components written in TSX within the Next.js application. Do not treat “React” and “Next.js” as mutually exclusive choices.

## 2. Architecture Overview

```text
Browser (English / Tamil)
    |
    v
Next.js App Router
  - Public storefront
  - Authenticated customer area
  - Vendor workspace
  - Admin console
  - Server Actions / Route Handlers
    |
    | Authenticated requests; server-side validation
    v
Supabase
  - Auth
  - Postgres + RLS
  - Storage buckets + storage policies
    |
    v
Trusted server-side business services
  - Catalog validation
  - Price and inventory validation
  - Quote workflow
  - Order and fulfillment state transitions
  - Commission calculation (only after rule approval)
  - Audit logging
```

Third-party integrations are intentionally abstracted until selected:
- Payment adapter: deferred.
- Shipping/carrier adapter: TBD.
- Notifications adapter: TBD.

## 3. Application Structure

Proposed route groups:
- `app/(store)/...` — public catalog and product pages.
- `app/(auth)/...` — sign-in, registration, password recovery.
- `app/account/...` — customer profile, addresses, quotes, orders.
- `app/vendor/...` — approved vendor workspace.
- `app/admin/...` — protected administrative workspace.
- `app/api/...` — only required server endpoints/webhooks; keep narrow.
- `lib/auth/` — session, authorization and role checks.
- `lib/db/` — typed database access and query helpers.
- `lib/validation/` — shared schemas for inputs.
- `lib/services/` — catalog, quote, order, inventory and fulfillment business logic.
- `lib/i18n/` — English/Tamil dictionaries and locale utilities.
- `lib/config/` — validated server-only environment configuration.
- `supabase/migrations/` — version-controlled SQL migrations.
- `supabase/tests/` — database policy and workflow tests where supported.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — automated tests.

Keep components presentational where possible. Business rules must live in trusted server-side code and/or database constraints/functions, not only in browser components.

## 4. Authentication and Authorization

- Use Supabase Auth; never build a custom password store.
- Verify sessions on the server for protected pages and mutations.
- Use explicit authorization helpers such as `requireUser`, `requireAdmin`, `requireApprovedVendor`, and organization-scoped membership checks.
- Store vendor membership and administrative role assignments in protected database tables.
- A user must not be able to elevate privileges by changing a profile field or submitting a role value.
- RLS policies must independently enforce access for direct API calls.
- Admin-only operations should be implemented server-side with an explicit admin authorization check and auditable reason.
- Service-role key is server-only and must never appear in client bundles, public environment variables, browser logs, or Git.
- Prefer least privilege and narrow server endpoints.

## 5. Database and Data Integrity

- Use migrations as the source of truth; do not make undocumented production dashboard edits.
- Use UUID primary keys and foreign keys for relational integrity.
- Use `timestamptz` for timestamps and UTC storage.
- Store money in integer minor units (e.g. cents/paise) with an ISO currency code; do not use floating-point arithmetic for monetary values.
- Because the market is global, store currency per product/quote/order where needed. Do not assume all products use INR.
- Define the initial unit-of-measure vocabulary (piece, bag, kg, tonne, metre, cubic metre, litre, etc.) and permit category-specific values.
- Use check constraints for quantities, prices, statuses and percentage bounds.
- Use transactions or database functions for order creation, stock reservation and quote-to-order conversion.
- Use idempotency keys for retryable operations and future payment webhooks.
- Snapshot buyer, product and commercial terms where historical records must remain accurate.
- Add indexes for foreign keys and frequent filters; validate with query plans when data grows.

## 6. Catalog, Search and Media

- Public catalog queries must filter to `approved/published/active` records.
- Product ownership must be explicit: platform-owned or vendor-owned. A vendor ID is required only for vendor-owned items.
- Use category-specific product attributes in a validated structured format, with a clear schema strategy; do not treat arbitrary JSON as trusted executable input.
- Store images in private/publicly readable buckets according to content type; use server-side authorization for uploads and safe content type/size limits.
- Validate image type, size, ownership and upload path. Prevent one vendor from overwriting another vendor's media.
- Product moderation state must be separate from stock state.
- Search can start with Postgres full-text/trigram capabilities; an external search provider is optional later.
- Escape or safely render product content to avoid stored XSS.

## 7. Cart, Orders and Inventory

- Browser-submitted price/tax/commission/shipping totals are untrusted.
- Re-fetch product price, status and stock from the database before order creation.
- Reject disabled products, insufficient inventory, invalid quantities, stale quotes, or invalid currency combinations.
- Use an atomic transaction for stock checks/reservations and order creation to reduce overselling.
- Design for mixed-source orders. Keep an order header, immutable order-item snapshots, and separate fulfillment groups.
- Do not mark an order as paid while payment is deferred.
- Define an explicit pre-payment order policy before production checkout is enabled.
- Use constrained state transitions. For example, an order should not move directly from `draft` to `delivered` without authorized intermediate transitions.
- Maintain status history with actor, timestamp, previous state, new state and reason.

## 8. Quote and Commission Logic

### Quotes
- Validate each quote line against product status, minimum order quantity, unit, and available metadata.
- Quotes need explicit currency, expiry, line pricing, delivery assumptions, status, and revision history.
- Acceptance must verify the quote remains valid and cannot be accepted twice.
- Conversion should be transactional and idempotent.
- A vendor should see only quote lines assigned to that vendor, plus necessary context.

### Commission
- Commission is percentage-based, but the rate and calculation basis are not approved.
- Create configurable rules with `rate_basis_points` or a fixed-precision decimal, effective date range, currency/market scope where required, and active status.
- Validate percentage range at the database/service layer.
- Record a snapshot of the rule applied to a transaction.
- Do not calculate final vendor payable or run payouts until the payment, refund and settlement policy is approved.

## 9. Shipping and Fulfillment

- Platform owns customer-facing shipping coordination.
- Model fulfillment separately from the order to support split shipments.
- Track carrier, tracking number, shipment status, shipped/delivered timestamps, and admin/vendor notes with appropriate access controls.
- Carrier API and live shipping-rate integrations are deferred.
- Do not show a fabricated tracking number, delivery estimate, or shipping fee.
- Vendor-facing fulfillment actions must be limited to the vendor's assigned products/fulfillment group; platform admins retain oversight.

## 10. Localization

- Use route or preference-based locale resolution, with English as the default and Tamil as the second supported locale.
- Keep UI strings in translation dictionaries, not scattered hardcoded text.
- Use locale-aware formatting for dates, numbers and currency.
- Do not translate identifiers, SKU values, legal names, or user-generated product content automatically without a clear policy.
- Ensure translated labels fit responsive layouts and accessible controls.
- Provide fallback behavior for missing translations and track untranslated strings.

## 11. Environment Variables

Create `.env.example` with placeholder names only. Never commit real secrets.

Expected categories:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or publishable key supported by the selected Supabase setup)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never `NEXT_PUBLIC_`)
- `NEXT_PUBLIC_APP_URL`
- Optional future payment secrets — not added until a provider is chosen.
- Optional future shipping and notification credentials — not added until selected.

Validate required variables at server startup. Document local, preview, and production values separately. Never place real secrets in project docs, prompts, screenshots or source control.

## 12. Security Requirements

- RLS enabled on all tables exposed through Supabase APIs.
- RLS deny-by-default and role/ownership-scoped.
- Storage bucket policies mirror the database ownership model.
- Server-side validation for all mutations using a schema validator.
- Rate-limit sign-in-sensitive endpoints, quote submission, vendor applications and expensive search requests.
- Apply safe error messages to clients; detailed logs remain server-side and redact sensitive values.
- Keep audit logs for admin/vendor access and state-changing operations.
- Use secure HTTP-only cookies/session patterns supported by the official Supabase SSR integration.
- Avoid open redirects and unsafe HTML injection.
- Validate webhooks cryptographically and idempotently if integrations are later added.
- No payment card data is stored by this application.
- Add dependency scanning and secret scanning to the workflow where feasible.

## 13. Testing Requirements

- Unit: currency/price arithmetic, quantity validation, commission rule validation, quote expiry, state transitions, localization fallbacks.
- Integration: RLS policies, vendor ownership boundaries, customer order isolation, admin permissions, inventory transaction behavior.
- E2E: guest browsing, registration, vendor application, admin approval, product moderation, quote request and admin handling, English/Tamil switching.
- Security regression tests: forged role, IDOR attempts, direct API access, cross-vendor access, mass assignment, malformed uploads, duplicate quote acceptance.
- Test with a dedicated Supabase test project and synthetic data. Never run destructive tests against production.

## 14. Deployment and Operations

- Use separate development, preview/staging, and production environments.
- Apply database migrations through a reviewed process.
- Protect preview deployments and test data.
- Configure domain, HTTPS, access controls, logging and error monitoring only after the owner confirms brand/domain.
- Create a backup and recovery procedure appropriate to the chosen Supabase plan.
- Document rollback procedures for app and database migrations.
- Add a release checklist covering RLS, environment variables, smoke tests, legal pages, payment disabled status and open decisions.

## 15. Technical Acceptance Gate

Implementation may proceed only when:
- This TRD and the PRD are reviewed and approved.
- `taste-skill` is installed/read and the resulting design decisions are captured.
- Supabase project/environment strategy is approved.
- RLS policies and schema are reviewed before any production data is used.
- Payment and order-acceptance policy is explicit before live checkout.
- Brand, legal, global market, shipping, commission and localization open decisions are tracked.
