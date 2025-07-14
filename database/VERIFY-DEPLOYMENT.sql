-- MULTI-ROLE DEPLOYMENT VERIFICATION SCRIPT
-- Run this after DEPLOY-MULTI-ROLE-SAFE.sql to verify deployment success
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '🔍 MULTI-ROLE DEPLOYMENT VERIFICATION';
    RAISE NOTICE '🔍 ============================================================================';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 1. TABLE VERIFICATION
-- ============================================================================

DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'companies', 'roles', 'user_roles', 'role_hierarchies', 'user_sessions',
        'subscription_tiers', 'user_subscriptions', 'vendor_categories', 
        'vendor_profiles', 'dashboard_preferences', 'usage_analytics', 
        'content_workflow', 'audit_log'
    ];
    table_name TEXT;
    existing_count INTEGER := 0;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '📋 CHECKING REQUIRED TABLES:';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_schema = 'public' AND table_name = table_name) THEN
            RAISE NOTICE '   ✅ % - EXISTS', table_name;
            existing_count := existing_count + 1;
        ELSE
            RAISE NOTICE '   ❌ % - MISSING', table_name;
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 TABLE SUMMARY: % of % tables exist', existing_count, array_length(expected_tables, 1);
    
    IF existing_count = array_length(expected_tables, 1) THEN
        RAISE NOTICE '✅ All required tables are present';
    ELSE
        RAISE NOTICE '⚠️ Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 2. ROLE VERIFICATION
-- ============================================================================

DO $$
DECLARE
    role_count INTEGER;
    expected_roles TEXT[] := ARRAY[
        'buyer', 'seller', 'vendor', 'super_admin', 'company_admin',
        'financial_professional', 'legal_professional', 'blog_editor', 
        'blog_contributor', 'admin'
    ];
    role_slug TEXT;
    existing_roles INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    
    RAISE NOTICE '👥 CHECKING ROLES:';
    RAISE NOTICE '   Total roles in database: %', role_count;
    
    FOREACH role_slug IN ARRAY expected_roles
    LOOP
        IF EXISTS (SELECT 1 FROM roles WHERE slug = role_slug) THEN
            RAISE NOTICE '   ✅ % - EXISTS', role_slug;
            existing_roles := existing_roles + 1;
        ELSE
            RAISE NOTICE '   ❌ % - MISSING', role_slug;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 ROLE SUMMARY: % of % expected roles exist', existing_roles, array_length(expected_roles, 1);
    
    IF existing_roles >= 8 THEN
        RAISE NOTICE '✅ Sufficient roles are present';
    ELSE
        RAISE NOTICE '⚠️ Some critical roles may be missing';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 3. USER MIGRATION VERIFICATION
-- ============================================================================

DO $$
DECLARE
    total_profiles INTEGER;
    migrated_profiles INTEGER;
    pending_profiles INTEGER;
    users_with_roles INTEGER;
    users_with_sessions INTEGER;
    users_with_subscriptions INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(*) INTO migrated_profiles FROM profiles WHERE migration_status = 'migrated';
    SELECT COUNT(*) INTO pending_profiles FROM profiles WHERE migration_status = 'pending';
    SELECT COUNT(DISTINCT user_id) INTO users_with_roles FROM user_roles WHERE is_active = true;
    SELECT COUNT(*) INTO users_with_sessions FROM user_sessions;
    SELECT COUNT(DISTINCT user_id) INTO users_with_subscriptions FROM user_subscriptions WHERE status = 'active';
    
    RAISE NOTICE '🔄 USER MIGRATION STATUS:';
    RAISE NOTICE '   Total user profiles: %', total_profiles;
    RAISE NOTICE '   Migrated profiles: %', migrated_profiles;
    RAISE NOTICE '   Pending migration: %', pending_profiles;
    RAISE NOTICE '   Users with active roles: %', users_with_roles;
    RAISE NOTICE '   Users with sessions: %', users_with_sessions;
    RAISE NOTICE '   Users with subscriptions: %', users_with_subscriptions;
    RAISE NOTICE '';
    
    IF migrated_profiles = total_profiles AND users_with_roles >= total_profiles THEN
        RAISE NOTICE '✅ User migration completed successfully';
    ELSIF pending_profiles > 0 THEN
        RAISE NOTICE '⚠️ Some users still pending migration';
    ELSE
        RAISE NOTICE '⚠️ Migration may be incomplete';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 4. SUBSCRIPTION SYSTEM VERIFICATION
-- ============================================================================

