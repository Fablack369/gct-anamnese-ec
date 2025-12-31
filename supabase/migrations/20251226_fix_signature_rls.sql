-- Migration to fix RLS policies for signature uploads
-- Allowing both 'anon' and 'authenticated' roles to upload and read

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public upload to assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read from assinaturas" ON storage.objects;

-- Create comprehensive Upload Policy (INSERT)
-- Allows both anonymous users (public form) and authenticated users (admins) to upload
CREATE POLICY "Allow comprehensive upload to assinaturas"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'assinaturas');

-- Create comprehensive Read Policy (SELECT)
-- Allows everyone to view the signatures (needed for the admin dashboard and confirmation)
CREATE POLICY "Allow comprehensive read from assinaturas"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assinaturas');

-- Ensure the bucket exists and is public (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assinaturas', 'assinaturas', true)
ON CONFLICT (id) DO UPDATE SET public = true;
