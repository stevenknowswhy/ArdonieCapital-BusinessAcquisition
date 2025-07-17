# 🚨 Search Alerts Schema Deployment Fix

## Problem Diagnosis

**Error**: `42P01: relation 'saved_searches' does not exist`  
**Root Cause**: The original schema file tries to drop RLS policies from a table that doesn't exist yet  
**Location**: Lines 11-14 in `database/saved-searches-schema.sql`

```sql
-- ❌ PROBLEMATIC CODE (tries to drop policies before table exists)
DROP POLICY IF EXISTS "saved_searches_user_read" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_user_insert" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_user_update" ON saved_searches;
DROP POLICY IF EXISTS "saved_searches_user_delete" ON saved_searches;
```

## ✅ Solution: Use Fixed Schema File

I've created a corrected version: `database/saved-searches-schema-fixed.sql`

**Key Fixes**:
1. ✅ Conditional policy cleanup (only if table exists)
2. ✅ Dependency verification (checks for `profiles` table)
3. ✅ Extension enablement (`uuid-ossp`)
4. ✅ Better error handling and logging

## 🔧 Step-by-Step Deployment

### Step 1: Verify Prerequisites

Before deploying, ensure these exist in your Supabase database:

```sql
-- Run this first to check dependencies
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) THEN '✅ profiles table exists' 
    ELSE '❌ profiles table missing' END as profiles_status,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
    ) THEN '✅ uuid-ossp extension enabled' 
    ELSE '❌ uuid-ossp extension missing' END as uuid_status;
```

**Expected Results**:
- ✅ profiles table exists
- ✅ uuid-ossp extension enabled

### Step 2: Deploy Fixed Schema

1. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/pbydepsqcypwqbicnsco
   - Navigate to: SQL Editor

2. **Copy Fixed Schema**:
   - Copy the entire contents of `database/saved-searches-schema-fixed.sql`
   - Paste into the SQL Editor

3. **Execute Schema**:
   - Click "Run" button
   - Watch for success messages in the output

### Step 3: Verify Deployment Success

After running the fixed schema, you should see these messages:

```
NOTICE: Dependencies verified successfully
NOTICE: No existing saved_searches table found - skipping policy cleanup
NOTICE: Sample saved search created for testing
NOTICE: 🎯 SAVED SEARCHES SCHEMA DEPLOYMENT COMPLETE!
NOTICE: ✅ Table: saved_searches created with full RLS policies
NOTICE: ✅ Indexes: Performance indexes created
NOTICE: ✅ Triggers: Auto-timestamp updates enabled
NOTICE: ✅ Security: Row Level Security policies active
NOTICE: ✅ Dependencies: All requirements verified
NOTICE: 📋 Ready for: Search alert functionality implementation
```

### Step 4: Run Verification Queries

The schema includes automatic verification. You should see results like:

```
check_type                | status
--------------------------|------------------
SAVED_SEARCHES_TABLE     | ✅ CREATED
SAVED_SEARCHES_RLS       | ✅ ENABLED
SAVED_SEARCHES_POLICIES  | 4 policies created
SAVED_SEARCHES_INDEXES   | 4 indexes created
SAMPLE_DATA              | 1 sample records created
```

## 🔍 Troubleshooting

### If "profiles table missing" error:

```sql
-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

If `profiles` table is missing, you need to deploy the core schema first:
- Run `database/schema.sql` or `database/enhanced-schema.sql`

### If "uuid-ossp extension missing" error:

```sql
-- Enable the extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### If RLS policies fail:

```sql
-- Check if auth schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';
```

## 🧪 Test the Deployment

After successful deployment, test with:

```sql
-- Test table access
SELECT COUNT(*) FROM saved_searches;

-- Test sample data
SELECT search_name, search_query, filters 
FROM saved_searches 
LIMIT 1;

-- Test RLS policies (should work with authenticated user)
SELECT policy_name, cmd 
FROM information_schema.table_privileges 
WHERE table_name = 'saved_searches';
```

## 🚀 Alternative: Manual Table Creation

If the fixed schema still fails, create the table manually:

```sql
-- 1. Create table first
CREATE TABLE saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_name TEXT NOT NULL,
    search_query TEXT,
    filters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'immediate' CHECK (
        notification_frequency IN ('immediate', 'daily', 'weekly')
    ),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_notification_sent_at TIMESTAMP WITH TIME ZONE,
    total_matches_found INTEGER DEFAULT 0,
    new_matches_since_last_check INTEGER DEFAULT 0,
    max_results_per_notification INTEGER DEFAULT 10,
    min_match_score INTEGER DEFAULT 70,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT saved_searches_user_name_unique UNIQUE(user_id, search_name)
);

-- 2. Enable RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
CREATE POLICY "saved_searches_user_read" ON saved_searches
    FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_searches_user_insert" ON saved_searches
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_searches_user_update" ON saved_searches
    FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_searches_user_delete" ON saved_searches
    FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- 4. Create indexes
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_active ON saved_searches(is_active, last_checked_at) WHERE is_active = TRUE;
```

## ✅ Success Criteria

After deployment, you should be able to:
- ✅ Query `saved_searches` table without errors
- ✅ Insert test records
- ✅ See 4 RLS policies active
- ✅ See 4 indexes created
- ✅ Use the Search Alert functionality in your app

## 📞 Next Steps

Once deployed successfully:
1. Test the production functionality: `tests/search-alerts-production-test.html`
2. Verify the Search Alert UI works in your app
3. Test creating, reading, updating, and deleting alerts

---

**⏰ Estimated Time**: 5-10 minutes  
**Difficulty**: Easy (with fixed schema)  
**Risk**: Low (includes rollback via DROP TABLE)