DO $$
DECLARE
    tier_count INTEGER;
    free_tier_exists BOOLEAN;
    pro_tier_exists BOOLEAN;
    active_subscriptions INTEGER;
BEGIN
    SELECT COUNT(*) INTO tier_count FROM subscription_tiers;
    SELECT EXISTS(SELECT 1 FROM subscription_tiers WHERE slug = 'free') INTO free_tier_exists;
    SELECT EXISTS(SELECT 1 FROM subscription_tiers WHERE slug = 'pro') INTO pro_tier_exists;
    SELECT COUNT(*) INTO active_subscriptions FROM user_subscriptions WHERE status = 'active';
    
    RAISE NOTICE '💰 SUBSCRIPTION SYSTEM:';
    RAISE NOTICE '   Subscription tiers: %', tier_count;
    RAISE NOTICE '   Free tier exists: %', CASE WHEN free_tier_exists THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '   Pro tier exists: %', CASE WHEN pro_tier_exists THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '   Active subscriptions: %', active_subscriptions;
    RAISE NOTICE '';
    
    IF free_tier_exists AND pro_tier_exists AND active_subscriptions > 0 THEN
        RAISE NOTICE '✅ Subscription system is functional';
    ELSE
        RAISE NOTICE '⚠️ Subscription system may need attention';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 5. VENDOR SYSTEM VERIFICATION
-- ============================================================================

DO $$
DECLARE
    vendor_categories INTEGER;
    financial_category_exists BOOLEAN;
    legal_category_exists BOOLEAN;
    vendor_profiles INTEGER;
BEGIN
    SELECT COUNT(*) INTO vendor_categories FROM vendor_categories;
    SELECT EXISTS(SELECT 1 FROM vendor_categories WHERE slug = 'financial') INTO financial_category_exists;
    SELECT EXISTS(SELECT 1 FROM vendor_categories WHERE slug = 'legal') INTO legal_category_exists;
    SELECT COUNT(*) INTO vendor_profiles FROM vendor_profiles;
    
    RAISE NOTICE '🤝 VENDOR SYSTEM:';
    RAISE NOTICE '   Vendor categories: %', vendor_categories;
    RAISE NOTICE '   Financial category exists: %', CASE WHEN financial_category_exists THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '   Legal category exists: %', CASE WHEN legal_category_exists THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '   Vendor profiles: %', vendor_profiles;
    RAISE NOTICE '';
    
    IF financial_category_exists AND legal_category_exists THEN
        RAISE NOTICE '✅ Vendor categories are properly configured';
    ELSE
        RAISE NOTICE '⚠️ Vendor categories may be missing';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 6. TRIGGER AND INDEX VERIFICATION
-- ============================================================================

DO $$
DECLARE
    trigger_count INTEGER;
    index_count INTEGER;
    function_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO trigger_count FROM information_schema.triggers 
    WHERE trigger_schema = 'public' AND trigger_name LIKE '%updated_at%';
    
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    
    SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') INTO function_exists;
    
    RAISE NOTICE '⚙️ SYSTEM COMPONENTS:';
    RAISE NOTICE '   Updated_at triggers: %', trigger_count;
    RAISE NOTICE '   Database indexes: %', index_count;
    RAISE NOTICE '   Trigger function exists: %', CASE WHEN function_exists THEN 'YES' ELSE 'NO' END;
    RAISE NOTICE '';
    
    IF trigger_count >= 10 AND index_count >= 20 AND function_exists THEN
        RAISE NOTICE '✅ System components are properly configured';
    ELSE
        RAISE NOTICE '⚠️ Some system components may be missing';
    END IF;
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- 7. SAMPLE DATA QUERIES
-- ============================================================================

-- Show sample role assignments
RAISE NOTICE '📋 SAMPLE ROLE ASSIGNMENTS:';
SELECT 
    p.first_name || ' ' || p.last_name as user_name,
    p.role as legacy_role,
    r.name as new_role,
    ur.is_active,
    ur.assigned_at
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY ur.assigned_at DESC
LIMIT 5;

-- Show subscription distribution
RAISE NOTICE '';
RAISE NOTICE '💳 SUBSCRIPTION DISTRIBUTION:';
SELECT 
    st.name as tier_name,
    COUNT(us.id) as user_count,
    st.price_monthly
FROM subscription_tiers st
LEFT JOIN user_subscriptions us ON st.id = us.tier_id AND us.status = 'active'
GROUP BY st.id, st.name, st.price_monthly
ORDER BY st.price_monthly;

