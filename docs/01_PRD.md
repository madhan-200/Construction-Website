# Product Requirements Document (PRD)
## Construction E-commerce Marketplace

**Status:** Draft for implementation planning  
**Version:** 1.0  
**Product brand:** TBD  
**Market:** Global  
**Languages:** English and Tamil  
**Implementation status:** Documentation only — do not build the application until the owner approves this specification.

---

## 1. Product Summary

Build a secure, responsive construction-commerce marketplace that combines:

1. **First-party commerce:** The platform sells construction products it owns or directly manages.
2. **Third-party marketplace:** Approved vendors can list and sell their own construction products through the same storefront.
3. **Bulk purchasing:** Buyers can request quotations for large quantities or negotiated orders.
4. **Platform-managed shipping:** The platform coordinates fulfillment and shipping for orders from both first-party and third-party catalog items.

The experience should help construction businesses, contractors, builders, procurement teams, tradespeople, and individual buyers discover suitable products, compare options, order materials, and request bulk pricing.

The brand name is intentionally **TBD**. Do not invent a final brand identity, domain, logo, or legal business name.

## 2. Product Goals

- Make construction products easy to discover and purchase.
- Support first-party products and vendor-owned products in one catalog.
- Allow admins to review and approve vendors before they can sell.
- Maintain trustworthy product, price, stock, order, and fulfillment records.
- Support bulk orders and quote requests without forcing buyers through standard checkout.
- Provide clear order status and fulfillment visibility.
- Support English and Tamil UI content, with English as the initial default.
- Protect customer and vendor information through server-side authorization and Supabase Row Level Security (RLS).
- Create a maintainable foundation for global expansion without hardcoding one country, currency, tax regime, or shipping provider.

## 3. Non-goals for Initial Release

Unless explicitly approved later, do not implement these as launch requirements:
- A specific payment provider or live payment processing. **Payment integration is deferred.**
- Automated vendor self-approval.
- A fixed global currency, tax rate, commission percentage, or shipping tariff.
- Multi-warehouse optimization or advanced logistics routing.
- Native mobile applications.
- Public vendor-to-customer direct messaging.
- AI-generated product claims or automated legal/tax decisions.
- A final brand identity or production domain.
- Automated international tax calculation before jurisdictional requirements are agreed.

## 4. Users and Roles

### Guest
- Browse and search public, approved, active products.
- View product detail pages, category pages, and vendor storefront details that are marked public.
- Begin sign-up or sign-in.
- Submit a quote request only if the product owner approves a guest quote flow; otherwise sign in first.

### Customer / Buyer
- Manage own profile and addresses.
- Add available products to cart.
- Request a quote for bulk quantities or negotiated requirements.
- Place orders only when the payment/checkout policy has been approved and enabled.
- View only their own orders, quote requests, and order updates.
- Cancel or request changes only where allowed by order state and policy.

### Vendor Applicant
- Register or sign in, submit a vendor application, provide required business information, and track review status.
- Cannot publish products, manage fulfillment, or access another vendor's information before approval.

### Approved Vendor
- Manage only the vendor organization(s) they are authorized to represent.
- Create and edit product listings, submit products for review, and manage stock where permitted.
- View only their own vendor-scoped orders/fulfillment tasks and relevant buyer/order data needed to fulfill them.
- Cannot approve their own vendor account or products, alter platform commission settings, or change protected order/payment state.

### Admin
- Review vendor applications and approve/reject/suspend vendors.
- Review and approve, reject, or unpublish product listings.
- Manage categories, first-party catalog records, global configuration, quote requests, order exceptions, vendor fulfillment, and operational status.
- Configure percentage commission and supported currencies/tax/shipping rules after business decisions are confirmed.
- Access audit events and administrative tools according to least privilege.

### System / Service
- Performs trusted server-side operations such as order total calculation, inventory reservation, status transition validation, webhook handling when payments are introduced, and audit logging.
- Service credentials must never be exposed to browsers.

## 5. Core User Journeys

1. Browse → search/filter → product details → add to cart → checkout disabled or staged until payment policy is approved.
2. Browse product → enter quantity → request bulk quotation → receive status updates → admin/vendor prepares quote → buyer accepts quote → order is created under an approved checkout policy.
3. Vendor application → pending review → admin approval → vendor workspace enabled → create listing → product moderation → listing becomes public.
4. Admin manages catalog, vendor approvals, quotes, orders, fulfillment, and marketplace settings.
5. Customer places an order after checkout is enabled → order is recorded → platform coordinates shipping → buyer sees fulfillment updates.

