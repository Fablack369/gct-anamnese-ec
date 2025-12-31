-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('assinaturas', 'assinaturas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Grant usage on schema storage
GRANT USAGE ON SCHEMA storage TO anon, authenticated;

-- Drop existing policies to cleanly recreate them
DROP POLICY IF EXISTS "Allow public upload to assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read from assinaturas" ON storage.objects;

-- Create Upload Policy for Anon
CREATE POLICY "Allow public upload to assinaturas"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'assinaturas');

-- Create Read Policy for Anon
CREATE POLICY "Allow public read from assinaturas"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'assinaturas');

-- Create Read Policy for Authenticated
CREATE POLICY "Allow authenticated read from assinaturas"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'assinaturas');
