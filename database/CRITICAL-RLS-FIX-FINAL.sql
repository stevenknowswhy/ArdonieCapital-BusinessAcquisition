-- CRITICAL RLS POLICY FIX - FINAL SOLUTION
-- This script resolves ALL infinite recursion and SQL syntax errors
-- Run this in Supabase SQL Editor to fix the critical database issues
-- Project: pbydepsqcypwqbicnsco

-- ============================================================================
-- STEP 1: EMERGENCY DISABLE RLS ON ALL TABLES
-- ============================================================================

-- Disable RLS temporarily to break any existing recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;

-- Enhanced schema tables
ALTER TABLE content_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: DROP ALL EXISTING PROBLEMATIC POLICIES
-- ============================================================================

-- Drop all existing policies that might cause infinite recursion
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "allow_all_select" ON profiles;
DROP POLICY IF EXISTS "allow_own_insert" ON profiles;
DROP POLICY IF EXISTS "allow_own_update" ON profiles;
DROP POLICY IF EXISTS "allow_own_delete" ON profiles;

-- Listings table policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Sellers can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update their own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON listings;

-- Enhanced schema policies
DROP POLICY IF EXISTS "Anyone can view published content" ON content_pages;
DROP POLICY IF EXISTS "Authors can view their own content" ON content_pages;
DROP POLICY IF EXISTS "Authors can create content" ON content_pages;
DROP POLICY IF EXISTS "Authors can update their own content" ON content_pages;
DROP POLICY IF EXISTS "Authors can delete their own content" ON content_pages;
DROP POLICY IF EXISTS "Admins can manage all content" ON content_pages;
DROP POLICY IF EXISTS "content_pages_select_published" ON content_pages;
DROP POLICY IF EXISTS "content_pages_select_own" ON content_pages;
DROP POLICY IF EXISTS "content_pages_insert_auth" ON content_pages;
DROP POLICY IF EXISTS "content_pages_update_own" ON content_pages;
DROP POLICY IF EXISTS "content_pages_delete_admin" ON content_pages;

-- Blog categories policies
DROP POLICY IF EXISTS "Anyone can view active categories" ON blog_categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON blog_categories;
DROP POLICY IF EXISTS "Only admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "blog_categories_select_active" ON blog_categories;
DROP POLICY IF EXISTS "blog_categories_all_editors" ON blog_categories;

-- Documents policies
DROP POLICY IF EXISTS "Anyone can view public documents" ON documents;
DROP POLICY IF EXISTS "Authenticated users can view auth documents" ON documents;
DROP POLICY IF EXISTS "Premium users can view premium documents" ON documents;
DROP POLICY IF EXISTS "Admins can view admin documents" ON documents;
DROP POLICY IF EXISTS "Users can upload documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Admins can manage all documents" ON documents;
DROP POLICY IF EXISTS "documents_select_public" ON documents;
DROP POLICY IF EXISTS "documents_select_own" ON documents;
DROP POLICY IF EXISTS "documents_insert_auth" ON documents;
DROP POLICY IF EXISTS "documents_update_own" ON documents;
DROP POLICY IF EXISTS "documents_delete_own" ON documents;

-- Deals policies
DROP POLICY IF EXISTS "Users can view their deals" ON deals;
DROP POLICY IF EXISTS "Buyers can create deals" ON deals;
DROP POLICY IF EXISTS "Deal participants can update deals" ON deals;
DROP POLICY IF EXISTS "Deal participants can delete deals" ON deals;
DROP POLICY IF EXISTS "Admins can manage all deals" ON deals;
DROP POLICY IF EXISTS "deals_select_involved" ON deals;
DROP POLICY IF EXISTS "deals_insert_auth" ON deals;
DROP POLICY IF EXISTS "deals_update_involved" ON deals;

-- Vendors policies
DROP POLICY IF EXISTS "Anyone can view active vendors" ON vendors;
DROP POLICY IF EXISTS "Authenticated users can view all active vendors" ON vendors;
DROP POLICY IF EXISTS "Vendors can view their own profile" ON vendors;
DROP POLICY IF EXISTS "Users can create vendor profiles" ON vendors;
DROP POLICY IF EXISTS "Vendors can update their own profile" ON vendors;
DROP POLICY IF EXISTS "Vendors can delete their own profile" ON vendors;
DROP POLICY IF EXISTS "Admins can manage all vendors" ON vendors;
DROP POLICY IF EXISTS "vendors_select_active" ON vendors;
DROP POLICY IF EXISTS "vendors_all_own" ON vendors;

-- Vendor reviews policies
DROP POLICY IF EXISTS "Anyone can view vendor reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can create vendor reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON vendor_reviews;
DROP POLICY IF EXISTS "vendor_reviews_select_public" ON vendor_reviews;
DROP POLICY IF EXISTS "vendor_reviews_insert_auth" ON vendor_reviews;
DROP POLICY IF EXISTS "vendor_reviews_update_own" ON vendor_reviews;
DROP POLICY IF EXISTS "vendor_reviews_delete_own" ON vendor_reviews;

-- Drop other table policies
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can update their own matches" ON matches;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;

DROP POLICY IF EXISTS "Users can view their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can save listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can update their own saved listings" ON saved_listings;
DROP POLICY IF EXISTS "Users can delete their own saved listings" ON saved_listings;

DROP POLICY IF EXISTS "Users can view their own search history" ON search_history;
DROP POLICY IF EXISTS "Users can create search history" ON search_history;

DROP POLICY IF EXISTS "Users can view their own analytics" ON analytics_events;
DROP POLICY IF EXISTS "System can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics_events;

-- ============================================================================
-- STEP 3: CREATE SAFE RLS POLICIES (NO INFINITE RECURSION)
-- ============================================================================

-- PROFILES TABLE - Foundation policies (MUST BE FIRST)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Simple, direct policies for profiles table - NO SUBQUERIES TO PROFILES
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_own_insert" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_own_update" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "profiles_own_delete" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================================================

-- Test that profiles table is accessible without recursion
SELECT 'Profiles table test' as test_name, COUNT(*) as count FROM profiles;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- Success message
SELECT 'CRITICAL RLS FIX APPLIED - PHASE 1 COMPLETE' as status;
SELECT 'Next: Run CRITICAL-RLS-FIX-FINAL-PART2.sql to complete the fix' as next_step;
