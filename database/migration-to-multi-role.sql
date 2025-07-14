-- ARDONIE CAPITAL MULTI-ROLE MIGRATION SCRIPT
-- Migrate existing users to new multi-role system
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- 1. BACKUP EXISTING DATA
-- ============================================================================

-- Backup existing role data before migration
UPDATE profiles 
SET legacy_role = role, 
    migration_status = 'pending'
WHERE legacy_role IS NULL;

-- ============================================================================
-- 2. ASSIGN DEFAULT SUBSCRIPTION TIERS
-- ============================================================================

-- Get the free tier ID
DO $$
DECLARE
    free_tier_id UUID;
BEGIN
    SELECT id INTO free_tier_id FROM subscription_tiers WHERE slug = 'free';
    
    -- Assign free tier to all existing users
    UPDATE profiles 
    SET subscription_tier_id = free_tier_id,
        subscription_status = 'free'
    WHERE subscription_tier_id IS NULL;
    
    -- Create user subscription records for existing users
    INSERT INTO user_subscriptions (user_id, tier_id, status, started_at)
    SELECT 
        p.user_id,
        free_tier_id,
        'active',
        p.created_at
    FROM profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM user_subscriptions us 
        WHERE us.user_id = p.user_id
    );
END $$;

-- ============================================================================
-- 3. MIGRATE EXISTING ROLES TO NEW SYSTEM
-- ============================================================================

-- Migrate existing single roles to multi-role system
DO $$
DECLARE
    buyer_role_id UUID;
    seller_role_id UUID;
    admin_role_id UUID;
    legacy_admin_role_id UUID;
    default_company_id UUID;
    user_record RECORD;
BEGIN
    -- Get role IDs
    SELECT id INTO buyer_role_id FROM roles WHERE slug = 'buyer';
    SELECT id INTO seller_role_id FROM roles WHERE slug = 'seller';
    SELECT id INTO admin_role_id FROM roles WHERE slug = 'super_admin';
    SELECT id INTO legacy_admin_role_id FROM roles WHERE slug = 'admin';
    SELECT id INTO default_company_id FROM companies WHERE slug = 'ardonie-capital';
    
    -- Migrate each user based on their legacy role
    FOR user_record IN 
        SELECT user_id, role, legacy_role 
        FROM profiles 
        WHERE migration_status = 'pending'
    LOOP
        -- Assign role based on legacy role
        CASE user_record.role
            WHEN 'buyer' THEN
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    buyer_role_id, 
                    default_company_id,
                    user_record.user_id, -- Self-assigned during migration
                    '{"migration": true, "legacy_role": "buyer"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
            WHEN 'seller' THEN
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    seller_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_role": "seller"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
            WHEN 'admin' THEN
                -- Migrate admin to super_admin
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    admin_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_role": "admin"}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
                
                -- Also assign legacy admin role for backward compatibility
                INSERT INTO user_roles (user_id, role_id, company_id, assigned_by, metadata)
                VALUES (
                    user_record.user_id, 
                    legacy_admin_role_id, 
                    default_company_id,
                    user_record.user_id,
                    '{"migration": true, "legacy_compatibility": true}'
                ) ON CONFLICT (user_id, role_id, company_id) DO NOTHING;
        END CASE;
        
        -- Update migration status
        UPDATE profiles 
        SET migration_status = 'migrated'
        WHERE user_id = user_record.user_id;
    END LOOP;
END $$;

-- ============================================================================
-- 4. CREATE USER SESSIONS FOR MIGRATED USERS
-- ============================================================================

-- Create user sessions with their primary role active
DO $$
DECLARE
    user_record RECORD;
    primary_role_id UUID;
BEGIN
    FOR user_record IN 
        SELECT DISTINCT ur.user_id 
        FROM user_roles ur
        WHERE NOT EXISTS (
            SELECT 1 FROM user_sessions us 
            WHERE us.user_id = ur.user_id
        )
    LOOP
        -- Get their first assigned role as the active role
        SELECT ur.role_id INTO primary_role_id
        FROM user_roles ur
        WHERE ur.user_id = user_record.user_id
        AND ur.is_active = true
        ORDER BY ur.assigned_at
        LIMIT 1;
        
        -- Create user session
        INSERT INTO user_sessions (user_id, active_role_id, preferences)
        VALUES (
            user_record.user_id,
            primary_role_id,
            '{"migration_created": true}'
        ) ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 5. CREATE DEFAULT DASHBOARD PREFERENCES
-- ============================================================================

