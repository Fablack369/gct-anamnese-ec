-- Migration: Secure Signature Storage
-- Priority: CRITICAL
-- Description: Make signatures bucket private and require authentication for access

-- Step 1: Make the bucket private (not publicly accessible)
UPDATE storage.buckets 
SET public = false 
WHERE id = 'assinaturas';

-- Step 2: Drop existing public read policy
DROP POLICY IF EXISTS "Allow comprehensive read from assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from assinaturas" ON storage.objects;

-- Step 3: Create new policy for authenticated users to read signatures
CREATE POLICY "Authenticated users can read signatures"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'assinaturas');

-- Note: Anonymous users can still INSERT (upload) signatures (required for public form)
-- The existing "Allow comprehensive upload to assinaturas" or "Allow public upload to assinaturas" policy handles this
-- No changes needed to upload policies
