-- Migration: 20260731000002_fix_news_table_constraints.sql
-- Description: Drop legacy NOT NULL and CHECK constraints requiring all 3 languages, and add new single-source + optional translation constraints.

-- 1. Drop legacy check constraints
ALTER TABLE public.news
  DROP CONSTRAINT IF EXISTS news_title_hy_check,
  DROP CONSTRAINT IF EXISTS news_title_ru_check,
  DROP CONSTRAINT IF EXISTS news_title_en_check,
  DROP CONSTRAINT IF EXISTS news_excerpt_hy_check,
  DROP CONSTRAINT IF EXISTS news_excerpt_ru_check,
  DROP CONSTRAINT IF EXISTS news_excerpt_en_check,
  DROP CONSTRAINT IF EXISTS news_content_hy_check,
  DROP CONSTRAINT IF EXISTS news_content_ru_check,
  DROP CONSTRAINT IF EXISTS news_content_en_check;

-- 2. Drop NOT NULL requirement from all language columns
ALTER TABLE public.news
  ALTER COLUMN title_hy DROP NOT NULL,
  ALTER COLUMN title_ru DROP NOT NULL,
  ALTER COLUMN title_en DROP NOT NULL,
  ALTER COLUMN excerpt_hy DROP NOT NULL,
  ALTER COLUMN excerpt_ru DROP NOT NULL,
  ALTER COLUMN excerpt_en DROP NOT NULL,
  ALTER COLUMN content_hy DROP NOT NULL,
  ALTER COLUMN content_ru DROP NOT NULL,
  ALTER COLUMN content_en DROP NOT NULL;

-- 3. Add new constraints for single-source + optional translation architecture

-- Constraint A: Source locale content is mandatory
ALTER TABLE public.news
  ADD CONSTRAINT news_source_locale_content_check CHECK (
    (
      source_locale = 'hy' AND
      title_hy IS NOT NULL AND length(trim(title_hy)) BETWEEN 1 AND 200 AND
      excerpt_hy IS NOT NULL AND length(trim(excerpt_hy)) BETWEEN 1 AND 500 AND
      content_hy IS NOT NULL AND length(trim(content_hy)) >= 1
    ) OR (
      source_locale = 'ru' AND
      title_ru IS NOT NULL AND length(trim(title_ru)) BETWEEN 1 AND 200 AND
      excerpt_ru IS NOT NULL AND length(trim(excerpt_ru)) BETWEEN 1 AND 500 AND
      content_ru IS NOT NULL AND length(trim(content_ru)) >= 1
    ) OR (
      source_locale = 'en' AND
      title_en IS NOT NULL AND length(trim(title_en)) BETWEEN 1 AND 200 AND
      excerpt_en IS NOT NULL AND length(trim(excerpt_en)) BETWEEN 1 AND 500 AND
      content_en IS NOT NULL AND length(trim(content_en)) >= 1
    )
  );

-- Constraint B: Optional Armenian translation check (all NULL/empty OR all 3 present)
ALTER TABLE public.news
  ADD CONSTRAINT news_translation_hy_check CHECK (
    (
      (title_hy IS NULL OR length(trim(title_hy)) = 0) AND
      (excerpt_hy IS NULL OR length(trim(excerpt_hy)) = 0) AND
      (content_hy IS NULL OR length(trim(content_hy)) = 0)
    ) OR (
      title_hy IS NOT NULL AND length(trim(title_hy)) BETWEEN 1 AND 200 AND
      excerpt_hy IS NOT NULL AND length(trim(excerpt_hy)) BETWEEN 1 AND 500 AND
      content_hy IS NOT NULL AND length(trim(content_hy)) >= 1
    )
  );

-- Constraint C: Optional Russian translation check (all NULL/empty OR all 3 present)
ALTER TABLE public.news
  ADD CONSTRAINT news_translation_ru_check CHECK (
    (
      (title_ru IS NULL OR length(trim(title_ru)) = 0) AND
      (excerpt_ru IS NULL OR length(trim(excerpt_ru)) = 0) AND
      (content_ru IS NULL OR length(trim(content_ru)) = 0)
    ) OR (
      title_ru IS NOT NULL AND length(trim(title_ru)) BETWEEN 1 AND 200 AND
      excerpt_ru IS NOT NULL AND length(trim(excerpt_ru)) BETWEEN 1 AND 500 AND
      content_ru IS NOT NULL AND length(trim(content_ru)) >= 1
    )
  );

-- Constraint D: Optional English translation check (all NULL/empty OR all 3 present)
ALTER TABLE public.news
  ADD CONSTRAINT news_translation_en_check CHECK (
    (
      (title_en IS NULL OR length(trim(title_en)) = 0) AND
      (excerpt_en IS NULL OR length(trim(excerpt_en)) = 0) AND
      (content_en IS NULL OR length(trim(content_en)) = 0)
    ) OR (
      title_en IS NOT NULL AND length(trim(title_en)) BETWEEN 1 AND 200 AND
      excerpt_en IS NOT NULL AND length(trim(excerpt_en)) BETWEEN 1 AND 500 AND
      content_en IS NOT NULL AND length(trim(content_en)) >= 1
    )
  );
