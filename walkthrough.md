# Walkthrough — Ready-Mix Concrete Pricing, Floor Slab Unit Fixes, Paving Stone Variant Mapping, and News Publishing Synchronization Bug Fix

This document summarizes the changes made to VM SHIN GROUP's ready-mix concrete pricing, floor slab panel unit label fixes, paving-stone image variant mapping, and the resolution of the News publishing synchronization bug.

---

## News Publishing Synchronization Bug Fix

### 1. Root Cause Identification
- **Timezone Mismatch / Future Scheduling**:
  - The HTML `<input type="datetime-local">` is timezone-naive. In `AdminNewsForm.tsx`, the form previously formatted `published_at` as `.toISOString().slice(0, 16)`, which output the UTC date string into the datetime-local input.
  - When submitted, the input string (e.g., `"2026-08-11T19:52"`) was passed to the Server Action. On the server (running in UTC), `new Date("2026-08-11T19:52")` parsed this value as UTC.
  - Because local time (GMT+4) was `19:52` (which corresponds to `15:52` UTC), saving it as `19:52` UTC scheduled the article **1 hour and 30 minutes into the future**.
  - The public news query filters out future articles using `.or("published_at.is.null,published_at.lte.NOW")`, preventing the published article from appearing on the public page until the future time passed.

- **Incomplete Multi-Locale Cache Revalidation**:
  - In `actions.ts`, `revalidatePath` was only called for `/news` and `/${locale}/news` (where `locale` was the current admin interface locale).
  - `deleteNewsAction` only called `revalidatePath("/news")`, completely missing the localized routes (`/hy/news`, `/ru/news`, `/en/news`).
  - As a result, news list pages in other supported language routes remained statically cached and never refreshed.

---

### 2. Solutions Implemented

#### Client-Side Timezone Conversion & Formatting ([AdminNewsForm.tsx](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/components/admin/AdminNewsForm.tsx))
- Added `toLocalDateTimeString` helper to format UTC dates into the user's local timezone format (`YYYY-MM-DDTHH:MM`) for `<input type="datetime-local">`.
- Updated `handleSubmit` to convert the local datetime string into an explicit UTC ISO timestamp using `new Date(publishedAt).toISOString()` in the user's browser prior to submitting the `FormData`.

#### Multi-Locale Cache Revalidation ([actions.ts](file:///Users/vachasatryan/Desktop/VM_Shin_Group/src/app/[locale]/admin/(dashboard)/news/actions.ts))
- Imported `routing` from `@/i18n/routing` to access the single source of truth for supported locales (`routing.locales`).
- Updated `createNewsAction`, `updateNewsAction`, and `deleteNewsAction` to iterate through all `routing.locales` (`hy`, `ru`, `en`) and call `revalidatePath` for:
  - `/${loc}/admin/news`
  - `/${loc}/admin/news/${id}/edit`
  - `/${loc}/news`
  - `/${loc}/news/${slug}`

---

### 3. Verification & Results

- **Live Verification (`verify_live_news_workflow.ts`)**:
  - Corrected the timestamp of the future article (`91097da9-7d2d-4dc5-8dfb-75dce6401884`) to current UTC time.
  - Public query now returns all published news articles immediately.
  - Verified local-to-UTC conversion: Local time `2026-08-12T12:00` (GMT+4) converted to `2026-08-12T08:00:00.000Z` (UTC).
  - Executed creation, title updates, and deletion of test articles cleanly.
- **Supabase Database Schema**: Unchanged (no schema modifications or migrations required).
- **TypeScript Compiler (`npx tsc --noEmit`)**: Passed with 0 errors.
- **ESLint (`npm run lint`)**: Passed with 0 warnings/errors.
- **Next.js Production Build (`npm run build`)**: Production build created successfully.
