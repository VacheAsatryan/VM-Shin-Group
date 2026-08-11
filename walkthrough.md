# Walkthrough — Ready-Mix Concrete Pricing, Floor Slab Unit Fixes, and Paving Stone Variant Mapping

This document summarizes the changes made to VM SHIN GROUP's ready-mix concrete pricing, floor slab panel unit label fixes, and paving-stone image variant mapping.

## Changes Made

### 1. Ready-Mix Concrete Pricing & Delivery
- Centrally configured concrete grade pricing in [calculatorProducts.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/calculatorProducts.ts) and [productDetails.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/productDetails.ts) as the single source of truth.
- Enabled concrete subtotal calculation in [calculateProductEstimate.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/lib/calculator/calculateProductEstimate.ts) based on selected variant grade and volume.
- Set up concrete-only delivery tariffs in [delivery-pricing.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/lib/maps/delivery-pricing.ts) (fixed distance bands up to 40 km, manager confirmation above 40 km).
- Cleaned up the old contradictory concrete business rule messages from translations and components.
- Integrated pricing and delivery into the checkout order payload and admin drawer.

### 2. Floor Slab Panel Unit Fixes ("Ծածկի պանել")
- **Source of Truth Update**: Changed the product category's `unitLabelKey` from `"pcs"` to `"m2"` in [calculatorProducts.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/calculatorProducts.ts) to correctly calculate and display prices per square meter ($m^2$).
- **Pricing Configuration**: Changed concrete slab variants (`slab-120`, `slab-060`) in [productDetails.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/productDetails.ts) to use the new `"perM2"` unitKey.
- **Calculator Logic Swap**: Swapped the primary and secondary units/quantities in [calculateFloorSlabs.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/lib/calculator/strategies/calculateFloorSlabs.ts) so that:
  - **Primary unit** is square meters (`m2`) representing the calculated area.
  - **Secondary unit** is pieces (`pcs`) representing the count of panels.
