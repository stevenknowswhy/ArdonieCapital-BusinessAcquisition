# Database Deployment Checklist for BuyMartV1

## Pre-Deployment Verification

### 1. Backup Current Database
```bash
# Create backup before any schema changes
# In Supabase Dashboard: Settings > Database > Backups
# Create manual backup with name: "pre-production-deployment-YYYY-MM-DD"
```

### 2. Verify Current Tables
```sql
-- Check existing tables
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify profiles table exists (critical dependency)
SELECT COUNT(*) FROM profiles;

-- Verify test users exist
SELECT email, first_name, last_name 
FROM profiles 
WHERE email LIKE '%testuser.ardonie.com';
```

## Deployment Steps (Execute in Order)

### Step 1: Security Foundation
**File:** `database/COMPLETE-RLS-SECURITY-FIX.sql`
**Purpose:** Enable RLS and fix function security
**Validation:**
```sql
-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- Verify function security
SELECT routine_name, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

### Step 2: Chat System
**File:** `database/CHAT-SYSTEM-SCHEMA.sql`
**Purpose:** Create chat infrastructure
**Validation:**
```sql
-- Verify chat tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'chat_%';

-- Test chat function
SELECT get_unread_chat_count('00000000-0000-0000-0000-000000000000');
```

### Step 3: Deals System
**File:** `database/DEALS-SYSTEM-SCHEMA.sql`
**Purpose:** Create deals management system
**Validation:**
```sql
-- Verify deals tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'deal%';

-- Test deals function
SELECT get_user_active_deals_count('00000000-0000-0000-0000-000000000000');
```

### Step 4: Sample Data (Optional)
**File:** `database/SAMPLE-DEALS-DATA.sql`
**Purpose:** Create test data for validation
**Validation:**
```sql
-- Verify sample deals created
SELECT business_name, status, asking_price 
FROM deals 
WHERE created_by = (
    SELECT id FROM profiles 
    WHERE email = 'buyer.free@testuser.ardonie.com' 
    LIMIT 1
);
```

## Post-Deployment Verification

### 1. RLS Policy Testing
```sql
-- Test as authenticated user
SET request.jwt.claims TO '{"sub": "user-id-here", "email": "buyer.free@testuser.ardonie.com"}';

-- Verify user can only see their own data
SELECT COUNT(*) FROM deals;
SELECT COUNT(*) FROM chat_conversations;
```

### 2. Function Testing
```sql
-- Test all helper functions
SELECT get_user_active_deals_count(
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1)
);

SELECT get_unread_chat_count(
    (SELECT id FROM profiles WHERE email = 'buyer.free@testuser.ardonie.com' LIMIT 1)
);
```

### 3. Real-time Subscriptions
```sql
-- Verify real-time is enabled
SELECT * FROM pg_publication;
SELECT * FROM pg_replication_slots;
```

## Rollback Plan

### If Issues Occur:
1. **Immediate Rollback:**
   ```sql
   -- Restore from backup created in step 1
   -- In Supabase Dashboard: Settings > Database > Backups > Restore
   ```

2. **Partial Rollback:**
   ```sql
   -- Drop new tables if needed
   DROP TABLE IF EXISTS chat_conversations CASCADE;
   DROP TABLE IF EXISTS chat_messages CASCADE;
   DROP TABLE IF EXISTS deals CASCADE;
   -- etc.
   ```

## Success Criteria
- [ ] All SQL files execute without errors
- [ ] RLS policies are active and working
- [ ] Test users can authenticate and access their data
- [ ] Real-time subscriptions are functional
- [ ] Helper functions return expected results
- [ ] No data loss from existing tables

## Emergency Contacts
- Database Admin: [Your contact]
- Supabase Support: support@supabase.com
- Project Lead: [Your contact]

## Notes
- Execute during low-traffic hours
- Monitor Supabase dashboard for errors
- Keep backup retention for at least 30 days
- Document any custom modifications made during deployment
