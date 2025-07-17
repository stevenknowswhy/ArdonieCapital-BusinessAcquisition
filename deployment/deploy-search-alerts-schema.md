# Deploy Search Alerts Schema - IMMEDIATE ACTION REQUIRED

## 🚨 **CRITICAL: Search Alerts Schema Not Deployed**

**Status**: ❌ The `saved_searches` table does not exist in the Supabase database  
**Impact**: Search Alert functionality will fail without this table  
**Action Required**: Deploy the schema immediately

## 📋 **Deployment Instructions**

### **Method 1: Supabase SQL Editor (Recommended)**

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard/project/pbydepsqcypwqbicnsco
   - Navigate to: SQL Editor

2. **Copy and Execute Schema**:
   ```sql
   -- Copy the entire contents of database/saved-searches-schema.sql
   -- and paste into the SQL Editor, then click "Run"
   ```

3. **Verify Deployment**:
   ```sql
   -- Run these verification queries after deployment:
   
   -- Check if table exists
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'saved_searches';
   
   -- Check RLS status
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'saved_searches';
   
   -- Count policies
   SELECT COUNT(*) as policy_count FROM pg_policies 
   WHERE schemaname = 'public' AND tablename = 'saved_searches';
   
   -- Check indexes
   SELECT indexname FROM pg_indexes 
   WHERE schemaname = 'public' AND tablename = 'saved_searches';
   ```

### **Method 2: Automated Deployment Script**

Create and run this deployment script:

```javascript
// deploy-search-alerts.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-key-here'; // Get from Supabase dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deploySearchAlertsSchema() {
    try {
        console.log('🚀 Deploying Search Alerts Schema...');
        
        // Read the schema file
        const schemaSQL = fs.readFileSync('database/saved-searches-schema.sql', 'utf8');
        
        // Execute the schema
        const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
        
        if (error) {
            console.error('❌ Deployment failed:', error);
            return false;
        }
        
        console.log('✅ Search Alerts Schema deployed successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Deployment error:', error);
        return false;
    }
}

deploySearchAlertsSchema();
```

## 🔍 **Post-Deployment Verification**

After deploying the schema, verify it's working:

### **1. Table Structure Verification**
```sql
-- Check table structure
\d saved_searches;

-- Expected columns:
-- id, user_id, search_name, search_query, filters, is_active,
-- notification_frequency, email_notifications, push_notifications,
-- last_checked_at, total_matches_found, etc.
```

### **2. RLS Policies Verification**
```sql
-- Should show 4 policies: read, insert, update, delete
SELECT policyname, cmd, roles FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'saved_searches';
```

### **3. Indexes Verification**
```sql
-- Should show 4 indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE schemaname = 'public' AND tablename = 'saved_searches';
```

### **4. Test Data Insertion**
```sql
-- Test with a sample record (replace with actual user ID)
INSERT INTO saved_searches (
    user_id, 
    search_name, 
    search_query, 
    filters
) VALUES (
    (SELECT id FROM profiles LIMIT 1),
    'Test Alert',
    'technology startup',
    '{"business_type": "Technology"}'::jsonb
);

-- Verify insertion
SELECT * FROM saved_searches WHERE search_name = 'Test Alert';
```

## ⚠️ **Known Dependencies**

The `saved_searches` table requires:
- ✅ `profiles` table (already exists)
- ✅ `uuid_generate_v4()` function (already available)
- ✅ JSONB support (already available)

## 🎯 **Expected Results**

After successful deployment, you should see:
- ✅ `saved_searches` table created
- ✅ 4 RLS policies active
- ✅ 4 performance indexes created
- ✅ Automatic timestamp triggers working
- ✅ Sample data inserted (if included)

## 🚨 **If Deployment Fails**

Common issues and solutions:

1. **Permission Error**: Ensure you're using the service key, not anon key
2. **Table Already Exists**: The schema includes `DROP TABLE IF EXISTS` for safety
3. **RLS Policy Conflicts**: The schema includes `DROP POLICY IF EXISTS` for all policies
4. **Missing Dependencies**: Verify `profiles` table exists first

## 📞 **Support**

If deployment fails:
1. Check Supabase logs in the dashboard
2. Verify database connection
3. Ensure proper permissions
4. Review error messages carefully

---

**⏰ TIMELINE**: This deployment should take 2-3 minutes to complete once executed.
