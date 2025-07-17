# 🚀 Execute CMS Data Population - Step-by-Step Guide

## 📋 Overview
This guide will walk you through executing the SQL script to populate your CMS with blog content and fix authentication issues.

---

## 🎯 Step 1: Access Supabase Database Console

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Login to your account
   - Select project: `pbydepsqcypwqbicnsco`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query" to create a new SQL query

---

## 📝 Step 2: Execute the SQL Script

### Part 1: Create Blog Categories
Copy and paste this SQL into the Supabase SQL Editor:

```sql
-- Insert blog categories if they don't exist
INSERT INTO blog_categories (id, name, slug, description, color, is_active, created_at, updated_at)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Business Acquisition', 'business-acquisition', 'Guides and insights for acquiring auto repair businesses', '#3b82f6', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Market Analysis', 'market-analysis', 'Market trends and analysis for the auto repair industry', '#10b981', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'Due Diligence', 'due-diligence', 'Due diligence processes and checklists for business buyers', '#f59e0b', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440004', 'Financing', 'financing', 'Financing options and strategies for business acquisition', '#8b5cf6', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440005', 'Legal & Compliance', 'legal-compliance', 'Legal considerations and compliance requirements', '#ef4444', true, NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440006', 'Success Stories', 'success-stories', 'Real success stories from our clients', '#06b6d4', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    updated_at = NOW();
```

**Click "Run" and verify**: Should show "6 rows affected" or similar success message.

### Part 2: Fix User Permissions
Copy and paste this SQL:

```sql
-- Update the existing user's profile to have content creation permissions
UPDATE profiles 
SET 
    role = 'blog_editor',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- If the profile doesn't exist, create it
INSERT INTO profiles (id, user_id, first_name, last_name, role, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    au.id,
    'Content',
    'Manager',
    'blog_editor',
    NOW(),
    NOW()
FROM auth.users au
WHERE au.email = 'reforiy538@iamtile.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = au.id
);
```

**Click "Run" and verify**: Should show "1 row affected" for the UPDATE or INSERT.

### Part 3: Insert Blog Posts
This is the largest part. Copy the entire content from `cms-data-population-script.sql` starting from line 58 (the DO $$ block) to the end.

**Important**: Make sure to copy the entire DO block including all 6 blog posts.

**Click "Run" and verify**: Should show "6 rows affected" for the blog posts insertion.

---

## ✅ Step 3: Verify Data Population

### Option A: Quick Database Check
Run this query in Supabase SQL Editor to verify:

```sql
-- Check categories
SELECT COUNT(*) as category_count FROM blog_categories;

-- Check posts
SELECT COUNT(*) as post_count FROM content_pages;

-- Check user permissions
SELECT role FROM profiles p 
JOIN auth.users au ON p.user_id = au.id 
WHERE au.email = 'reforiy538@iamtile.com';
```

**Expected Results**:
- category_count: 6
- post_count: 6
- role: blog_editor

### Option B: Automated Verification Test
Open the verification test in your browser:
```
http://localhost:8000/cms-verification-test.html
```

**Expected Results**:
- ✅ Service Initialization: Services load successfully
- ✅ Categories Exist: 6 categories found
- ✅ Posts Exist: 6+ posts found
- ✅ Category Filtering: Slug-based filtering works
- ✅ Search Functionality: Content search works
- ✅ Content Creation: Permissions allow content creation

---

## 🎯 Step 4: Test Frontend Integration

### Test Blog Frontend
1. **Blog Index**: http://localhost:8000/blog/index.html
   - Should display the 6 imported blog posts
   - Category filtering should work
   - Search should find content

2. **Dynamic Blog**: http://localhost:8000/blog/dynamic-blog.html
   - Should load posts dynamically from CMS
   - Categories should populate correctly

3. **Content Management**: http://localhost:8000/dashboard/content-management.html
   - Should show the imported posts in the dashboard
   - Content creation should work without permission errors

---

## 🚨 Troubleshooting

### If Categories Already Exist
The script uses `ON CONFLICT` so it will update existing categories safely.

### If User Doesn't Exist
If the user `reforiy538@iamtile.com` doesn't exist in auth.users, you'll need to:
1. Create the user through Supabase Auth
2. Or modify the script to use a different existing user email

### If Posts Don't Insert
Check for:
- Author_id references - make sure the user profile exists
- Category_id references - make sure categories were created first
- Unique constraint violations on slugs

### If Permission Errors Persist
Verify the user role was updated:
```sql
SELECT p.role, au.email 
FROM profiles p 
JOIN auth.users au ON p.user_id = au.id 
WHERE au.email = 'reforiy538@iamtile.com';
```

---

## 📊 Success Indicators

After successful execution, you should see:

### Database Level:
- 6 blog categories in `blog_categories` table
- 6 blog posts in `content_pages` table
- User role updated to `blog_editor`

### Application Level:
- CMS tests show 6+ posts instead of 0
- Category filtering works without UUID errors
- Content creation works without permission errors
- Blog frontend displays imported content

### Frontend Level:
- Blog pages show real content
- Search and filtering work with imported data
- Content management dashboard is functional

---

## 🎉 Next Steps After Success

1. **Test Content Creation**: Try creating a new blog post through the CMS
2. **Test Category Filtering**: Filter posts by different categories
3. **Test Search**: Search for keywords in the imported content
4. **Verify SEO**: Check that meta descriptions and keywords are properly set
5. **Production Ready**: Your CMS is now fully functional with real data

---

**Estimated Time**: 10-15 minutes  
**Difficulty**: Easy (copy/paste SQL queries)  
**Risk Level**: Low (all operations are safe and reversible)
