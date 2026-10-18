# UI/UX Design Brief
## Construction E-commerce Marketplace

**Version:** 1.0 | **Brand:** TBD | **Visual direction:** Industrial  
**Required frontend skill:** `Leonxlnx/taste-skill` — `design-taste-frontend`  
**Status:** Design specification only; do not implement the application yet.

---

## 1. Design Objective

Create a professional construction-materials buying experience that feels dependable, precise, practical, and modern. It should communicate product clarity, reliable operations, and procurement confidence rather than looking like a generic fashion or consumer marketplace.

The brand is TBD. Use a neutral temporary design token system; do not invent a logo or finalize a brand name.

## 2. Visual Direction

### Industrial, clean, high-contrast
- **Primary neutrals:** charcoal/graphite, off-white, concrete grey.
- **Accent:** construction orange for key actions and high-value status indicators.
- **Support colors:** restrained green for success, amber for attention, red for destructive/error states; never rely on color alone.
- **Surfaces:** clean cards and panels, clear borders, disciplined spacing.
- **Typography:** highly legible sans-serif with clear numeric readability for prices, dimensions, quantities and SKUs.
- **Imagery:** authentic construction materials, tools, industrial settings and product photography. Avoid generic corporate stock photos as the primary visual identity.
- **Iconography:** consistent, simple line icons; label uncommon icons.
- **Motion:** purposeful and restrained; no decorative animations that delay purchasing or reduce accessibility.

Exact colors, font families and component library should be selected after reading the required taste skill and reviewing its guidance.

## 3. Required Skill Workflow

Before designing or coding, the Antigravity agent must:
1. Read the repository and identify existing constraints before changing files.
2. Install or inspect `Leonxlnx/taste-skill` using the project's supported skill installation workflow. The previously discussed command is:
   `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`
3. Read the installed `design-taste-frontend` skill instructions and any referenced design tokens/examples.
4. Summarize applicable rules in a short design decision note.
5. Apply the skill consistently to the public storefront, customer area, vendor workspace and admin console.
6. Avoid blindly copying a sample; adapt the skill to this industrial marketplace and its accessibility requirements.
7. If installation fails, report the exact error and ask before silently substituting a different skill.

## 4. Information Architecture

### Public storefront
- Header with temporary wordmark placeholder, category navigation, search, language switcher, account and cart.
- Home page: clear product search, primary construction categories, featured/available products, bulk procurement call-to-action, vendor marketplace explanation, trust/service information.
- Category/search listing: filters, sort, result count, product cards, pagination or progressive loading.
- Product detail: image gallery, product title, SKU, source label, price/currency, unit, availability, specifications, description, quantity control, shipping information if configured, add-to-cart, request-quote action.
- Vendor storefront: approved public business profile and active listings only.
- Footer: contact/help, terms, privacy, returns/shipping placeholders and language option. Legal pages must be reviewed before launch.

### Customer workspace
- Overview with orders and quote requests.
- Order detail with items, address snapshot, order status timeline and fulfillment status.
- Quote detail with quote expiry, line items, commercial terms and accept/decline actions where allowed.
- Profile and address management.

### Vendor workspace
- Status-aware dashboard.
- Product list with moderation status and stock.
- Product creation/edit form.
- Inventory update interface.
- Assigned fulfillment/order queue.
- Assigned quote lines.
- Business profile and application status.
- Clearly distinguish draft, pending review, published, rejected and suspended states.

### Admin console
- Operations summary.
- Vendor application queue and detail.
- Product moderation queue.
- Quote queue and line assignment.
- Orders and fulfillment.
- Commission configuration with warnings until rate/basis are approved.
- Platform settings, audit events and role-protected actions.

## 5. Core Components

- Global header, footer, breadcrumbs and responsive navigation.
- Search input with clear submit, loading, empty and error states.
- Category navigation and filter controls.
- Product card and product image gallery.
- Source/ownership label: “Platform product” vs “Vendor product”.
- Price block with unit and currency.
- Quantity stepper with accessible labels and validation.
- Stock/availability indicator based on verified inventory.
- Add-to-cart and request-quote actions.
- Cart line item and server-calculated totals.
- Quote status badge and quote timeline.
- Order/fulfillment timeline.
- Vendor application status panel.
- Product moderation status and reviewer feedback.
- Accessible tables, pagination, confirmation dialog, toast/inline status, skeleton and empty states.
- English/Tamil language switcher.

## 6. Interaction Requirements

- Primary actions are visually obvious and keyboard reachable.
- Destructive actions require confirmation; sensitive admin decisions should capture a reason.
- Do not rely on hover for essential information.
- Inline form errors should identify the field and explain how to fix it.
- Keep user-entered quote/application data when recoverable after validation errors.
- Show when a product's price or stock changes between cart and checkout.
- Never imply checkout/payment success when the backend has not confirmed it.
- Use a disabled/staged checkout state while payment/order policy is unapproved.
- Avoid false urgency, fake stock counters, fake ratings, fabricated reviews, or unverified certifications.

## 7. Responsive Behavior

- Mobile: single-column product detail, accessible filter drawer, readable cart, short quote form sections.
- Tablet: flexible product grid and compact navigation.
- Desktop: multi-column catalog and product detail where useful; larger admin/vendor tables with clear row actions.
- All critical actions must remain usable at 320 CSS pixels wide without horizontal page overflow.
- Touch targets should be comfortably sized; keyboard and screen-reader use must remain supported.

## 8. Accessibility

Target WCAG 2.2 AA practices:
- Semantic landmarks and heading hierarchy.
- Visible focus ring and full keyboard navigation.
- Sufficient text and control contrast.
- Accessible labels for icon buttons and quantity controls.
- Error text associated with inputs.
- Alt text for informative product images; decorative images use empty alt.
- Dialog focus management and escape behavior.
- Status updates announced appropriately.
- Do not communicate state by color alone.
- Respect reduced-motion preferences.

## 9. Localization UX

- English default; Tamil available through a persistent, visible language control.
- Use translation keys and centralized locale dictionaries.
- Test long Tamil strings and font rendering; avoid fixed-height text containers that clip translated copy.
- Format prices with the item's actual currency code and locale.
- Provide a fallback for product content that has not been translated.
- Do not mix English and Tamil labels inconsistently within the same flow except for product/SKU/legal names where necessary.

## 10. Design Deliverables Expected from Agent Later

After owner approval to implement:
- Design tokens and typography scale.
- Responsive page layouts for storefront, product detail, cart, quote request, customer area, vendor workspace and admin console.
- Shared component inventory and variants.
- Interaction/state specifications.
- Empty, loading, error, success, disabled and permission-denied states.
- Accessibility review checklist.
- Screenshots or preview links for review before broad implementation.

## 11. UX Acceptance Criteria

- Buyers can distinguish platform-owned from vendor-owned products.
- Price, currency, unit and availability are visible and unambiguous.
- Bulk quotation is discoverable from product detail and relevant cart flows.
- Vendor status and product moderation state are clear.
- English/Tamil switching works across all in-scope screens.
- Mobile flows do not require precision hovering or inaccessible table interaction.
- No fake checkout success, unverified product claims, fake ratings, or unconfigured shipping promises.
- Visual system follows the required taste skill after it has been read and its use documented.
