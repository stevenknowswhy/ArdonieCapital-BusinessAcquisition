-- EMERGENCY RLS FIX - Simplified Approach
-- If the previous fix didn't work, this takes a more aggressive approach

-- ============================================================================
-- STEP 1: COMPLETELY DISABLE RLS TEMPORARILY
-- ============================================================================

-- Disable RLS on profiles table completely
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: CREATE THE USER PROFILE DIRECTLY
-- ============================================================================

-- Insert the profile for our specific user
INSERT INTO profiles (
    user_id, 
    first_name, 
    last_name, 
    role, 
    created_at, 
    updated_at
) VALUES (
    'feb2bf0a-e82c-422c-b987-8e2754077f7c',
    'User',
    'Account', 
    'buyer',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Verify the profile was created
SELECT * FROM profiles WHERE user_id = 'feb2bf0a-e82c-422c-b987-8e2754077f7c';

-- ============================================================================
-- STEP 3: RE-ENABLE RLS WITH MINIMAL POLICIES
-- ============================================================================

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create very simple policies that shouldn't cause recursion
CREATE POLICY "allow_all_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "allow_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "allow_own_update" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "allow_own_delete" ON profiles FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: TEST THE FIX
-- ============================================================================

-- Test that we can now access profiles without recursion
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test that our specific user profile exists
SELECT 
    user_id,
    first_name,
    last_name,
    role,
    created_at
FROM profiles 
WHERE user_id = 'feb2bf0a-e82c-422c-b987-8e2754077f7c';

-- Success message
SELECT 'Emergency RLS fix applied! User profile should now be accessible.' as status;

-- ============================================================================
-- ALTERNATIVE: If RLS is still problematic, keep it disabled temporarily
-- ============================================================================

-- Uncomment these lines if you want to keep RLS disabled for now:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- SELECT 'RLS disabled temporarily - user can now access profile' as status;
