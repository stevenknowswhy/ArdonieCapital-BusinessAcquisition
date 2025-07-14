# 🚀 Execute CMS Data Population - SQL Commands

## 📋 Current Status
- ✅ Categories: 6 categories exist
- ❌ Posts: 0 posts (need 6)
- ❌ Permissions: User needs blog_editor role

## 🎯 SQL Commands to Execute

### **Command 1: Fix User Permissions**
Copy and paste this into Supabase SQL Editor:

```sql
-- Update user permissions for content creation
UPDATE profiles 
SET 
    role = 'blog_editor',
    first_name = 'Content',
    last_name = 'Manager',
    updated_at = NOW()
WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com'
);

-- Create profile if it doesn't exist
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

**Expected Result**: "1 row affected" (either UPDATE or INSERT)

### **Command 2: Insert Blog Posts**
Copy the ENTIRE content from `cms-data-population-script.sql` starting from line 64 (the `DO $$` block) to the end of the file.

**Important**: This is a large block that includes all 6 blog posts. Make sure to copy the complete DO block.

**Expected Result**: "6 rows affected" for blog posts insertion

### **Command 3: Verify Data Population**
Run this to check the results:

```sql
-- Check posts count
SELECT COUNT(*) as post_count FROM content_pages;

-- Check user role
SELECT p.role, au.email 
FROM profiles p 
JOIN auth.users au ON p.user_id = au.id 
WHERE au.email = 'reforiy538@iamtile.com';

-- List all posts with categories
SELECT 
    cp.title,
    bc.name as category_name,
    cp.status
FROM content_pages cp
LEFT JOIN blog_categories bc ON cp.category_id = bc.id
ORDER BY cp.created_at DESC;
```

**Expected Results**:
- post_count: 6
- role: blog_editor
- 6 posts listed with their categories

---

## 🔍 After SQL Execution

### **Step 1: Test Verification**
Open: http://localhost:8000/cms-verification-test.html

**Expected Results**:
- ✅ Service Initialization: Working
- ✅ Categories Exist: 6 categories found
- ✅ Posts Exist: 6+ posts found ← **This should change from 0**
- ✅ Category Filtering: Working
- ✅ Search Functionality: Finds content ← **This should now work**
- ✅ Content Creation: Permissions working ← **This should be fixed**

### **Step 2: Test Frontend**
1. **Blog Index**: http://localhost:8000/blog/index.html
   - Should display 6 blog posts
   - Category filtering should work

2. **Content Dashboard**: http://localhost:8000/dashboard/content-management.html
   - Should show imported posts
   - Content creation should work

---

## 🚨 Troubleshooting

### If User Update Fails:
```sql
-- Check if user exists
SELECT email FROM auth.users WHERE email = 'reforiy538@iamtile.com';
```

### If Posts Don't Insert:
```sql
-- Check if author exists
SELECT p.id, au.email 
FROM profiles p 
JOIN auth.users au ON p.user_id = au.id 
WHERE au.email = 'reforiy538@iamtile.com';
```

### If Still Getting Permission Errors:
```sql
-- Force update role
UPDATE profiles 
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'reforiy538@iamtile.com');
```

---

## 📊 Success Indicators

**Before Execution**:
- Posts: 0
- Content Creation: Permission denied
- Search: No results

**After Successful Execution**:
- Posts: 6
- Content Creation: Working
- Search: Finds imported content
- Verification Test: 100% success rate (6/6 tests passing)

---

## 🎯 Quick Execution Checklist

1. [ ] Open Supabase SQL Editor
2. [ ] Run Command 1 (User Permissions) - Expect "1 row affected"
3. [ ] Run Command 2 (Blog Posts) - Expect "6 rows affected"  
4. [ ] Run Command 3 (Verification) - Check counts and data
5. [ ] Test verification page - Should show 100% success
6. [ ] Test blog frontend - Should display posts

**Estimated Time**: 5-10 minutes  
**Expected Outcome**: Transform from 50% to 100% test success rate