## 6. Functional Requirements

### 6.1 Storefront and catalog
- Public pages: home, category listing, search results, product detail, vendor storefront, about/help/legal placeholders.
- Search should support product name, SKU, brand/manufacturer, category, and relevant descriptive terms.
- Filters should be data-driven: category, price range, availability, specifications, vendor, and other attributes that exist for the selected category.
- Product pages show images, description, specifications, unit of measure, available stock/availability, price, vendor/source, bulk-quote action, and shipping information where known.
- Clearly distinguish platform-owned products from third-party vendor products.
- Only approved, published, active products are publicly discoverable.
- Avoid fabricated certification, compliance, performance, or safety claims. Store and display such claims only when supported by vendor/admin-approved evidence.

### 6.2 Product and inventory
- Products can be owned by the platform or by an approved vendor.
- Each product has a unique SKU within the agreed uniqueness scope, title, category, description, unit of measure, media, price, status, and ownership.
- Quantity and stock validation must happen server-side.
- Price and inventory must be revalidated before order creation.
- Vendors cannot change products owned by the platform or another vendor.
- Product edits that materially affect buyer-facing information may require reapproval.

### 6.3 Vendor onboarding and moderation
- Vendor registration/application requires admin approval before selling.
- Application fields must be configurable and jurisdiction-aware (e.g. business name, contact details, business address, business registration/tax identifiers where applicable).
- Collect only data needed for marketplace operation and compliance.
- Admin decisions must record actor, timestamp, decision, and reason.
- Suspension must block new listings and selling actions while preserving historical order records.
- Vendor product listings require moderation before publication unless an admin explicitly configures a trusted-vendor policy.

### 6.4 Cart and checkout
- Cart is associated with the authenticated buyer or a clearly specified guest-cart strategy.
- The server recalculates all totals from trusted product and pricing data; never trust browser-submitted prices, discounts, taxes, commissions, or totals.
- Mixed carts may contain first-party and multiple-vendor products.
- Order creation must preserve order-item snapshots of product title, SKU, unit, unit price, quantity, and applicable commercial terms at purchase time.
- **Payment is deferred.** Until payment design is approved, checkout must be feature-flagged/disabled or run only in an explicitly labelled non-production test mode. Do not collect card details or claim that a real payment has been made.
- No live order should be accepted without a clear payment/credit/manual-invoice policy approved by the owner.

### 6.5 Bulk quotation
- Buyers can submit a quote request for one or more products, quantities, destination, preferred delivery window, and notes.
- Validate quantities and required fields on the server.
- Quote status should include at minimum: draft, submitted, under_review, quoted, accepted, declined, expired, cancelled, converted_to_order.
- Quoted price, currency, validity date, quantities, and delivery assumptions must be stored explicitly.
- A quote is not an order until the buyer accepts it and the system creates an order through an approved commercial workflow.
- Admin may route quote lines to the platform team or relevant vendor(s). Vendors see only the quote information required for their own assigned lines.
- Quote acceptance must revalidate quote expiry, quantity, product availability, and commercial terms.

### 6.6 Shipping and fulfillment
- Shipping is **platform-managed**. The platform is the coordinator of shipment planning and customer-facing status.
- Keep shipping provider, tracking integration, rate calculation, delivery promise, and international service coverage configurable; do not assume a provider.
- A single order may require multiple fulfillment groups due to product source, vendor, stock location, or shipment split.
- Track order-level status separately from fulfillment/shipment-level status.
- Support manual tracking updates in the initial release; carrier API integration is a later decision.
- Shipping charges and delivery estimates must be presented as unknown/not configured rather than invented.

### 6.7 Commission and vendor settlement
- Commission model: **percentage-based**.
- The percentage value, basis (e.g. item subtotal vs. tax/shipping-inclusive amount), rounding rule, refund treatment, and settlement cadence are **not yet decided**.
- Store commission rules as effective-dated, configurable settings. Do not hardcode an assumed percentage.
- Record the applied commission rule/value as a transaction snapshot once the commercial model is approved.
- Do not enable vendor payouts or represent settlement as complete until payment, refund, reconciliation, and payout policies are specified.

### 6.8 Localization
- English and Tamil are supported languages.
- English is the initial default.
- Use translation keys and locale-aware formatting rather than hardcoded text throughout UI components.
- Product descriptions may be provided in one or both languages; define a fallback policy and show a sensible fallback when translation is unavailable.
- Currency, dates, numbers, addresses, units, and tax labels must be locale-aware.
- Do not assume Tamil is the only regional language or that the global market has a single legal/tax model.

