# Test Users Deployment Guide
## Fixing Schema Issues and Creating Test Users

**Issue:** Test user creation script failing due to missing columns in `profiles` table  
**Root Cause:** Profiles table schema doesn't match expected structure  
**Solution:** Fix schema first, then create test users correctly  

---

## 🚨 **Problem Analysis**

### **Error Encountered:**
```
ERROR: column "email" does not exist in relation "profiles"
```

### **Root Cause:**
1. **Supabase Architecture:** Email is stored in `auth.users`, not `profiles` table
2. **Missing Columns:** The `profiles` table is missing columns that were supposed to be added by the deployment script
3. **Schema Mismatch:** Test script assumes columns exist that haven't been created yet

### **Key Insight:**
In Supabase:
- **`auth.users`** - Managed by Supabase Auth (email, password, etc.)
- **`profiles`** - Custom user data (user_id references auth.users.id)

---

## ✅ **Step-by-Step Solution**

### **Step 1: Investigate Current Schema**
```sql
-- Execute this first to see what exists:
-- File: database/INVESTIGATE-PROFILES-SCHEMA.sql
```

**Purpose:** Understand what columns currently exist in the `profiles` table

**Expected Output:**
- List of existing columns
- Missing columns that need to be added
- Recommendations for fixes

### **Step 2: Fix Profiles Table Schema**
```sql
-- Execute this to add missing columns:
-- File: database/PROFILES-SCHEMA-FIX.sql
```

**What This Adds:**
- ✅ `business_type` - Type of business user operates
- ✅ `location` - User's location/city
- ✅ `phone` - Contact phone number
- ✅ `subscription_tier_id` - Reference to subscription tier
- ✅ `subscription_status` - Current subscription status
- ✅ `onboarding_completed` - Whether user finished onboarding
- ✅ `onboarding_step` - Current step in onboarding process
- ✅ `company_id` - Reference to company
- ✅ `legacy_role` - Backup of original role
- ✅ `migration_status` - Status of multi-role migration

### **Step 3: Create Auth Users in Supabase Dashboard**

**CRITICAL:** You cannot create `auth.users` via SQL. Use Supabase Dashboard:

1. **Go to:** Supabase Dashboard → Authentication → Users
2. **Click:** "Add User"
3. **Create these users with exact UUIDs:**

```
Email: buyer.free@testuser.ardonie.com
UUID: 11111111-1111-1111-1111-111111111001
Password: TestUser123!

Email: buyer.pro@testuser.ardonie.com
UUID: 11111111-1111-1111-1111-111111111002
Password: TestUser123!

Email: seller.free@testuser.ardonie.com
UUID: 22222222-2222-2222-2222-222222222001
Password: TestUser123!

Email: seller.pro@testuser.ardonie.com
UUID: 22222222-2222-2222-2222-222222222002
Password: TestUser123!

Email: financial.vendor@testuser.ardonie.com
UUID: 33333333-3333-3333-3333-333333333001
Password: TestUser123!

Email: legal.vendor@testuser.ardonie.com
UUID: 33333333-3333-3333-3333-333333333002
Password: TestUser123!
```

### **Step 4: Create Profile Records**
```sql
-- Execute this after auth users are created:
-- File: database/PROFILES-TEST-USERS-FIXED.sql
```

**What This Creates:**
- ✅ Profile records for each auth user
- ✅ User role assignments
- ✅ User sessions with active roles
- ✅ Subscription records
- ✅ Dashboard preferences

---

## 📋 **Complete Deployment Sequence**

### **Phase 1: Schema Investigation**
```bash
# 1. Check current schema
Execute: database/INVESTIGATE-PROFILES-SCHEMA.sql
Review: Output to understand missing columns
```

### **Phase 2: Schema Fixes**
```bash
# 2. Fix profiles table schema
Execute: database/PROFILES-SCHEMA-FIX.sql
Verify: All required columns added successfully
```

### **Phase 3: Auth User Creation**
```bash
# 3. Create auth users (MANUAL STEP)
Location: Supabase Dashboard → Authentication → Users
Action: Create 6 test users with exact UUIDs listed above
Verify: Users appear in auth.users table
```