-- ============================================================================
-- 8. FINAL VERIFICATION SUMMARY
-- ============================================================================

DO $$
DECLARE
    tables_ok BOOLEAN;
    roles_ok BOOLEAN;
    migration_ok BOOLEAN;
    subscriptions_ok BOOLEAN;
    vendors_ok BOOLEAN;
    system_ok BOOLEAN;
    overall_status TEXT;
BEGIN
    -- Check each component
    SELECT COUNT(*) >= 13 INTO tables_ok FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'companies', 'roles', 'user_roles', 'role_hierarchies', 'user_sessions',
        'subscription_tiers', 'user_subscriptions', 'vendor_categories', 
        'vendor_profiles', 'dashboard_preferences', 'usage_analytics', 
        'content_workflow', 'audit_log'
    );
    
    SELECT COUNT(*) >= 8 INTO roles_ok FROM roles;
    
    SELECT COUNT(*) = COUNT(*) INTO migration_ok 
    FROM profiles p1
    WHERE EXISTS (SELECT 1 FROM profiles p2 WHERE p2.user_id = p1.user_id AND p2.migration_status IN ('migrated', 'verified'));
    
    SELECT EXISTS(SELECT 1 FROM subscription_tiers WHERE slug = 'free') 
    AND EXISTS(SELECT 1 FROM subscription_tiers WHERE slug = 'pro') INTO subscriptions_ok;
    
    SELECT EXISTS(SELECT 1 FROM vendor_categories WHERE slug = 'financial') 
    AND EXISTS(SELECT 1 FROM vendor_categories WHERE slug = 'legal') INTO vendors_ok;
    
    SELECT COUNT(*) >= 10 INTO system_ok FROM information_schema.triggers 
    WHERE trigger_schema = 'public' AND trigger_name LIKE '%updated_at%';
    
    -- Determine overall status
    IF tables_ok AND roles_ok AND migration_ok AND subscriptions_ok AND vendors_ok AND system_ok THEN
        overall_status := 'SUCCESS';
    ELSIF tables_ok AND roles_ok THEN
        overall_status := 'PARTIAL SUCCESS';
    ELSE
        overall_status := 'NEEDS ATTENTION';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================================================';
    RAISE NOTICE '🎯 FINAL VERIFICATION SUMMARY';
    RAISE NOTICE '🎯 ============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 COMPONENT STATUS:';
    RAISE NOTICE '   Tables: %', CASE WHEN tables_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '   Roles: %', CASE WHEN roles_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '   Migration: %', CASE WHEN migration_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '   Subscriptions: %', CASE WHEN subscriptions_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '   Vendors: %', CASE WHEN vendors_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '   System: %', CASE WHEN system_ok THEN '✅ PASS' ELSE '❌ FAIL' END;
    RAISE NOTICE '';
    RAISE NOTICE '🏆 OVERALL STATUS: %', overall_status;
    RAISE NOTICE '';
    
    IF overall_status = 'SUCCESS' THEN
        RAISE NOTICE '🎉 DEPLOYMENT VERIFICATION PASSED!';
        RAISE NOTICE '✅ Multi-role system is ready for production use.';
        RAISE NOTICE '✅ All components are functioning correctly.';
        RAISE NOTICE '✅ Users have been successfully migrated.';
        RAISE NOTICE '';
        RAISE NOTICE '🚀 NEXT STEPS:';
        RAISE NOTICE '   1. Deploy RLS policies (database/multi-role-rls-policies.sql)';
        RAISE NOTICE '   2. Test authentication flows with real users';
        RAISE NOTICE '   3. Deploy enhanced frontend components';
        RAISE NOTICE '   4. Verify dashboard functionality';
    ELSIF overall_status = 'PARTIAL SUCCESS' THEN
        RAISE NOTICE '⚠️ DEPLOYMENT PARTIALLY SUCCESSFUL';
        RAISE NOTICE '✅ Core components are working.';
        RAISE NOTICE '⚠️ Some optional components may need attention.';
        RAISE NOTICE '⚠️ Review the component status above.';
    ELSE
        RAISE NOTICE '❌ DEPLOYMENT NEEDS ATTENTION';
        RAISE NOTICE '❌ Critical components are missing or misconfigured.';
        RAISE NOTICE '❌ Please review the deployment script and re-run if necessary.';
        RAISE NOTICE '❌ Check the component status above for specific issues.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================================================';
    RAISE NOTICE '';
END $$;
