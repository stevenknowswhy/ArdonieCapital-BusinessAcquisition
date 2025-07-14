-- MIGRATE EXISTING USERS TO MULTI-ROLE SYSTEM
-- Phase 1: Data migration script to populate new role system
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- SAFETY CHECKS AND PREPARATION
-- ============================================================================

-- Check if migration has already been run
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM profiles WHERE migration_status = 'migrated' LIMIT 1) THEN
        RAISE NOTICE '⚠️  Migration appears to have been run already. Check migration_status column.';
        RAISE NOTICE 'To re-run migration, first reset: UPDATE profiles SET migration_status = ''pending'';';
    ELSE
        RAISE NOTICE '✅ Ready to migrate existing users to multi-role system';
    END IF;
END $$;

-- Backup existing role data
UPDATE profiles 
SET legacy_role = role::text 
WHERE legacy_role IS NULL AND role IS NOT NULL;

-- ============================================================================
-- MIGRATION STEP 1: ASSIGN DEFAULT COMPANY TO EXISTING USERS
-- ============================================================================

-- Assign all existing users to default Ardonie Capital company
UPDATE profiles 
SET company_id = '00000000-0000-0000-0000-000000000001'
WHERE company_id IS NULL;

-- ============================================================================
-- MIGRATION STEP 2: MIGRATE EXISTING ROLES TO NEW SYSTEM
-- ============================================================================

-- Migrate 'admin' role users to Super Admin
INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, assigned_at, metadata)
SELECT 
    p.user_id,
    '10000000-0000-0000-0000-000000000001', -- Super Admin role
    p.company_id,
    p.user_id, -- Self-assigned during migration
    NOW(),
    jsonb_build_object(
        'migration_source', 'legacy_admin',
        'original_role', p.role::text,
        'migrated_at', NOW()
    )
FROM profiles p
WHERE p.role = 'admin' 
AND p.migration_status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role_id = '10000000-0000-0000-0000-000000000001'
);

-- Migrate 'seller' role users to Seller
INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, assigned_at, metadata)
SELECT 
    p.user_id,
    '10000000-0000-0000-0000-000000000004', -- Seller role
    p.company_id,
    p.user_id, -- Self-assigned during migration
    NOW(),
    jsonb_build_object(
        'migration_source', 'legacy_seller',
        'original_role', p.role::text,
        'migrated_at', NOW()
    )
FROM profiles p
WHERE p.role = 'seller' 
AND p.migration_status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role_id = '10000000-0000-0000-0000-000000000004'
);

-- Migrate 'buyer' role users to Buyer
INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, assigned_at, metadata)
SELECT 
    p.user_id,
    '10000000-0000-0000-0000-000000000005', -- Buyer role
    p.company_id,
    p.user_id, -- Self-assigned during migration
    NOW(),
    jsonb_build_object(
        'migration_source', 'legacy_buyer',
        'original_role', p.role::text,
        'migrated_at', NOW()
    )
FROM profiles p
WHERE p.role = 'buyer' 
AND p.migration_status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = p.user_id 
    AND ur.role_id = '10000000-0000-0000-0000-000000000005'
);

-- ============================================================================
-- MIGRATION STEP 3: CREATE USER SESSIONS FOR MIGRATED USERS
-- ============================================================================

-- Create user sessions with their migrated role as active
INSERT INTO user_sessions (user_id, active_role_id, company_id, preferences)
SELECT DISTINCT
    ur.user_id,
    ur.role_id,
    ur.company_id,
    jsonb_build_object(
        'migration_created', true,
        'last_login_role', r.slug,
        'remember_role_preference', true
    )
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN profiles p ON ur.user_id = p.user_id
WHERE p.migration_status = 'pending'
AND NOT EXISTS (
    SELECT 1 FROM user_sessions us 
    WHERE us.user_id = ur.user_id
);

-- ============================================================================
-- MIGRATION STEP 4: UPDATE MIGRATION STATUS
-- ============================================================================

-- Mark users as migrated
UPDATE profiles 
SET 
    migration_status = 'migrated',
    updated_at = NOW()
WHERE migration_status = 'pending'
AND user_id IN (
    SELECT DISTINCT user_id FROM user_roles
);

-- ============================================================================
-- MIGRATION STEP 5: CREATE AUDIT LOG ENTRIES
-- ============================================================================

