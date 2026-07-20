# Project Context: VM Shin Group

## Business Description
VM Shin Group is a premier manufacturer and supplier of concrete construction products in Armavir, Armenia.
The company is recognized for its high-quality construction products, residential/commercial concrete supplies, paving stones, and infrastructure concrete products.

## Target Audience & Branding
The website serves as a premium corporate showcase and product catalog.
It must convey the scale, reliability, and professional modern capability of a major industrial company.
It must avoid looking like a cheap template, a generic landing page, or an cluttered online shop.

## Tech Stack (Approved)
- **Framework:** Next.js (current stable, App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (v4)
- **Internationalization:** `next-intl` (multilingual routing and translation)
- **Animation:** `motion/react` (Motion library)
- **Package Manager:** `npm`

*Note: Large UI component, forms, slider, or database packages are not permitted unless explicitly approved.*

## Multilingual Requirements
- **Locales:** Armenian (`hy`), Russian (`ru`), English (`en`)
- **Default Locale:** Armenian (`hy`)
- **Routing:** All routes are prefixed (e.g. `/hy`, `/ru`, `/en`). Visiting `/` redirects to `/hy`.
- **Translations:** Content must be loaded strictly from translation JSON dictionaries (`messages/*.json`). No hardcoded Armenian, Russian, or English strings are allowed in components.

## Design Direction
- **Theme:** Premium black & yellow industrial theme.
- **Colors:**
  - Deep black backgrounds (`#080808`)
  - Dark graphite surfaces (`#111111`, `#171717`)
  - Warm construction yellow accent (`#F5B800`)
  - Refined yellow-to-gold gradients (`#FFD45A` highlights)
- **Accents:** Subtle border styles with low opacity, controlled blur effects, soft glowing interactions, high contrast.
- **Typography:** Multi-script font support (`Inter` + `Noto Sans Armenian` fallback stack).

## Site Modules (Planned & Future)
- Complete Product Catalog
- Interactive material & volume calculators
- Order request forms (directing emails exclusively to Gmail)
- Sanity CMS integration (for simple content management by a single employee)
- Projects showcase, vacancies, and news sections

## Code Quality Rules
- TypeScript strict mode with minimal use of `any`.
- Keep component files focused, modular, and reusable.
- Use Server Components where possible; restrict Client Components to animations and interactive DOM states.
- Clean semantic markup with full ARIA landmarks, roles, and focus outlines.
- Strict layout shift prevention and lightweight asset loading.
- Respect users' reduced motion preferences globally.

## Completed Homepage Foundation (Tasks 0.1, 0.3, 0.3R-FIX, 0.5, 0.6)
- Sticky responsive header with official logo, scroll blur effects, and focus-trapped animated mobile menu drawer.
- Immersive background video Hero with autoplay check and automatic poster/geometric CSS fallbacks.
- Native CSS scroll-snapped Product Carousel supporting manual scroll triggers, mobile swipe, and accessibility-friendly autoplay.
- Approved Editorial Manufacturing / Why Choose Us Section ("Why Choose VM Shin Group") with asymmetric layout and production facts.
- Premium Product Applications Section ("Where Our Products Are Used") with interactive category tabs, smooth image crossfade, dark directional gradients, and local SVG placeholders.
- Premium Material Calculator Section ("Estimate Material Quantities") with isolated business math logic, graphite technical UI, live numeric updates, initial disclaimer, and primary CTA.

