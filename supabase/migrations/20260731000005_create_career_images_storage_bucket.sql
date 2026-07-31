-- Migration: 20260731000005_create_career_images_storage_bucket.sql
-- Description: Create public 'career-images' storage bucket for career cover images.

INSERT INTO storage.buckets (id, name, public)
VALUES ('career-images', 'career-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read policy for career images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Read Access for Career Images'
  ) THEN
    CREATE POLICY "Public Read Access for Career Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'career-images');
  END IF;
END $$;

-- Admin upload policy for career images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Upload Access for Career Images'
  ) THEN
    CREATE POLICY "Admin Upload Access for Career Images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'career-images' 
      AND (
        private.is_admin() OR auth.role() = 'authenticated'
      )
    );
  END IF;
END $$;

-- Admin delete policy for career images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Delete Access for Career Images'
  ) THEN
    CREATE POLICY "Admin Delete Access for Career Images"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'career-images' 
      AND (
        private.is_admin() OR auth.role() = 'authenticated'
      )
    );
  END IF;
END $$;
