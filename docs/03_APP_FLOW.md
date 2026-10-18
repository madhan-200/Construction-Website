# Application Flow
## Construction E-commerce Marketplace

**Version:** 1.0 | **Brand:** TBD | **Languages:** English / Tamil  
**Status:** Flow specification only — no application implementation yet.

---

## 1. Global Navigation

### Public storefront
- Home
- Shop / Categories
- Search
- Bulk Order / Request a Quote
- Vendor Directory (only if approved for launch)
- Help / Contact
- Language switcher: English ↔ தமிழ்
- Sign in / Create account
- Cart

### Authenticated customer
- Account overview
- Profile and addresses
- My orders
- My quotations
- Saved items (optional, post-MVP)
- Sign out

### Approved vendor
- Vendor overview
- Products
- Add/edit product
- Inventory
- Assigned orders / fulfillment
- Quote lines assigned to vendor
- Business profile
- Team members (optional; only if multi-user vendor accounts are approved)
- Sign out

### Admin
- Operations overview
- Vendor applications
- Vendor directory and status
- Product moderation
- Catalog/categories
- Quote management
- Orders and fulfillment
- Commission configuration
- Platform configuration
- Audit log
- Sign out

The navigation must be role-aware, but route guards and database policies—not the navigation UI—must enforce access.

## 2. Authentication and Routing

```text
Visitor
  ├─ Browse catalog → Product detail
  ├─ Add to cart → Sign in / guest-cart policy gate
  ├─ Request quote → Sign in (default assumption)
  ├─ Apply to sell → Sign in → Vendor application
  └─ Sign in / Register
       ├─ Customer → Account / return to intended page
       ├─ Vendor applicant → Application status
       ├─ Approved vendor → Vendor workspace
       ├─ Suspended vendor → Access blocked + support instructions
       └─ Admin → Admin console
```

Rules:
- After sign-in, redirect only to validated internal paths. Reject external redirect URLs.
- A user may be both a buyer and vendor only if the business approves this model; do not assume roles are mutually exclusive.
- An unapproved vendor sees application status and cannot access selling features.
- A suspended vendor cannot create listings or fulfill new work, but historical records remain accessible to admins and to the vendor where policy allows.

## 3. Product Discovery Flow

1. User opens home page.
2. User browses categories or searches by keyword.
3. User applies relevant filters and sorting.
4. System returns only approved, published, active products.
5. User opens a product detail page.
6. Page shows source/owner, SKU, unit, price and currency, stock/availability, specifications, images, and shipping/quote actions.
7. User selects quantity.
8. If quantity exceeds a configured bulk threshold or user wants negotiated terms, offer **Request a Quote**.
9. User can add the item to cart only if it is purchasable under the current commerce policy.
10. If checkout/payment has not been approved, explain that checkout is not yet available; do not simulate a successful purchase.

## 4. Cart and Checkout Flow

```text
Product detail
  → Add to cart
  → Cart review
      ├─ Revalidate product availability
      ├─ Revalidate quantity and unit
      ├─ Recalculate subtotal from trusted prices
      ├─ Identify platform/vendor fulfillment groups
      └─ Display configured charges only
  → Checkout readiness gate
      ├─ Payment/order policy approved and enabled
      │    → Address → Shipping options (platform-managed)
      │    → Final server-side validation
      │    → Create order transactionally
      │    → Payment step only after provider is chosen
      └─ Payment/order policy not approved
           → Show “Checkout is not yet available”
           → Offer quote request or contact/support route
```

No order is paid merely because a browser button was clicked. Once payment is integrated, the server must verify provider callbacks/webhooks and update payment state idempotently.

## 5. Bulk Quote Flow

1. User selects **Request a Quote** from product page, cart, or bulk-order page.
2. User signs in (default policy) or follows a later-approved guest process.
3. User adds one or more product lines.
4. For each line, user enters quantity and optional target price/notes.
5. User enters destination, required-by date/window, contact details already available in account, and project notes.
6. Server validates line quantities, product visibility, and input lengths.
7. Quote request is created with `submitted` status and an audit/status event.
8. Admin reviews request and routes each line to platform or relevant vendor.
9. Assigned vendor can respond only to their assigned line(s); admin can review/adjust the complete quote.
10. Admin issues a quote with price/currency, line quantities, delivery assumptions, validity date, and terms.
11. Buyer views quote and chooses accept or decline.
12. On accept, system checks expiry, availability and terms again.
13. If valid and the commerce policy is enabled, convert the quote to an order in a transaction. Otherwise keep it accepted-pending-commercial-activation or direct the buyer to the approved manual process.
14. Buyer can view status history.