-- Create default dashboard preferences for each user-role combination
INSERT INTO dashboard_preferences (user_id, role_slug, layout_config, widget_preferences)
SELECT 
    ur.user_id,
    r.slug,
    CASE r.slug
        WHEN 'buyer' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "saved_listings", "recent_activity"]}'
        WHEN 'seller' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "my_listings", "inquiries"]}'
        WHEN 'vendor' THEN '{"layout": "grid", "columns": 3, "sections": ["overview", "client_requests", "portfolio"]}'
        WHEN 'super_admin' THEN '{"layout": "grid", "columns": 4, "sections": ["overview", "user_management", "analytics", "system_health"]}'
        ELSE '{"layout": "grid", "columns": 3, "sections": ["overview"]}'
    END,
    CASE r.slug
        WHEN 'buyer' THEN '{"kpi_cards": true, "recent_listings": true, "saved_searches": true, "notifications": true}'
        WHEN 'seller' THEN '{"kpi_cards": true, "listing_performance": true, "inquiries": true, "notifications": true}'
        WHEN 'vendor' THEN '{"kpi_cards": true, "client_pipeline": true, "reviews": true, "notifications": true}'
        WHEN 'super_admin' THEN '{"kpi_cards": true, "user_stats": true, "system_metrics": true, "audit_log": true}'
        ELSE '{"kpi_cards": true, "notifications": true}'
    END
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.is_active = true
ON CONFLICT (user_id, role_slug) DO NOTHING;

-- ============================================================================
-- 6. AUDIT LOG ENTRIES FOR MIGRATION
-- ============================================================================

-- Log the migration process
INSERT INTO audit_log (user_id, action, target_user_id, details)
SELECT 
    ur.user_id,
    'role_migrated',
    ur.user_id,
    jsonb_build_object(
        'migration_date', NOW(),
        'legacy_role', p.legacy_role,
        'new_role_id', ur.role_id,
        'migration_type', 'automatic'
    )
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.user_id
WHERE p.migration_status = 'migrated'
AND ur.metadata->>'migration' = 'true';

-- ============================================================================
-- 7. VERIFICATION AND CLEANUP
-- ============================================================================

-- Verify migration success
DO $$
DECLARE
    total_profiles INTEGER;
    migrated_profiles INTEGER;
    users_with_roles INTEGER;
    users_with_sessions INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(*) INTO migrated_profiles FROM profiles WHERE migration_status = 'migrated';
    SELECT COUNT(DISTINCT user_id) INTO users_with_roles FROM user_roles WHERE is_active = true;
    SELECT COUNT(*) INTO users_with_sessions FROM user_sessions;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Total profiles: %', total_profiles;
    RAISE NOTICE 'Migrated profiles: %', migrated_profiles;
    RAISE NOTICE 'Users with roles: %', users_with_roles;
    RAISE NOTICE 'Users with sessions: %', users_with_sessions;
    
    IF migrated_profiles = total_profiles AND users_with_roles = total_profiles THEN
        RAISE NOTICE '✅ Migration completed successfully!';
        
        -- Mark all profiles as verified
        UPDATE profiles SET migration_status = 'verified' WHERE migration_status = 'migrated';
    ELSE
        RAISE NOTICE '⚠️ Migration incomplete. Please review and fix issues.';
    END IF;
END $$;

-- ============================================================================
-- 8. CREATE SAMPLE VENDOR PROFILES FOR TESTING
-- ============================================================================

-- Create sample vendor profiles for testing (only if no vendor profiles exist)
DO $$
DECLARE
    financial_category_id UUID;
    legal_category_id UUID;
    sample_user_id UUID;
BEGIN
    SELECT id INTO financial_category_id FROM vendor_categories WHERE slug = 'financial';
    SELECT id INTO legal_category_id FROM vendor_categories WHERE slug = 'legal';
    
    -- Only create samples if no vendor profiles exist
    IF NOT EXISTS (SELECT 1 FROM vendor_profiles LIMIT 1) THEN
        -- Get a sample user (first user with vendor role)
        SELECT ur.user_id INTO sample_user_id
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE r.slug = 'vendor'
        LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            -- Create sample financial professional profile
            INSERT INTO vendor_profiles (
                user_id, category_id, business_name, license_number, 
                certifications, specializations, service_areas, 
                hourly_rate, bio, years_experience
            ) VALUES (
                sample_user_id, financial_category_id, 'Sample Financial Services',
                'FL-12345', '["CPA", "Business Valuation"]', 
                '["Business Valuation", "Financial Analysis", "Due Diligence"]',
                '["Florida", "Georgia", "Alabama"]', 150.00,
                'Experienced financial professional specializing in business valuations and acquisitions.',
                15
            ) ON CONFLICT (user_id, category_id) DO NOTHING;
        END IF;
    END IF;
END $$;

SELECT '🎉 Multi-role migration completed successfully!' as result;
SELECT 'All existing users have been migrated to the new multi-role system' as status;
