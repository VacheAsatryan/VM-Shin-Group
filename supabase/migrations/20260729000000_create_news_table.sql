-- Migration: 20260729000000_create_news_table.sql
-- Description: Create multilingual news table with constraints, indexes, triggers, and fail-closed RLS policies.

CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 1 AND 150 AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    cover_image_url TEXT NULL CHECK (cover_image_url IS NULL OR char_length(cover_image_url) <= 1000),
    title_hy TEXT NOT NULL CHECK (char_length(title_hy) BETWEEN 1 AND 200),
    title_ru TEXT NOT NULL CHECK (char_length(title_ru) BETWEEN 1 AND 200),
    title_en TEXT NOT NULL CHECK (char_length(title_en) BETWEEN 1 AND 200),
    excerpt_hy TEXT NOT NULL CHECK (char_length(excerpt_hy) BETWEEN 1 AND 500),
    excerpt_ru TEXT NOT NULL CHECK (char_length(excerpt_ru) BETWEEN 1 AND 500),
    excerpt_en TEXT NOT NULL CHECK (char_length(excerpt_en) BETWEEN 1 AND 500),
    content_hy TEXT NOT NULL CHECK (char_length(content_hy) >= 1),
    content_ru TEXT NOT NULL CHECK (char_length(content_ru) >= 1),
    content_en TEXT NOT NULL CHECK (char_length(content_en) >= 1)
);

-- Comments
COMMENT ON TABLE public.news IS 'Stores multilingual company news and announcements.';
COMMENT ON COLUMN public.news.status IS 'Publication status: draft or published.';
COMMENT ON COLUMN public.news.slug IS 'URL-safe unique article identifier slug.';

-- Automated updated_at Trigger
DROP TRIGGER IF EXISTS set_news_updated_at ON public.news;
CREATE TRIGGER set_news_updated_at
    BEFORE UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news (slug);
CREATE INDEX IF NOT EXISTS idx_news_status_published_at ON public.news (status, published_at DESC NULLS LAST, created_at DESC);

-- Table Privileges
REVOKE ALL ON TABLE public.news FROM PUBLIC, anon;
GRANT SELECT ON TABLE public.news TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.news TO authenticated;

-- Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Anyone can read published news articles
CREATE POLICY "Allow public read published news"
    ON public.news
    FOR SELECT
    TO PUBLIC
    USING (status = 'published');

-- 2. Admin Read Policy: Admin can read all news (drafts & published)
CREATE POLICY "Allow admin read all news"
    ON public.news
    FOR SELECT
    TO authenticated
    USING (private.is_admin());

-- 3. Admin Insert Policy: Only admin can create news
CREATE POLICY "Allow admin insert news"
    ON public.news
    FOR INSERT
    TO authenticated
    WITH CHECK (private.is_admin());

-- 4. Admin Update Policy: Only admin can edit news
CREATE POLICY "Allow admin update news"
    ON public.news
    FOR UPDATE
    TO authenticated
    USING (private.is_admin())
    WITH CHECK (private.is_admin());

-- 5. Admin Delete Policy: Only admin can delete news
CREATE POLICY "Allow admin delete news"
    ON public.news
    FOR DELETE
    TO authenticated
    USING (private.is_admin());
