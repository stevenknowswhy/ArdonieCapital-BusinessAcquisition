# Create Auth Users in Supabase Dashboard
## Step-by-Step Guide to Fix Foreign Key Constraint Violation

**Error:** `23503 - foreign key constraint violation on profiles_user_id_fkey`  
**Cause:** Auth users don't exist in `auth.users` table  
**Solution:** Create auth users in Supabase Dashboard with exact UUIDs  

---

## 🚨 **Problem Explanation**

### **What Happened:**
The test user profile creation script failed because it tried to create profile records that reference auth.users entries that don't exist yet.

### **Foreign Key Constraint:**
```sql
profiles.user_id → auth.users.id
```

### **Missing Records:**
The script expects these UUIDs to exist in `auth.users`:
- `11111111-1111-1111-1111-111111111001`
- `11111111-1111-1111-1111-111111111002`
- `22222222-2222-2222-2222-222222222001`
- `22222222-2222-2222-2222-222222222002`
- `33333333-3333-3333-3333-333333333001`
- `33333333-3333-3333-3333-333333333002`

---

## ✅ **Step-by-Step Solution**

### **Step 1: Access Supabase Dashboard**
1. **Go to:** [Supabase Dashboard](https://app.supabase.com)
2. **Select:** Your project (`pbydepsqcypwqbicnsco`)
3. **Navigate to:** Authentication → Users (left sidebar)

### **Step 2: Create Each Auth User**

#### **User 1: Free Buyer**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: buyer.free@testuser.ardonie.com
   Password: TestUser123!
   User ID: 11111111-1111-1111-1111-111111111001
   ```
3. **Important:** Check "Auto Confirm User" if available
4. **Click:** "Create User"

#### **User 2: Pro Buyer**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: buyer.pro@testuser.ardonie.com
   Password: TestUser123!
   User ID: 11111111-1111-1111-1111-111111111002
   ```
3. **Check:** "Auto Confirm User" if available
4. **Click:** "Create User"

#### **User 3: Free Seller**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: seller.free@testuser.ardonie.com
   Password: TestUser123!
   User ID: 22222222-2222-2222-2222-222222222001
   ```
3. **Check:** "Auto Confirm User" if available
4. **Click:** "Create User"

#### **User 4: Pro Seller**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: seller.pro@testuser.ardonie.com
   Password: TestUser123!
   User ID: 22222222-2222-2222-2222-222222222002
   ```
3. **Check:** "Auto Confirm User" if available
4. **Click:** "Create User"

#### **User 5: Financial Vendor**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: financial.vendor@testuser.ardonie.com
   Password: TestUser123!
   User ID: 33333333-3333-3333-3333-333333333001
   ```
3. **Check:** "Auto Confirm User" if available
4. **Click:** "Create User"

#### **User 6: Legal Vendor**
1. **Click:** "Add User" button
2. **Fill in the form:**
   ```
   Email: legal.vendor@testuser.ardonie.com
   Password: TestUser123!
   User ID: 33333333-3333-3333-3333-333333333002
   ```
3. **Check:** "Auto Confirm User" if available
4. **Click:** "Create User"

### **Step 3: Verify Auth Users Created**
1. **Check:** All 6 users appear in the Users list
2. **Verify:** UUIDs match exactly (case-sensitive)
3. **Confirm:** Email addresses are correct
4. **Status:** Users should be "Confirmed" (green status)

---

## 🔍 **Verification Steps**

### **Method 1: Supabase Dashboard**
1. **Go to:** Authentication → Users
2. **Check:** All 6 test users are listed
3. **Verify:** Status shows "Confirmed"
4. **Confirm:** UUIDs match exactly

### **Method 2: SQL Verification**
```sql
-- Run this to verify auth users exist:
-- Execute: database/TROUBLESHOOT-AUTH-USERS.sql
```

### **Method 3: Count Check**
```sql
-- Quick count check:
SELECT COUNT(*) as test_users_count 
FROM auth.users 
WHERE email LIKE '%@testuser.ardonie.com';
-- Should return: 6
```

---

## 🔄 **After Creating Auth Users**

### **Step 1: Re-run Troubleshooting Script**
```sql
-- Execute: database/TROUBLESHOOT-AUTH-USERS.sql
-- Should show: ✅ All UUIDs exist
```

### **Step 2: Create Profiles Safely**
```sql
-- Execute: database/PROFILES-TEST-USERS-SAFE.sql
-- This validates auth users exist before creating profiles
```

### **Step 3: Verify Complete Deployment**
```sql
-- Execute: database/VERIFY-TEST-USERS.sql
-- Should show: SUCCESS status
```

---

## 🚨 **Troubleshooting Common Issues**

### **Issue: "User ID already exists"**
**Cause:** UUID is already taken by another user  
**Solution:** 
- Check if the user already exists with that UUID
- Use a different UUID if necessary (update scripts accordingly)
- Delete existing user if it's a test user

### **Issue: "Email already exists"**
**Cause:** Email address is already registered  
**Solution:**
- Check if user already exists with that email
- Delete existing test user if appropriate
- Use a different email pattern if needed

### **Issue: "Invalid UUID format"**
**Cause:** UUID not entered correctly  
**Solution:**
- Copy-paste UUIDs exactly as shown above
- Ensure no extra spaces or characters
- Use lowercase letters in UUID

### **Issue: User created but not confirmed**
**Cause:** Email confirmation required  
**Solution:**
- Check "Auto Confirm User" when creating
- Or manually confirm users in dashboard
- Or disable email confirmation in Auth settings

### **Issue: Cannot access Supabase Dashboard**
**Cause:** Permission or login issues  
**Solution:**
- Verify you're logged into correct Supabase account
- Check project access permissions
- Contact project owner for access

---

## 🎯 **Success Criteria**

The auth user creation is successful when:

1. ✅ **All 6 users visible** in Supabase Dashboard Users list
2. ✅ **UUIDs match exactly** as specified above
3. ✅ **Email addresses correct** with @testuser.ardonie.com domain
4. ✅ **Users confirmed** (green status in dashboard)
5. ✅ **Troubleshooting script passes** all UUID checks
6. ✅ **Profile creation succeeds** without foreign key errors

---

## 📋 **Quick Reference**

### **Auth Users to Create:**
```
1. buyer.free@testuser.ardonie.com (11111111-1111-1111-1111-111111111001)
2. buyer.pro@testuser.ardonie.com (11111111-1111-1111-1111-111111111002)
3. seller.free@testuser.ardonie.com (22222222-2222-2222-2222-222222222001)
4. seller.pro@testuser.ardonie.com (22222222-2222-2222-2222-222222222002)
5. financial.vendor@testuser.ardonie.com (33333333-3333-3333-3333-333333333001)
6. legal.vendor@testuser.ardonie.com (33333333-3333-3333-3333-333333333002)

Password for all: TestUser123!
```

### **Dashboard Path:**
```
Supabase Dashboard → Authentication → Users → Add User
```

### **Verification Scripts:**
```
1. database/TROUBLESHOOT-AUTH-USERS.sql (check auth users)
2. database/PROFILES-TEST-USERS-SAFE.sql (create profiles safely)
3. database/VERIFY-TEST-USERS.sql (verify complete deployment)
```

---

## 🎉 **Next Steps After Success**

Once all auth users are created successfully:

1. ✅ **Create profiles** using the safe script
2. ✅ **Verify deployment** with verification script
3. ✅ **Test authentication** by logging in with test credentials
4. ✅ **Validate dashboards** load correctly for each role
5. ✅ **Test role-based features** and subscription tiers

**Ready to create auth users?** Start with the Supabase Dashboard and follow the steps above! 🚀