-- Log migration actions for audit trail
INSERT INTO audit_log (user_id, action, target_user_id, role_id, details)
SELECT 
    ur.user_id,
    'role_migrated',
    ur.user_id,
    ur.role_id,
    jsonb_build_object(
        'migration_batch', 'initial_migration',
        'source_role', p.legacy_role,
        'target_role', r.slug,
        'migration_timestamp', NOW()
    )
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
JOIN roles r ON ur.role_id = r.id
WHERE p.migration_status = 'migrated'
AND ur.metadata->>'migration_source' IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check migration results
SELECT 
    'MIGRATION_SUMMARY' as check_type,
    COUNT(*) as total_users_migrated,
    COUNT(DISTINCT ur.user_id) as users_with_roles,
    COUNT(DISTINCT us.user_id) as users_with_sessions
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN user_sessions us ON p.user_id = us.user_id
WHERE p.migration_status = 'migrated';

-- Show role distribution after migration
SELECT 
    'ROLE_DISTRIBUTION' as check_type,
    r.name as role_name,
    COUNT(ur.user_id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.is_active = true
GROUP BY r.id, r.name
ORDER BY user_count DESC;

-- Show users with their new roles
SELECT 
    'USER_ROLE_MAPPING' as check_type,
    au.email,
    p.legacy_role as original_role,
    r.name as new_role,
    p.migration_status,
    ur.assigned_at
FROM auth.users au
JOIN profiles p ON au.id = p.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
WHERE p.migration_status = 'migrated'
ORDER BY au.email;

-- Check for any users that failed to migrate
SELECT 
    'MIGRATION_FAILURES' as check_type,
    au.email,
    p.role as original_role,
    p.migration_status,
    'No role assigned' as issue
FROM auth.users au
JOIN profiles p ON au.id = p.user_id
WHERE p.migration_status = 'pending'
AND p.role IS NOT NULL;

-- ============================================================================
-- POST-MIGRATION CLEANUP (OPTIONAL)
-- ============================================================================

-- Function to verify migration integrity
CREATE OR REPLACE FUNCTION verify_migration_integrity()
RETURNS TABLE (
    check_name TEXT,
    status TEXT,
    details TEXT
) AS $$
BEGIN
    -- Check 1: All migrated users have roles
    RETURN QUERY
    SELECT 
        'users_have_roles'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END,
        'Users without roles: ' || COUNT(*)::TEXT
    FROM profiles p
    WHERE p.migration_status = 'migrated'
    AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        WHERE ur.user_id = p.user_id AND ur.is_active = true
    );

    -- Check 2: All migrated users have sessions
    RETURN QUERY
    SELECT 
        'users_have_sessions'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END,
        'Users without sessions: ' || COUNT(*)::TEXT
    FROM profiles p
    WHERE p.migration_status = 'migrated'
    AND NOT EXISTS (
        SELECT 1 FROM user_sessions us 
        WHERE us.user_id = p.user_id
    );

    -- Check 3: Role assignments are valid
    RETURN QUERY
    SELECT 
        'valid_role_assignments'::TEXT,
        CASE 
            WHEN COUNT(*) = 0 THEN '✅ PASS'
            ELSE '❌ FAIL'
        END,
        'Invalid role assignments: ' || COUNT(*)::TEXT
    FROM user_roles ur
    WHERE NOT EXISTS (
        SELECT 1 FROM roles r WHERE r.id = ur.role_id
    );

END;
$$ LANGUAGE plpgsql;

-- Run integrity check
SELECT * FROM verify_migration_integrity();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT '🎉 User migration completed successfully!' as result;
SELECT 'All existing users have been migrated to the new multi-role system' as summary;
SELECT 'Next step: Test authentication flow with migrated users' as next_step;

-- Show final statistics
SELECT 
    'FINAL_STATISTICS' as summary,
    (SELECT COUNT(*) FROM profiles WHERE migration_status = 'migrated') as migrated_users,
    (SELECT COUNT(*) FROM user_roles WHERE is_active = true) as active_role_assignments,
    (SELECT COUNT(*) FROM user_sessions) as user_sessions_created,
    (SELECT COUNT(*) FROM audit_log WHERE action = 'role_migrated') as audit_entries_created;
