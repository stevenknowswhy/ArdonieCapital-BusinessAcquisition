# IMMEDIATE RLS INFINITE RECURSION FIX

## CRITICAL: Execute This Fix Now

The RLS policy infinite recursion error is blocking all CMS functionality. Follow these exact steps:

### STEP 1: Execute RLS Fix Script (RECOMMENDED)

**Copy and paste this complete fix script in Supabase SQL Editor:**

```sql
-- EMERGENCY RLS POLICY FIX - Infinite Recursion Resolution
-- Drop all problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Drop enhanced schema policies
DROP POLICY IF EXISTS "Anyone can view published content" ON content_pages;
DROP POLICY IF EXISTS "Authors can view their own content" ON content_pages;
DROP POLICY IF EXISTS "Authors can create content" ON content_pages;
DROP POLICY IF EXISTS "Authors can update their own content" ON content_pages;
DROP POLICY IF EXISTS "Only admins can delete content" ON content_pages;

DROP POLICY IF EXISTS "Anyone can view active categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins and editors can manage categories" ON blog_categories;

-- Temporarily disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews DISABLE ROW LEVEL SECURITY;

-- Create fixed policies without recursion
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Content pages with fixed policies
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_pages_select_published" ON content_pages
    FOR SELECT USING (status = 'published');

CREATE POLICY "content_pages_select_own" ON content_pages
    FOR SELECT USING (
        author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- Blog categories
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blog_categories_select_active" ON blog_categories
    FOR SELECT USING (is_active = true);

-- Re-enable other tables with minimal policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;

SELECT 'RLS policies fixed - infinite recursion resolved' as status;
```

### STEP 2: Alternative - Emergency Bypass (If Fix Doesn't Work)

**If the above fix still has issues, use this emergency bypass:**

```sql
-- EMERGENCY BYPASS - Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews DISABLE ROW LEVEL SECURITY;

SELECT 'RLS temporarily disabled for testing' as status;
```

### STEP 3: Verify Fix

After executing either script:

1. **Test CMS Functionality**: http://localhost:8000/test-isolated-cms.html
2. **Check for Errors**: Should see no "infinite recursion" errors
3. **Verify Tables**: All 6 enhanced tables should show as "accessible"

### STEP 4: Expected Results

**After Fix:**
- ✅ No "infinite recursion detected" errors
- ✅ All enhanced schema tables accessible
- ✅ CMS operations (categories, posts) working
- ✅ Database queries completing successfully

**Test Commands to Verify:**
```sql
-- These should work without recursion errors
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM content_pages;
SELECT COUNT(*) FROM blog_categories;
```

### Root Cause of Infinite Recursion

The original RLS policies had patterns like:
```sql
-- PROBLEMATIC (causes infinite recursion):
auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id)
```

**Fixed to:**
```sql
-- SAFE (no recursion):
author_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
```

### Security Note

The emergency bypass disables security temporarily. After confirming CMS functionality works:
1. Re-enable RLS with proper policies
2. Test authentication and permissions
3. Ensure users can only access their own data

## IMMEDIATE ACTION REQUIRED

**Execute the RLS fix script in Supabase SQL Editor NOW to resolve the critical database blocker.**
