# Open Decisions Register
## Construction E-commerce Marketplace

**Status:** Initial Decisions Tracked  
**Reference:** PRD Section 10 & Implementation Plan Section 15

| Item | Status | Current Working Assumption | Action Required Before Production |
|---|---|---|---|
| **Brand Identity** | TBD | Temporary Industrial Identifier: "BUILDMART / காண்ஸ்ட்ரக்ட்" | Owner to provide legal company name, logo, domain |
| **Payment Gateway** | Deferred | Feature-flagged test mode; checkout displays pending activation status | Select payment provider (e.g. Stripe, Razorpay) |
| **Order Acceptance** | Staged | Orders created in draft/pending status with clear bulk quote workflow | Finalize order confirmation & invoice terms |
| **Commission Rate** | Configurable | Percentage-based database table `commission_rules` with effective date ranges | Admin sets percentage (e.g. 8-15%) upon owner review |
| **Shipping Provider** | Platform-Managed | Manual shipment creation, dispatch date & tracking reference entry | Select regional freight carrier API |
| **Currencies & Regions** | Global-ready | Default INR / USD supported with integer minor units | Finalize initial tax jurisdiction & currency list |
| **Vendor Documents** | Defined | Business registration number, GST/Tax ID, address proof, company email | Legal verification review |
| **Guest Policy** | Guest Browse Only | Guest can browse; account required for quotes and cart checkout | Confirm if guest quote submissions should be allowed |