### **Phase 4: Profile Creation**
```bash
# 4. Create profile records
Execute: database/PROFILES-TEST-USERS-FIXED.sql
Verify: Profiles created and linked to auth users
```

### **Phase 5: Verification**
```bash
# 5. Verify test users work
Test: Login with test credentials
Check: Dashboard routing works correctly
Validate: Role-based features function
```

---

## 🧪 **Test User Credentials**

### **Single-Role Users:**
- **`buyer.free@testuser.ardonie.com`** / `TestUser123!` - Free Buyer
- **`buyer.pro@testuser.ardonie.com`** / `TestUser123!` - Pro Buyer  
- **`seller.free@testuser.ardonie.com`** / `TestUser123!` - Free Seller
- **`seller.pro@testuser.ardonie.com`** / `TestUser123!` - Pro Seller
- **`financial.vendor@testuser.ardonie.com`** / `TestUser123!` - Financial Professional
- **`legal.vendor@testuser.ardonie.com`** / `TestUser123!` - Legal Professional

### **Expected Behavior:**
- **Single-role users** → Direct redirect to role-specific dashboard
- **Free tier users** → Limited features, upgrade prompts
- **Pro tier users** → Full features, advanced tools
- **Vendor users** → Professional service tools and client management

---

## 🔍 **Verification Checklist**

### **Schema Verification:**
- [ ] All required columns exist in `profiles` table
- [ ] Indexes created for performance
- [ ] Default values set for existing users
- [ ] Foreign key constraints working

### **Auth User Verification:**
- [ ] 6 test users created in Supabase Auth
- [ ] Correct UUIDs assigned
- [ ] Passwords set to `TestUser123!`
- [ ] Email addresses match expected pattern

### **Profile Verification:**
- [ ] Profile records created for all test users
- [ ] User roles assigned correctly
- [ ] Subscription tiers set appropriately
- [ ] Company associations established

### **Functionality Verification:**
- [ ] Test users can log in successfully
- [ ] Dashboard routing works for each role
- [ ] Role-based features are accessible
- [ ] Subscription tier restrictions work
- [ ] User sessions maintain state

---

## 🚨 **Troubleshooting**

### **If Schema Fix Fails:**
```sql
-- Check what went wrong:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Look for specific error messages in the output
```

### **If Auth User Creation Fails:**
- Verify UUIDs are exactly as specified
- Check that emails don't already exist
- Ensure password meets Supabase requirements
- Try creating one user at a time

### **If Profile Creation Fails:**
```sql
-- Check if auth users exist:
SELECT id, email FROM auth.users 
WHERE email LIKE '%@testuser.ardonie.com';

-- Check for foreign key constraint errors
-- Ensure companies and subscription_tiers exist
```

### **If Login Fails:**
- Verify email and password are correct
- Check that user is confirmed in Supabase Auth
- Ensure profile record exists for the user
- Test with browser incognito mode

---

## 🧹 **Cleanup Instructions**

### **Remove Test Users:**
```sql
-- Remove profiles (will cascade to related tables)
DELETE FROM profiles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%@testuser.ardonie.com'
);
```

### **Remove Auth Users:**
- Go to Supabase Dashboard → Authentication → Users
- Delete each test user manually
- Or use Supabase Management API

---

## 🎯 **Success Criteria**

The test user deployment is successful when:

1. ✅ **Schema is complete** - All required columns exist in `profiles`
2. ✅ **Auth users created** - 6 test users in Supabase Auth
3. ✅ **Profiles linked** - Profile records reference auth users correctly
4. ✅ **Roles assigned** - User roles and permissions set up
5. ✅ **Login works** - Test users can authenticate successfully
6. ✅ **Dashboards load** - Role-based routing functions correctly
7. ✅ **Features work** - Subscription tiers and role features accessible

**Ready to begin?** Start with `database/INVESTIGATE-PROFILES-SCHEMA.sql` to understand your current schema!
