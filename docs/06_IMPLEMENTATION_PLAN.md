# Implementation Plan
## Construction E-commerce Marketplace

**Version:** 1.0  
**Implementation agent:** Antigravity IDE  
**Status:** Planning only — do not start application implementation until the owner approves the documentation and unresolved decisions.

---

## 1. Execution Rules for Antigravity

Before changing any source files:
1. Read all six documents in this folder: PRD, TRD, App Flow, UI/UX Design Brief, Backend Schema, and Implementation Plan.
2. Inspect the existing repository, package scripts, framework, current routes, dependencies, environment files and Git status.
3. Do not overwrite or delete existing code without identifying its purpose and reporting the proposed change.
4. Read/install the requested `Leonxlnx/taste-skill` (`design-taste-frontend`) using the project's supported workflow. Previously discussed command:
   `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`
5. Record a short repository audit and a design-skill summary before implementation.
6. Identify conflicts between the current repository and these docs. Ask the owner when a conflict changes product behavior, security, cost, legal policy or architecture.
7. Use the documentation as the source of truth. Do not invent brand, provider, commission rate, tax rate, payment flow, shipping rate, domain, credentials or legal policies.
8. Work in small phases. After each phase, report files changed, commands run, tests passed/failed, known gaps and next step.
9. Never claim a feature works unless it has been implemented and verified.
10. No live payment, real customer data, production migration or public launch during documentation review.

## 2. Phase 0 — Repository Audit and Approval Gate

Tasks:
- Inspect repository structure and current app state.
- Confirm framework/version and existing design system.
- Review environment variable usage and secret exposure risks.
- Inspect current Supabase integration, schema and policies if any.
- Review Git status and preserve unrelated changes.
- Read the taste skill and map its guidance to the industrial UI direction.
- Compare the repository with the six documents and list gaps.

Deliverables:
- `REPOSITORY_AUDIT.md`
- `DESIGN_SKILL_NOTES.md`
- `OPEN_DECISIONS.md` (maintain as decisions are made)

Exit criteria:
- Owner approves the implementation scope and the initial market/currency assumptions.
- No unresolved blocker affects the initial safe implementation.
- Existing work is understood and protected.

## 3. Phase 1 — Project Foundation

Tasks:
- Establish or align Next.js App Router + TypeScript.
- Configure formatting, linting, type checking and test commands.
- Set up environment validation and `.env.example` with placeholders only.
- Set up route groups and shared layout.
- Implement English/Tamil locale infrastructure.
- Establish design tokens and base responsive components following the taste skill.
- Add error, loading, empty and unauthorized page patterns.

Exit criteria:
- Application runs locally.
- Lint/type-check commands pass.
- No real secrets are committed.
- Locale switcher and fallback behavior work for foundation screens.
- Visual direction is reviewed before building all screens.

## 4. Phase 2 — Supabase Foundation and Security

Tasks:
- Configure separate development/staging/production Supabase environments.
- Create reviewed SQL migrations for profiles, roles, addresses, vendors, vendor applications, categories, products, media and inventory.
- Enable RLS on all exposed tables.
- Create and test ownership-scoped RLS policies.
- Configure Storage buckets and policies.
- Implement server-side session and role checks.
- Add audit event infrastructure.
- Seed only synthetic development data.

Exit criteria:
- Migration applies cleanly to a test project.
- Direct API/RLS tests prove customer/vendor isolation.
- Self-promotion to admin and self-approval are blocked.
- Service-role key is never exposed to client bundles.
- Storage policies prevent cross-vendor file access.

## 5. Phase 3 — Authentication and Vendor Onboarding

Tasks:
- Sign up, sign in, sign out and password recovery.
- Profile and locale preferences.
- Vendor application form and status view.
- Admin application review: approve, request information, reject, suspend.
- Record reviewer, timestamp and reason.
- Protect vendor routes until the vendor is approved.

Exit criteria:
- Auth flows work in a test environment.
- Applicant cannot access selling features before approval.
- Admin decisions are audited.
- Unauthorized route and API access is blocked.

## 6. Phase 4 — Catalog and Product Moderation

Tasks:
- Category browse and search.
- Product list/detail, source label and availability display.
- Platform-owned product management.
- Vendor product creation/editing and media upload.
- Product moderation queue and decision flow.
- Inventory editing and stock display.
- Product attributes and units validated server-side.

Exit criteria:
- Public pages show approved, active products only.
- Vendor ownership restrictions are verified.
- Unapproved products are not exposed through direct queries.
- Upload rules and error states work.
- Search and filters are paginated and performant with test data.

## 7. Phase 5 — Bulk Pricing and Quote Workflow

Tasks:
- Quote request from product detail and bulk-order page.
- Multi-line quote request with quantities, destination, required-by date and notes.
- Admin review and vendor-line assignment.
- Vendor response limited to assigned lines.
- Quote pricing, currency, expiry and terms.
- Quote accept/decline/expire and audit history.
- Transaction-safe conversion path, gated until order policy is approved.

Exit criteria:
- Invalid quantities and inaccessible products are rejected.
- Vendor cannot view another vendor's quote lines.
- Expired quotes cannot be accepted.
- Duplicate acceptance does not create duplicate orders.
- The UI clearly distinguishes a quote from a confirmed order.

## 8. Phase 6 — Cart, Orders and Inventory Integrity

Tasks:
- Implement cart persistence strategy.
- Support mixed first-party/vendor cart items.
- Server-side total calculation and currency compatibility checks.
- Atomic stock validation/reservation.
- Order and order-item snapshots.
- Order status history and customer order views.
- Fulfillment grouping for split shipments.
- Keep checkout disabled or staged until commercial/payment policy is approved.

