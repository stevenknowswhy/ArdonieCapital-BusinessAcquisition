-- Avatar Storage Setup for BuyMartV1
-- This script sets up the necessary storage bucket and policies for avatar management
-- Run this in your Supabase SQL Editor to fix the 400 error

-- Step 1: Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Step 4: Create new RLS policies for avatars bucket

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Anyone can view avatars (public read)
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Step 5: Add avatar_url column to profiles table if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 6: Create index on avatar_url for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);

-- Step 7: Verify setup (optional - for debugging)
-- Check if bucket was created
-- SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check if policies were created
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test upload permissions (replace 'your-user-id' with actual user ID)
-- This is just for reference - don't run unless you have a specific user ID to test
-- INSERT INTO storage.objects (bucket_id, name, owner, metadata)
-- VALUES ('avatars', 'your-user-id/test.jpg', 'your-user-id', '{}');

-- Clean up test (if you ran the test above)
-- DELETE FROM storage.objects WHERE name = 'your-user-id/test.jpg';

-- Step 8: Grant necessary permissions (if needed)
-- These are usually set by default, but include for completeness
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- Success message
SELECT 'Avatar storage setup completed successfully!' as status;
