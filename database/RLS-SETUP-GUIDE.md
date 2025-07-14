# Row Level Security (RLS) Setup Guide

This guide walks you through setting up Row Level Security policies in your Supabase database for the Ardonie Capital platform.

## Prerequisites

1. Supabase project created and configured
2. Database schema applied (`schema.sql`)
3. Environment variables configured in your application

## Step 1: Apply Database Schema

1. Open your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to create all tables, indexes, and triggers

## Step 2: Apply RLS Policies

1. In the Supabase SQL Editor
2. Copy and paste the contents of `database/rls-policies.sql`
3. Click "Run" to apply all RLS policies

## Step 3: Verify RLS Setup

### Using the Automated Script

Run the RLS setup verification script:

```bash
node scripts/setup-supabase-rls.js
```

This will:
- Verify RLS is enabled on all tables
- Test basic access patterns
- Generate a detailed report

### Manual Verification

1. **Check RLS Status**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
   AND rowsecurity = true;
   ```

2. **List All Policies**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

## Step 4: Test RLS Policies

### Using the Test Script

Run comprehensive RLS policy tests:

```bash
node scripts/test-rls-policies.js
```

This will test:
- Profile access restrictions
- Listing visibility rules
- Match privacy controls
- Message access controls
- Notification permissions

### Manual Testing

1. **Test Profile Access**
   - Users should see all profiles but only modify their own
   - Verify with different authenticated users

2. **Test Listing Access**
   - All users can view active listings
   - Only sellers can view/modify their own draft listings

3. **Test Match Access**
   - Users only see matches involving them
   - Cannot access other users' matches

## Common RLS Policy Patterns

### User-Owned Data Pattern
```sql
-- Users can only access their own data
CREATE POLICY "Users can access own data" ON table_name
    FOR ALL USING (auth.uid() = user_id);
```

### Public Read, Owner Write Pattern
```sql
-- Anyone can read, only owner can write
CREATE POLICY "Public read access" ON table_name
    FOR SELECT USING (true);

CREATE POLICY "Owner write access" ON table_name
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Role-Based Access Pattern
```sql
-- Different access based on user role
CREATE POLICY "Role-based access" ON table_name
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM profiles 
            WHERE role = 'admin'
        )
    );
```

## Troubleshooting

### Common Issues

1. **"Permission Denied" Errors**
   - Check if RLS is enabled on the table
   - Verify policies exist for the operation
   - Ensure user is properly authenticated

2. **Policies Not Working**
   - Verify policy syntax is correct
   - Check that `auth.uid()` returns expected value
   - Test with different user roles

3. **Performance Issues**
   - Add indexes on columns used in policy conditions
   - Optimize policy queries
   - Consider caching user role information

### Debugging Queries

1. **Check Current User**
   ```sql
   SELECT auth.uid(), auth.role();
   ```

2. **Test Policy Conditions**
   ```sql
   SELECT * FROM profiles WHERE user_id = auth.uid();
   ```

3. **View Policy Execution**
   ```sql
   EXPLAIN (ANALYZE, BUFFERS) 
   SELECT * FROM listings WHERE status = 'active';
   ```

## Security Best Practices

1. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Use specific conditions in policies

2. **Defense in Depth**
   - Combine RLS with application-level checks
   - Validate data on both client and server

3. **Regular Auditing**
   - Review policies regularly
   - Test with different user scenarios
   - Monitor for unauthorized access attempts

4. **Secure Defaults**
   - Enable RLS on all tables by default
   - Require explicit policies for access
   - Use deny-by-default approach

## Policy Maintenance

### Adding New Tables

1. Enable RLS on new tables:
   ```sql
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   ```

2. Create appropriate policies:
   ```sql
   CREATE POLICY "policy_name" ON new_table
       FOR operation USING (condition);
   ```

### Updating Existing Policies

1. Drop old policy:
   ```sql
   DROP POLICY "old_policy_name" ON table_name;
   ```

2. Create new policy:
   ```sql
   CREATE POLICY "new_policy_name" ON table_name
       FOR operation USING (new_condition);
   ```

### Testing Changes

1. Test in development environment first
2. Use the automated test scripts
3. Verify with different user roles
4. Monitor application logs for errors

## Monitoring and Alerts

Set up monitoring for:
- Failed authentication attempts
- Policy violation errors
- Unusual access patterns
- Performance degradation

## Next Steps

After setting up RLS:

1. Test your application thoroughly
2. Set up monitoring and alerting
3. Document any custom policies
4. Train your team on RLS concepts
5. Plan regular security reviews

## Support

For issues with RLS setup:
1. Check Supabase documentation
2. Review error logs in dashboard
3. Test policies with sample data
4. Verify environment configuration