Suggested quote states:
`draft → submitted → under_review → quoted → accepted → converted_to_order`
Alternative terminal states: `declined`, `expired`, `cancelled`.
All state changes require authorization and validation.

## 6. Vendor Onboarding Flow

```text
Create account / Sign in
  → Choose “Sell on the marketplace”
  → Read vendor terms / privacy notice
  → Submit application and required business details
  → Status = pending
  → Admin reviews evidence and application
      ├─ Approve → Vendor status = approved → Vendor workspace unlocked
      ├─ Request more information → Status = needs_information
      ├─ Reject → Status = rejected + reason
      └─ Suspend later → Selling actions disabled
```

- Application documents, if required, must use private storage and strict access policies.
- Do not ask for more identity/business information than necessary.
- Admin decision, reviewer, timestamp and reason are recorded.
- Approval does not automatically publish products: each product follows the catalog moderation flow.

## 7. Vendor Product Flow

1. Approved vendor opens Products.
2. Creates a product with title, SKU, category, description, unit, price/currency, images, specifications, and stock.
3. Server validates fields and vendor ownership.
4. Product status becomes `pending_review`.
5. Admin reviews listing and supporting claims/media.
6. Admin approves or rejects with reason.
7. Approved product becomes public only when it is also active and available for listing.
8. Vendor edits the product; material edits may return it to review.
9. Vendor updates stock; updates are validated and audited where appropriate.
10. Vendor cannot publish another vendor's product or alter platform-owned catalog records.

## 8. Admin Operations Flow

### Vendor review
Pending applications → inspect submitted data → approve / request information / reject → audit event → notify applicant when notification provider is configured.

### Product moderation
Pending products → inspect content, images, claims and category → approve / reject / unpublish → audit event.

### Quote management
Submitted quote → review scope → assign quote lines → collect vendor/platform pricing → prepare customer-facing quote → issue → track acceptance/expiry → convert only under approved order policy.

### Order and fulfillment management
Order queue → review payment/order status → create fulfillment groups → assign platform-managed shipment handling → record tracking/status → resolve exceptions → close when fulfillment is complete.

### Commission configuration
Admin opens commission settings → enters approved percentage and basis/effective date → validates → confirms → rule becomes active → future transactions snapshot the rule. Do not activate an unspecified rate.

## 9. Order and Fulfillment Statuses

Suggested order statuses:
- `draft`
- `pending_payment` (only after payment design exists)
- `confirmed`
- `processing`
- `partially_fulfilled`
- `fulfilled`
- `cancelled`
- `refunded` (only after refund workflow exists)

Suggested fulfillment statuses:
- `pending`
- `ready_to_ship`
- `shipped`
- `in_transit`
- `delivered`
- `delivery_exception`
- `cancelled`
- `returned` (only after returns workflow exists)

These are proposed states, not permission to implement all transitions without policy approval. Each transition must have allowed source states, authorized actor, required data and an audit record.

## 10. Error and Empty States

Design clear states for:
- No search results.
- Product unavailable or out of stock.
- Price changed since item was added to cart.
- Quantity exceeds available inventory.
- Vendor application awaiting review.
- Product listing rejected with feedback.
- Quote expired or no longer valid.
- Checkout not enabled.
- Shipping rate or delivery estimate not configured.
- Network/server error with retry guidance.
- Unauthorized access or expired session.
- Missing English/Tamil translation.
- Upload rejected due to size/type/policy.

Never reveal private resource existence or another user's details in an authorization error.

## 11. Mobile Considerations

- Search, filters, product quantity and quote submission must work on narrow screens.
- Use a compact bottom/sticky cart action only if it does not obscure content or keyboard focus.
- Vendor/admin tables must transform into readable cards or horizontally manageable views on mobile.
- Keep quote forms multi-step only when needed; preserve progress safely.
- Make language switching discoverable and keyboard accessible.
