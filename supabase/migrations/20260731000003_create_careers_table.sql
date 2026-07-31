-- Migration: 20260731000003_create_careers_table.sql
-- Description: Create public.careers table with single-source locale architecture, check constraints, RLS policies, and triggers.

CREATE TABLE IF NOT EXISTS public.careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 150 AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    source_locale TEXT NOT NULL DEFAULT 'hy' CHECK (source_locale IN ('hy', 'ru', 'en')),
    department TEXT NULL,
    location TEXT NULL,
    employment_type TEXT NULL CHECK (employment_type IS NULL OR employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    salary_from NUMERIC NULL CHECK (salary_from IS NULL OR salary_from >= 0),
    salary_to NUMERIC NULL CHECK (salary_to IS NULL OR salary_to >= 0),
    currency TEXT DEFAULT 'AMD',
    cover_image_url TEXT NULL CHECK (cover_image_url IS NULL OR char_length(cover_image_url) <= 1000),
    title_hy TEXT NULL,
    title_ru TEXT NULL,
    title_en TEXT NULL,
    summary_hy TEXT NULL,
    summary_ru TEXT NULL,
    summary_en TEXT NULL,
    content_hy TEXT NULL,
    content_ru TEXT NULL,
    content_en TEXT NULL
);

-- Comments
COMMENT ON TABLE public.careers IS 'Stores job vacancy listings and career opportunities.';
COMMENT ON COLUMN public.careers.status IS 'Status: draft, published, or closed.';
COMMENT ON COLUMN public.careers.source_locale IS 'Primary authoring language.';

-- Automated updated_at Trigger
DROP TRIGGER IF EXISTS set_careers_updated_at ON public.careers;
CREATE TRIGGER set_careers_updated_at
    BEFORE UPDATE ON public.careers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Constraints for single-source + optional translation architecture
ALTER TABLE public.careers
  ADD CONSTRAINT careers_source_locale_content_check CHECK (
    (
      source_locale = 'hy' AND
      title_hy IS NOT NULL AND length(trim(title_hy)) BETWEEN 1 AND 200 AND
      summary_hy IS NOT NULL AND length(trim(summary_hy)) BETWEEN 1 AND 500 AND
      content_hy IS NOT NULL AND length(trim(content_hy)) >= 1
    ) OR (
      source_locale = 'ru' AND
      title_ru IS NOT NULL AND length(trim(title_ru)) BETWEEN 1 AND 200 AND
      summary_ru IS NOT NULL AND length(trim(summary_ru)) BETWEEN 1 AND 500 AND
      content_ru IS NOT NULL AND length(trim(content_ru)) >= 1
    ) OR (
      source_locale = 'en' AND
      title_en IS NOT NULL AND length(trim(title_en)) BETWEEN 1 AND 200 AND
      summary_en IS NOT NULL AND length(trim(summary_en)) BETWEEN 1 AND 500 AND
      content_en IS NOT NULL AND length(trim(content_en)) >= 1
    )
  );

ALTER TABLE public.careers
  ADD CONSTRAINT careers_translation_hy_check CHECK (
    (
      (title_hy IS NULL OR length(trim(title_hy)) = 0) AND
      (summary_hy IS NULL OR length(trim(summary_hy)) = 0) AND
      (content_hy IS NULL OR length(trim(content_hy)) = 0)
    ) OR (
      title_hy IS NOT NULL AND length(trim(title_hy)) BETWEEN 1 AND 200 AND
      summary_hy IS NOT NULL AND length(trim(summary_hy)) BETWEEN 1 AND 500 AND
      content_hy IS NOT NULL AND length(trim(content_hy)) >= 1
    )
  );

ALTER TABLE public.careers
  ADD CONSTRAINT careers_translation_ru_check CHECK (
    (
      (title_ru IS NULL OR length(trim(title_ru)) = 0) AND
      (summary_ru IS NULL OR length(trim(summary_ru)) = 0) AND
      (content_ru IS NULL OR length(trim(content_ru)) = 0)
    ) OR (
      title_ru IS NOT NULL AND length(trim(title_ru)) BETWEEN 1 AND 200 AND
      summary_ru IS NOT NULL AND length(trim(summary_ru)) BETWEEN 1 AND 500 AND
      content_ru IS NOT NULL AND length(trim(content_ru)) >= 1
    )
  );

ALTER TABLE public.careers
  ADD CONSTRAINT careers_translation_en_check CHECK (
    (
      (title_en IS NULL OR length(trim(title_en)) = 0) AND
      (summary_en IS NULL OR length(trim(summary_en)) = 0) AND
      (content_en IS NULL OR length(trim(content_en)) = 0)
    ) OR (
      title_en IS NOT NULL AND length(trim(title_en)) BETWEEN 1 AND 200 AND
      summary_en IS NOT NULL AND length(trim(summary_en)) BETWEEN 1 AND 500 AND
      content_en IS NOT NULL AND length(trim(content_en)) >= 1
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_careers_slug ON public.careers (slug);
CREATE INDEX IF NOT EXISTS idx_careers_status_published_at ON public.careers (status, published_at DESC NULLS LAST, created_at DESC);

-- Table Privileges
REVOKE ALL ON TABLE public.careers FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.careers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.careers TO authenticated;

-- Row Level Security (RLS)
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Anyone can read published careers
CREATE POLICY "Allow public read published careers"
    ON public.careers
    FOR SELECT
    TO PUBLIC
    USING (status = 'published');

-- 2. Admin Read Policy: Admin can read all careers (draft, published, closed)
CREATE POLICY "Allow admin read all careers"
    ON public.careers
    FOR SELECT
    TO authenticated
    USING (private.is_admin());

-- 3. Admin Insert Policy: Only admin can create careers
CREATE POLICY "Allow admin insert careers"
    ON public.careers
    FOR INSERT
    TO authenticated
    WITH CHECK (private.is_admin());

-- 4. Admin Update Policy: Only admin can edit careers
CREATE POLICY "Allow admin update careers"
    ON public.careers
    FOR UPDATE
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- 5. Admin Delete Policy: Only admin can delete careers
CREATE POLICY "Allow admin delete careers"
    ON public.careers
    FOR DELETE
    TO authenticated
    USING (private.is_admin());
