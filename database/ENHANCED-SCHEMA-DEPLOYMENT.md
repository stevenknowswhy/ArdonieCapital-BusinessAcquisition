# Enhanced Database Schema Deployment Guide
## BuyMartV1 - Content Management & Vendor System

**Created:** January 9, 2025  
**Purpose:** Deploy additional database tables for content management, blog system, and vendor management  
**Prerequisites:** Base schema.sql and rls-policies.sql must be already applied  

---

## Overview

This deployment adds 6 new tables to support:
- ✅ **Content Management System** - Dynamic blog and CMS functionality
- ✅ **Document Management** - File upload and organization system  
- ✅ **Enhanced Deal Tracking** - Comprehensive deal management
- ✅ **Vendor Management** - Service provider directory and reviews

---

## Pre-Deployment Checklist

### 1. Verify Current Schema
Ensure these base tables exist in your Supabase database:
- [ ] `profiles`
- [ ] `listings` 
- [ ] `matches`
- [ ] `messages`
- [ ] `notifications`
- [ ] `saved_listings`
- [ ] `search_history`
- [ ] `analytics_events`

### 2. Backup Current Database
```sql
-- Create a backup before deployment
-- Run this in Supabase SQL Editor
SELECT pg_dump('your_database_name');
```

### 3. Check Supabase Project
- **Project ID:** pbydepsqcypwqbicnsco
- **Project URL:** https://pbydepsqcypwqbicnsco.supabase.co
- **Environment:** Production

---

## Deployment Steps

### Step 1: Deploy Enhanced Schema

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project: **Ardonie Project** (pbydepsqcypwqbicnsco)
3. Go to **SQL Editor**
4. Copy and paste the contents of `database/enhanced-schema.sql`
5. Click **Run** to execute

**Expected Output:**
```
Enhanced database schema applied successfully!
New tables created: content_pages, blog_categories, documents, deals, vendors, vendor_reviews
Next step: Apply RLS policies with enhanced-rls-policies.sql
```

### Step 2: Apply Enhanced RLS Policies

1. In the same SQL Editor
2. Copy and paste the contents of `database/enhanced-rls-policies.sql`
3. Click **Run** to execute

**Expected Output:**
```
Enhanced RLS policies applied successfully!
All new tables now have comprehensive Row Level Security
Next step: Test the policies and deploy to production
```

### Step 3: Verify Deployment

Run this verification query in SQL Editor:
```sql
-- Verify all tables exist
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t 
WHERE table_schema = 'public' 
AND table_name IN (
    'content_pages', 'blog_categories', 'documents', 
    'deals', 'vendors', 'vendor_reviews'
)
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'content_pages', 'blog_categories', 'documents', 
    'deals', 'vendors', 'vendor_reviews'
);
```

**Expected Results:**
- 6 tables should be listed with their column counts
- All tables should show `rowsecurity = true`

---

## New Tables Overview

### 1. content_pages
**Purpose:** Dynamic blog posts and CMS content  
**Key Features:**
- SEO optimization (meta tags, reading time, SEO score)
- Content categorization and tagging
- Draft/published/archived status workflow
- Author attribution and view tracking

### 2. blog_categories  
**Purpose:** Hierarchical blog categorization  
**Key Features:**
- Parent/child category relationships
- Automatic post counting
- Custom colors and icons
- Sort ordering and active status

### 3. documents
**Purpose:** File management and document library  
**Key Features:**
- Access level control (public/authenticated/premium/admin)
- File metadata and versioning
- Download tracking and featured content
- Category and tag organization

### 4. deals (Enhanced)
**Purpose:** Comprehensive deal tracking and management  
**Key Features:**
- Complete deal lifecycle tracking
- Financial terms and timeline management
- Progress tracking with milestones
- Document and note management
- Auto-generated deal numbers

### 5. vendors
**Purpose:** Service provider directory  
**Key Features:**
- Professional verification system
- Performance metrics and ratings
- Service area and specialization tracking
- Availability and pricing information

### 6. vendor_reviews
**Purpose:** Vendor rating and review system  
**Key Features:**
- Verified purchase/service reviews
- Detailed rating breakdown
- Helpful vote tracking
- Deal-linked reviews

---

## Post-Deployment Tasks

### 1. Update Application Configuration

Update `src/shared/services/supabase/supabase.config.js`:
```javascript
// Add new tables to configuration
database: {
    schema: 'public',
    tables: {
        // Existing tables...
        content_pages: 'content_pages',
        blog_categories: 'blog_categories',
        documents: 'documents',
        deals: 'deals',
        vendors: 'vendors',
        vendor_reviews: 'vendor_reviews'
    }
}
```

### 2. Create Sample Data (Optional)

Run sample data insertion for testing:
```sql
-- Insert sample blog category
INSERT INTO blog_categories (name, slug, description, color) 
VALUES ('Business Acquisition', 'business-acquisition', 'Articles about buying and selling businesses', '#3B82F6');

-- Insert sample content page
INSERT INTO content_pages (slug, title, content, status, category_id)
VALUES (
    'test-blog-post',
    'Test Blog Post',
    'This is a test blog post to verify the content management system.',
    'published',
    (SELECT id FROM blog_categories WHERE slug = 'business-acquisition')
);
```

### 3. Test Database Connectivity

Use the existing test script:
```bash
npm run supabase:test
```

### 4. Update Dashboard Services

The dashboard services in `src/features/dashboard/services/` will need to be updated to use the new tables instead of mock data.

---

## Rollback Plan

If issues occur, you can rollback by running:
```sql
-- Drop new tables (in reverse dependency order)
DROP TABLE IF EXISTS vendor_reviews CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS content_pages CASCADE;
DROP TABLE IF EXISTS blog_categories CASCADE;

-- Drop helper functions
DROP FUNCTION IF EXISTS generate_deal_number();
DROP FUNCTION IF EXISTS update_category_post_count();
DROP FUNCTION IF EXISTS set_deal_number();
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS owns_profile(UUID);
DROP FUNCTION IF EXISTS involved_in_deal(UUID);
```

---

## Next Steps After Deployment

1. **Update Dashboard Data Integration** - Connect dashboards to real database
2. **Implement Content Migration** - Migrate static blog posts to database
3. **Create Document Upload System** - Build file upload functionality
4. **Test Real-time Features** - Verify Supabase Realtime works with new tables
5. **Update API Endpoints** - Create CRUD operations for new tables

---

## Support and Troubleshooting

### Common Issues

**Issue:** "relation does not exist" error  
**Solution:** Ensure base schema.sql was applied first

**Issue:** RLS policy errors  
**Solution:** Check that user has proper profile record in profiles table

**Issue:** Foreign key constraint errors  
**Solution:** Verify referenced records exist before inserting

### Getting Help

- Check Supabase Dashboard logs for detailed error messages
- Review the database/README.md for additional setup information
- Verify environment variables are correctly configured

---

## Success Criteria

✅ All 6 new tables created successfully  
✅ RLS policies applied without errors  
✅ Verification queries return expected results  
✅ No existing functionality is broken  
✅ Application configuration updated  

**Deployment Complete!** The enhanced database schema is now ready for content management and vendor system implementation.