Exit criteria:
- Browser cannot override price or totals.
- Concurrent order tests do not silently oversell inventory.
- Historical product and address snapshots are stable.
- Customer and vendor data scopes are enforced.
- No order is incorrectly marked paid.

## 9. Phase 7 — Platform-Managed Shipping

Tasks:
- Admin fulfillment queue and shipment status updates.
- Split fulfillment groups by source/vendor/location as required.
- Manual carrier/tracking fields.
- Customer-facing fulfillment timeline.
- Define exception, failed delivery, cancellation and return policy before expanding status transitions.
- Integrate a carrier only after provider, region coverage and rates are approved.

Exit criteria:
- Tracking/status is not fabricated.
- Vendor access is restricted to assigned fulfillment work.
- Order and fulfillment statuses remain consistent.
- Shipping costs/estimates are shown only when configured and supported.

## 10. Phase 8 — Commission Configuration

Tasks:
- Add commission rule management with effective dates and explicit calculation basis.
- Validate the percentage and rule activation.
- Store commission snapshots on relevant transaction records once rules are approved.
- Add reporting only for the approved financial model.

Exit criteria:
- No default commission rate is invented.
- Inactive/unapproved rules cannot be used for live financial calculations.
- Historical transactions preserve the rule applied.
- Settlement/payout features remain out of scope until the payment/refund/settlement model is approved.

## 11. Phase 9 — Payment Integration (Deferred)

This phase must not start until the owner selects a provider and approves the commercial flow.

Required decisions:
- Provider and supported countries/currencies.
- Whether payment is required before order confirmation.
- Manual invoice/credit options, if any.
- Refund, cancellation, dispute and reconciliation policy.
- Vendor settlement and payout policy.
- Webhook secrets, event handling and idempotency.

Implementation requirements after approval:
- Use provider-hosted/approved payment components where appropriate.
- Never store card data.
- Verify payment status server-side.
- Validate webhook signatures.
- Make webhook processing idempotent.
- Record payment events and reconcile asynchronous states.
- Test failures, retries, duplicate events, refunds and abandoned checkout.

## 12. Phase 10 — QA, Accessibility and Security Hardening

Tests:
- Unit: pricing, quantities, commission rule validation, quote expiry, status transitions and locale fallback.
- Integration: RLS, Storage, vendor/customer isolation, inventory and quote conversion.
- E2E: guest browsing, auth, vendor application, admin approval, product moderation, quote workflow, order views and language switching.
- Security: IDOR, mass assignment, role escalation, cross-vendor access, XSS, unsafe uploads, open redirects and rate-limit behavior.
- Accessibility: keyboard, focus, contrast, labels, form errors, responsive layouts and screen-reader status updates.
- Performance: pagination, image sizes, query plans and slow-page checks.

Exit criteria:
- Critical authorization and business-rule tests pass.
- No unresolved critical/high severity security issue.
- Known limitations and untested paths are documented.
- Legal, tax, shipping, privacy and commerce decisions are reviewed by the owner and relevant professionals.

## 13. Phase 11 — Deployment Readiness

Tasks:
- Confirm brand/domain and production ownership.
- Configure production secrets in hosting/Supabase dashboards, not source control.
- Review migrations, backups and recovery procedure.
- Run production-like smoke tests with synthetic data.
- Verify RLS, storage rules, access controls and logging.
- Verify payment remains disabled until the approved payment phase is complete.
- Add approved legal pages, customer support details and policies.
- Prepare release notes and rollback steps.

Exit criteria:
- Owner explicitly approves launch.
- All blocking open decisions are resolved.
- Production monitoring and backup/recovery procedures are understood.
- No demo/test data or credentials are exposed.

## 14. Definition of Done for Every Phase

Each phase is complete only when:
- Scope and files changed are listed.
- Lint, type-check and relevant tests are run and results reported.
- Acceptance criteria are demonstrated.
- Security and RLS implications are reviewed.
- No unrelated files are overwritten.
- Known limitations and remaining decisions are documented.
- Owner receives a concise phase report and approves moving to the next phase when required.

## 15. Initial Decision Register

| Decision | Current status | Required action |
|---|---|---|
| Brand and domain | TBD | Owner selects |
| Initial launch countries | Global target, launch scope unknown | Choose launch countries first |
| Currency strategy | Global; not finalized | Decide supported currencies and conversion policy |
| Tax handling | Not defined | Legal/accounting review |
| Payment provider | Deferred | Select before live checkout |
| Order acceptance before payment | Not defined | Decide before enabling checkout |
| Shipping provider/rates | Platform-managed; provider TBD | Define regions, costs and carrier |
| Commission percentage | Percentage model; rate/basis TBD | Approve rate, basis, rounding and refund treatment |
| Vendor payout/settlement | TBD | Define after payment decision |
| Vendor documents | Requirements TBD | Define minimum required data and retention |
| Guest quote/checkout | Default sign-in required for quote; checkout policy TBD | Confirm |
| Notifications | Provider TBD | Select provider and templates |
| Returns/warranty/disputes | TBD | Define policy |
| Brand design | Industrial direction | Finalize after skill review |
| Multi-user vendor accounts | Optional | Decide whether MVP needs it |

**Final gate:** Documentation and planning are complete when the owner has reviewed the six files and resolved launch-blocking decisions. No application implementation is authorized by this plan alone.
