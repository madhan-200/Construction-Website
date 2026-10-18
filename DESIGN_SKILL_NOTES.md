# Design Skill Notes
## Construction E-commerce Marketplace

**Visual Direction:** Industrial High-Contrast Specimen Catalogue  
**Skill Reference:** `taste-skill v2` (`design-taste-frontend`)  
**Target:** Global Construction Procurement Platform (English & Tamil)

---

## 1. Selected Design Direction
- **Archetype:** Specimen Catalogue / Industrial Manifest
- **Core Principle:** Construction materials, machinery, tools, and bulk aggregates presented with clinical precision, clear technical specifications, unit of measures, dimensional clarity, and distinct platform vs vendor origin labels.
- **House Rules Enforced:**
  - Headlines: 2 lines or fewer at all viewport widths.
  - No decorative gradients or gimmicky blur glassmorphism.
  - No generic icon-topped cards; structured data panels and technical specs tables.
  - High-contrast charcoal/graphite (`#0f172a`, `#1e293b`), crisp concrete grey (`#e2e8f0`, `#f8fafc`), and vibrant industrial construction safety orange (`#f97316` / `#ea580c`).
  - Clear typography with tabular numeric alignment for prices, dimensions, MOQ, and SKUs.
  - Authentic construction imagery and high-resolution material representations.

## 2. Palette & Tokens
- **Canvas / Ground:** Slate dark background (`#090d16` / `#0f172a`) with light mode contrast (`#ffffff` / `#f8fafc`)
- **Card / Surface:** Deep graphite (`#131c2e`), elevated slate (`#1e293b`), borders (`#334155`)
- **Accent Safety:** Safety Construction Orange (`#f97316`), Safety Yellow (`#eab308`)
- **Status Indicators:** Emerald Green (`#10b981`) for approved/in-stock, Amber (`#f59e0b`) for pending moderation/under review, Crimson (`#ef4444`) for rejected/out-of-stock.
- **Text:** High-contrast crisp white (`#f8fafc`) and cool slate (`#94a3b8`) for secondary technical details.

## 3. Localization Architecture
- Dedicated bilingual translation dictionary (`lib/i18n/`) supporting seamless switching between English (`en`) and Tamil (`ta`).
- Global currency formatting with ISO code (`INR`, `USD`, `EUR`, `AED`, etc.) and integer minor units (paise/cents).
- Explicit unit indicators (`tonnes`, `bags (50kg)`, `sq ft`, `metres`, `cum`, `pieces`, `litres`).

## 4. Anti-Slop Checkpoints
- Avoids fake 5-star ratings or stock testimonials.
- Uses real construction categories: Cement & Aggregates, Structural Steel & TMT Bars, Bricks & Masonry, Plumbing & Electrical, Heavy Machinery & Rental Tools, Finishes & Flooring.
- Clear distinction between **Platform-owned** and **Approved Vendor** listings.
- Professional Bulk Quotation workflow instead of immediate consumer checkout simulation.
