-- Migration: 20260731000004_add_application_email_and_instructions_to_careers.sql
-- Description: Add application_email and localized application_instructions columns to public.careers.

ALTER TABLE public.careers
  ADD COLUMN IF NOT EXISTS application_email TEXT NULL CHECK (application_email IS NULL OR application_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD COLUMN IF NOT EXISTS application_instructions_hy TEXT NULL,
  ADD COLUMN IF NOT EXISTS application_instructions_ru TEXT NULL,
  ADD COLUMN IF NOT EXISTS application_instructions_en TEXT NULL;

COMMENT ON COLUMN public.careers.application_email IS 'Email address to receive candidate CVs.';
COMMENT ON COLUMN public.careers.application_instructions_hy IS 'Localized application instructions in Armenian.';
COMMENT ON COLUMN public.careers.application_instructions_ru IS 'Localized application instructions in Russian.';
COMMENT ON COLUMN public.careers.application_instructions_en IS 'Localized application instructions in English.';
