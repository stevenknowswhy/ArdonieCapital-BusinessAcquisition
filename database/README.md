# Ardonie Capital Database Setup

This directory contains the database schema and setup files for the BuyMartV1 project using Supabase.

## Files Overview

- `schema.sql` - Complete database schema with tables, indexes, and triggers
- `rls-policies.sql` - Row Level Security policies for data access control
- `sample-data.sql` - Sample data for testing and development
- `README.md` - This file

## Setup Instructions

### 1. Supabase Project Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project: **Ardonie Project** (ID: pbydepsqcypwqbicnsco)
3. Go to the SQL Editor

### 2. Run Database Schema

1. Copy the contents of `schema.sql`
2. Paste into the Supabase SQL Editor
3. Click "Run" to create all tables, indexes, and triggers

### 3. Apply Row Level Security Policies

1. Copy the contents of `rls-policies.sql`
2. Paste into the Supabase SQL Editor
3. Click "Run" to apply all RLS policies

### 4. Insert Sample Data (Optional)

1. Copy the contents of `sample-data.sql`
2. Paste into the Supabase SQL Editor
3. Click "Run" to insert sample data for testing

**Note:** Sample data uses placeholder UUIDs. In production, these should be replaced with actual Supabase auth.users IDs.

## Database Schema Overview

### Core Tables

- **profiles** - User profile information (extends auth.users)
- **listings** - Business listings for sale
- **matches** - Buyer-seller compatibility matches
- **messages** - Communication between users
- **notifications** - System notifications
- **saved_listings** - User's saved/favorited listings
- **search_history** - User search activity
- **analytics_events** - Application analytics data

### Key Features

- **UUID Primary Keys** - All tables use UUID for better security and scalability
- **Row Level Security** - Comprehensive RLS policies ensure data privacy
- **Automatic Timestamps** - Created/updated timestamps with triggers
- **Enum Types** - Type safety for status fields
- **Indexes** - Optimized for common query patterns
- **Foreign Key Constraints** - Data integrity enforcement

## Security Model

### Row Level Security Policies

1. **Profiles**: Users can view all profiles but only modify their own
2. **Listings**: Public read access for active listings, sellers manage their own
3. **Matches**: Users only see matches involving them
4. **Messages**: Users only see messages they sent or received
5. **Notifications**: Users only see their own notifications
6. **Admin Access**: Admin users have elevated permissions

### Authentication Flow

1. User registers through Supabase Auth
2. Profile is created in `profiles` table
3. RLS policies automatically enforce access control
4. JWT tokens contain user ID for policy evaluation

## Environment Variables

Ensure these are set in your `.env.local` file:

```env
SUPABASE_URL=https://pbydepsqcypwqbicnsco.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Testing the Setup

After running the schema and policies:

1. Test user registration through your application
2. Verify profile creation in the `profiles` table
3. Test RLS policies by attempting unauthorized access
4. Check that triggers update `updated_at` timestamps

## Maintenance

### Regular Tasks

- Monitor query performance using Supabase dashboard
- Review and update RLS policies as features evolve
- Backup critical data regularly
- Monitor storage usage and optimize as needed

### Schema Updates

When updating the schema:

1. Create migration scripts for changes
2. Test migrations on development environment
3. Update RLS policies if table structure changes
4. Document changes in this README

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Check that policies allow the intended access patterns
2. **Foreign Key Violations**: Ensure referenced records exist
3. **Permission Denied**: Verify user authentication and RLS policies
4. **Trigger Failures**: Check that trigger functions are properly defined

### Useful Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- View user sessions
SELECT * FROM auth.sessions;

-- Check table permissions
SELECT * FROM information_schema.table_privileges WHERE table_name = 'profiles';
```

## Support

For issues with the database setup:

1. Check Supabase documentation
2. Review error logs in Supabase dashboard
3. Verify environment variables are correct
4. Test with sample data to isolate issues
