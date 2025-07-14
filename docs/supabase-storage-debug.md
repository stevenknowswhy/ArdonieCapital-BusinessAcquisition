# Supabase Storage 400 Error Debugging Guide

## Overview

This guide helps diagnose and fix the 400 error encountered when uploading avatars to Supabase Storage in BuyMartV1.

## Common Causes of 400 Errors

### 1. Missing Storage Bucket

**Symptom**: 400 error with message "Bucket not found"

**Solution**: Create the avatars bucket
```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Row Level Security (RLS) Issues

**Symptom**: 400 error with message "Permission denied" or "RLS policy violation"

**Diagnosis**: Check if RLS policies exist and are correctly configured

**Solution**: Set up proper RLS policies
```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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
```

### 3. Authentication Issues

**Symptom**: 400 error with message "User not authenticated"

**Diagnosis**: Check if user is properly logged in

**Solution**: Verify authentication state
```javascript
const { data: { user }, error } = await supabaseClient.auth.getUser();
if (!user) {
    console.error('User not authenticated');
    // Redirect to login or handle authentication
}
```

### 4. File Path Issues

**Symptom**: 400 error with message "Invalid file path"

**Diagnosis**: Check file naming and path structure

**Solution**: Use proper file naming convention
```javascript
// Correct format: {user_id}/filename
const fileName = `${user.id}/avatar_${timestamp}.${extension}`;

// Avoid special characters, spaces, or invalid paths
```

### 5. File Size/Type Restrictions

**Symptom**: 400 error with message "File too large" or "Invalid file type"

**Solution**: Implement proper validation
```javascript
// Check file size (5MB limit)
if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
}

// Check file type
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
}
```

## Debugging Steps

### Step 1: Check Bucket Existence

```javascript
const { data: buckets, error } = await supabaseClient.storage.listBuckets();
console.log('Available buckets:', buckets);

const avatarBucket = buckets?.find(bucket => bucket.name === 'avatars');
if (!avatarBucket) {
    console.error('Avatars bucket not found');
}
```

### Step 2: Test Authentication

```javascript
const { data: { user }, error } = await supabaseClient.auth.getUser();
console.log('Current user:', user);
console.log('Auth error:', error);
```

### Step 3: Test Upload Permissions

```javascript
// Create a small test file
const testBlob = new Blob(['test'], { type: 'text/plain' });
const testFile = new File([testBlob], 'test.txt');

const testFileName = `${user.id}/test_${Date.now()}.txt`;

const { data, error } = await supabaseClient.storage
    .from('avatars')
    .upload(testFileName, testFile);

console.log('Upload test result:', { data, error });
```

### Step 4: Check RLS Policies

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Check policy details
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%avatar%';
```

### Step 5: Verify Bucket Configuration

```sql
-- Check bucket settings
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Verify bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'avatars';
```

## Error Code Reference

| Error Code | Description | Common Cause |
|------------|-------------|--------------|
| 400 | Bad Request | Invalid parameters, missing bucket, RLS violation |
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | RLS policy denial, insufficient permissions |
| 404 | Not Found | Bucket doesn't exist |
| 413 | Payload Too Large | File exceeds size limit |
| 415 | Unsupported Media Type | Invalid file type |

## Complete Setup Script

Run this script in your Supabase SQL editor to set up avatar storage:

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload their own avatars" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Add avatar_url column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
```

## Testing the Fix

After running the setup script, test the upload functionality:

1. Open the avatar test page: `http://localhost:8000/dashboard/avatar-test.html`
2. Click "Login Test User" to authenticate
3. Click "Test Storage Access" to verify bucket access
4. Click "Test Avatar Upload" to test upload functionality

## UploadThing Fallback

If Supabase Storage continues to have issues, the system will automatically fall back to UploadThing:

1. The AvatarManager detects Supabase Storage availability
2. If unavailable, it switches to UploadThing
3. Upload functionality continues seamlessly
4. Avatar URLs are still stored in the Supabase profiles table

## Monitoring and Logs

Enable debug mode in the AvatarManager to see detailed logs:

```javascript
// In the browser console
window.avatarManager.debugMode = true;
```

This will provide detailed information about:
- Upload provider selection
- File validation results
- Upload progress and errors
- Fallback mechanisms

## Support

If issues persist after following this guide:

1. Check the Supabase Dashboard for error logs
2. Verify your Supabase project settings
3. Test with the avatar test page
4. Review browser console for detailed error messages
5. Consider using UploadThing as the primary provider
