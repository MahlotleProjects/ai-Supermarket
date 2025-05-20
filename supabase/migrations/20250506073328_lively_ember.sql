/*
  # Add Storage Bucket for Product Images

  1. Changes
    - Create a new storage bucket for product images
    - Set up public access policies
*/

-- Enable storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Allow public access to product images
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'products');

-- Allow authenticated users to delete their uploaded images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');