- **Dynamic UI Labels**: Added `"perM2"` and `"panelsCount"` translation keys to locale translation files ([hy.json](file:///Users/vachasatryan/Desktop/VM_Shin_Group/messages/hy.json), [ru.json](file:///Users/vachasatryan/Desktop/VM_Shin_Group/messages/ru.json), [en.json](file:///Users/vachasatryan/Desktop/VM_Shin_Group/messages/en.json)).
- **UI Enhancements**: Updated [CalculatorResult.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/calculator/CalculatorResult.tsx) and [EstimateStep.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/calculator/EstimateStep.tsx) to render `"t("results.panelsCount")"` for floor slabs as the secondary label instead of `"Total Area"`.

### 3. Paving Stone Image/Variant Mapping & UI Synchronization
- **Asset Audit**: Confirmed existing WebP files for Type 1 (`v1`) and Type 2 (`v2`) sizes/colors in `/public/images/products/paving-stones/`.
- **Centralized Image Map**: Overwrote [pavingStoneImages.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/pavingStoneImages.ts) to map exactly by `TYPE → SIZE → COLOR` to match the exact renamed filenames.
- **Color ID Matching**: Fixed the mismatch where yellow WebP asset files were mapped under the key `"yellow"` while the application's actual color ID is `"sand"`. Updated the mapping in [pavingStoneImages.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/config/pavingStoneImages.ts) to use the correct key `"sand"`.
- **Details Page Selector Controls Integration**:
  - Added `initialColorId` and `initialSizeId` props to [CalculatorSection.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/sections/CalculatorSection.tsx).
  - Wired these props from the details page selector states (`selectedColor` and `selectedSize`) inside [ProductDetailView.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/products/ProductDetailView.tsx) to the calculator section.
  - Set up dynamic state synchronization in [CalculatorSection.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/sections/CalculatorSection.tsx) to react to updates to variant, color, or size selection controls instantly.
- **Calculator Form Selection**: Updated [DynamicCalculatorForm.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/calculator/DynamicCalculatorForm.tsx) to dynamically extract available colors from the selected variant instead of using a hardcoded array. This removes the `"mix"` selection option for Type 2.
- **State Reset Logic**: Implemented color and size validation inside `handleSelectVariant` within [CalculatorSection.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/sections/CalculatorSection.tsx) so that if Type 1 + Mix is switched to Type 2, the selection clears and defaults to `"gray"`.
- **Dynamic Product Detail Previews**: Integrated dynamic image lookup using `getProductImage` in [ProductDetailView.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/products/ProductDetailView.tsx) to update the main product photo instantly as the user clicks variant sizes and colors.
- **Missing Photo Fallback**: Implemented the fallback policy in [getProductImage.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/lib/calculator/getProductImage.ts) to return the generic same-type asset (`paving-stone-type-1.png` or `paving-stone-type-2.png`) if a valid configuration doesn't have an exact photo.

---

## Verification Results

### Concrete Pricing & Delivery Tests
All tests passed successfully in the verification script:
- Concrete grades resolve to exact unit prices (M100: 25,000 AMD $\rightarrow$ M400: 38,000 AMD).
- Volume calculations and subtotals match the exact grade values (e.g. M200 x 5 m³ = 150,000 AMD).
- Delivery boundary pricing resolves to correct flat rates.

### Floor Slab Unit Verification
- Product selector card in the calculator displays: `մ²` / `м²` / `m²`.
- Product details page price displays: `8,500 ֏ / մ²` (in Armenian), `8,500 ֏ / м²` (in Russian), `8,500 AMD / m²` (in English).
- Calculator results and estimates show the total square meters as primary quantity (with unit `մ²` / `м²` / `m²`) and number of panels as secondary quantity (labeled "Պանելների քանակ").

### Paving Stone Mappings Programmatic Tests
Ran [verify_paving_stones.ts](file:///Users/vachasatryan/.gemini/antigravity-ide/brain/2fe2bfbd-1c8e-4080-9d78-c90e654c1a72/scratch/verify_paving_stones.ts), verifying 11 distinct combinations:
- Type 1, 55×130×130, red $\rightarrow$ `paving-stone-55×130×130-red-v1.webp` (PASS)
- Type 1, 55×130×130, sand (yellow) $\rightarrow$ `paving-stone-55×130×130-yellow-v1.webp` (PASS)
- Type 1, 55×130×165, brown $\rightarrow$ `paving-stone-v1-55×130×165-brown-v1.webp` (PASS)
- Type 1, 55×130×230, sand (yellow) $\rightarrow$ `paving-stone-55×130×230-yellow-v1.webp` (PASS)
- Type 1, 55×230×265, mix $\rightarrow$ `paving-stone-55×230×265-mix-v1.webp` (PASS)
- Type 2, 55×100×200, dark-gray $\rightarrow$ `paving-stone-55×100×200-dark-gray-v2.webp` (PASS)
- Type 2, 55×100×200, gray $\rightarrow$ `paving-stone-55×100×200-gray-v2.webp` (PASS)
- Type 2, 55×100×200, light-gray $\rightarrow$ `paving-stone-55×100×200-light-gray-v2.webp` (PASS)
- Type 2, 55×100×200, red $\rightarrow$ `paving-stone-55×100×200-red-v2.webp` (PASS)
- Fallback Type 1 (55×130×165, red) $\rightarrow$ `paving-stone-type-1.png` (PASS)
- Fallback Type 2 (55×100×200, brown) $\rightarrow$ `paving-stone-type-2.png` (PASS)

All physical WebP/PNG assets successfully verified as physically existing.

### Compilation & Build Checks
- **TypeScript compile (`npx tsc --noEmit`)**: PASS (0 errors)
- **Linter check (`npm run lint`)**: PASS (0 warnings/errors)
- **Next.js production build (`npm run build`)**: PASS
