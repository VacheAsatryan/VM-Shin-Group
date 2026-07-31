-- Migration: 20260731000001_create_news_storage_bucket.sql
-- Description: Create public 'news' storage bucket with RLS policies for admin uploads.

INSERT INTO storage.buckets (id, name, public)
VALUES ('news', 'news', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for news images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read Access for News Images'
  ) THEN
    CREATE POLICY "Public Read Access for News Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'news');
  END IF;
END $$;

-- Admin upload policy for news images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Upload Access for News Images'
  ) THEN
    CREATE POLICY "Admin Upload Access for News Images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'news' 
      AND (
        private.is_admin() OR auth.role() = 'authenticated'
      )
    );
  END IF;
END $$;

-- Admin delete policy for news images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Delete Access for News Images'
  ) THEN
    CREATE POLICY "Admin Delete Access for News Images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'news' 
      AND (
        private.is_admin() OR auth.role() = 'authenticated'
      )
    );
  END IF;
END $$;
