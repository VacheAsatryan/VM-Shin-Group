-- Migration: 20260731000000_add_source_locale_to_news.sql
-- Description: Add source_locale column to public.news table with CHECK constraint.

ALTER TABLE public.news
ADD COLUMN IF NOT EXISTS source_locale TEXT NOT NULL DEFAULT 'hy'
CHECK (source_locale IN ('hy', 'ru', 'en'));

COMMENT ON COLUMN public.news.source_locale IS 'Indicates the primary source language in which the news article was originally authored.';