### 6.9 Admin and operations
- Admin dashboard should show pending vendor applications, product moderation queue, quote queue, orders needing attention, and operational configuration status.
- Admin actions that affect access, prices, order status, vendor approval, or quotes must be audited.
- Provide safe empty states, loading states, validation errors, and recovery messaging.
- High-impact actions require confirmation and reason where appropriate.

## 7. Non-functional Requirements

### Security and privacy
- Use Supabase Auth for identity and RLS for data access.
- Enable RLS on every table exposed through Supabase APIs.
- Enforce authorization on the server and database; hiding buttons in the UI is not authorization.
- Store role/membership assignments in protected tables; users must not be able to grant themselves admin/vendor privileges.
- Keep Supabase service-role credentials in server-only secrets.
- Validate and sanitize user input; rate-limit sensitive endpoints and quote/application submissions.
- Keep audit trails for privileged actions.
- Minimize collection and retention of personal and business data.
- Use secure session handling, safe redirects, and appropriate CSRF/origin protections for server actions and webhooks.

### Reliability and performance
- Use pagination for catalog, orders, and admin queues.
- Add indexes for common filters and foreign keys.
- Avoid N+1 queries and unbounded reads.
- Use optimistic UI only where failure can be safely reconciled.
- Handle duplicate submissions and concurrent inventory changes safely.
- Provide observable logs without leaking secrets or unnecessary personal data.

### Accessibility and responsive design
- Target WCAG 2.2 AA practices where feasible.
- Full keyboard operation, visible focus, semantic headings, accessible form errors, sufficient contrast, and meaningful image alt text.
- Mobile-first layouts for product browsing, cart, quote request, and vendor/admin tasks.

## 8. Success Metrics

Track after launch:
- Product search-to-detail click-through rate.
- Product detail-to-cart conversion.
- Quote request completion rate and quote response time.
- Vendor application approval time.
- Product moderation turnaround time.
- Order completion and cancellation rates.
- Stock/price mismatch rate.
- Support requests per order.
- Accessibility defects and security incidents.
- Localization completeness by screen/flow.

Do not set numeric targets until baseline data and business goals are agreed.

## 9. Acceptance Criteria

- A guest can browse only approved, published, active products.
- A vendor applicant cannot list or publish products before admin approval.
- An approved vendor cannot read or modify another vendor's private records.
- A customer cannot access another customer's profile, address, quote, or order.
- Admin approval, rejection, suspension, and product moderation actions are recorded in an audit trail.
- Mixed-source cart totals are calculated on the server and use trusted prices.
- Quote requests support multiple lines, quantities, destination, and explicit status transitions.
- Quote acceptance fails safely if expired or if the terms/availability are no longer valid.
- Order item snapshots preserve the purchased commercial terms.
- Shipping is platform-managed in the workflow, while carrier/rates remain unconfigured until selected.
- Commission is configurable and percentage-based, with no invented default rate.
- Payment is not live until a provider and business policy are approved.
- English/Tamil language switching is available for supported UI strings.
- Automated tests cover critical authorization, quote, inventory, and order flows.

## 10. Assumptions, Decisions Needed, and Risks

### Confirmed
- Global target market.
- Brand name TBD.
- Payment integration later.
- Platform-managed shipping.
- Percentage-based vendor commission.
- Bulk orders and quotation are in scope.
- Industrial visual direction.
- Recommended stack: Next.js + TypeScript + Supabase, deployed to Vercel unless revised.
- English and Tamil.
- Admin manually verifies vendors.
- Antigravity IDE is the implementation agent.
- Frontend must use the `Leonxlnx/taste-skill` / `design-taste-frontend` skill.

### Must be decided before production commerce
- Legal operator/brand, domain, company address, terms, privacy policy, returns/refunds and warranty policies.
- Initial supported countries, currencies, tax handling, restricted goods policy, export/import constraints.
- Payment method and whether orders can be placed before payment integration.
- Commission rate and calculation basis.
- Shipping regions, shipping-rate source, carrier, packaging, delivery estimates, returns and damaged-goods workflow.
- Vendor settlement/payout model.
- SKU ownership/uniqueness rules and inventory locations.
- Guest checkout and guest quote-request policy.
- Quote approval authority and expiry defaults.
- Email/SMS provider and notification templates.
- Final legal/compliance review.

**Implementation gate:** The six documentation files are planning artifacts. Do not implement the application or enable live transactions until the owner approves the open decisions and acceptance criteria.
