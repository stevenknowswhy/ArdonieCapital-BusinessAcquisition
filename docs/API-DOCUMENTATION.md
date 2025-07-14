# BuyMartV1 API Documentation
## Role-Based Authentication System

**Version:** 2.0  
**Last Updated:** January 12, 2025  
**Base URL:** `https://pbydepsqcypwqbicnsco.supabase.co`

---

## 🔐 Authentication

### Overview
The BuyMartV1 platform uses Supabase Authentication with a custom role-based access control system. All API calls require proper authentication and role permissions.

### Authentication Flow
1. User authenticates via Supabase Auth
2. User profile and roles are loaded
3. Permissions are calculated based on roles
4. API access is granted based on permissions

### Base Configuration
```javascript
const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

---

## 👤 User Management

### Get Current User
```javascript
const { data: { user }, error } = await supabase.auth.getUser();
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2025-01-12T10:00:00Z"
  }
}
```

### Get User Profile
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "business_type": "auto_repair",
  "location": "Dallas, TX",
  "subscription_status": "active"
}
```

### Update User Profile
```javascript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: "John",
    last_name: "Doe",
    phone: "+1234567890",
    location: "Dallas, TX"
  })
  .eq('user_id', user.id);
```

---

## 🎭 Role Management

### Get User Roles
```javascript
const { data: userRoles, error } = await supabase
  .from('user_roles')
  .select(`
    role_id,
    is_active,
    roles (
      name,
      slug,
      permissions
    )
  `)
  .eq('user_id', user.id)
  .eq('is_active', true);
```

**Response:**
```json
[
  {
    "role_id": "uuid",
    "is_active": true,
    "roles": {
      "name": "Buyer",
      "slug": "buyer",
      "permissions": ["buyer.search.basic", "buyer.listings.save"]
    }
  }
]
```

### Check User Permission
```javascript
// Using role-based auth helper
const hasPermission = roleBasedAuth.hasPermission('buyer.search.basic');
const hasAnyRole = roleBasedAuth.hasAnyRole(['buyer', 'seller']);
const isAdmin = roleBasedAuth.isAdmin();
```

---

## 🏢 Business Listings

### Get Active Listings
```javascript
const { data: listings, error } = await supabase
  .from('listings')
  .select(`
    *,
    profiles (
      first_name,
      last_name,
      business_type
    )
  `)
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Auto Repair Shop - Dallas",
    "description": "Established auto repair business...",
    "price": 250000,
    "location": "Dallas, TX",
    "status": "active",
    "is_express_deal": true,
    "profiles": {
      "first_name": "Jane",
      "last_name": "Smith",
      "business_type": "auto_repair"
    }
  }
]
```

### Create Listing (Seller Only)
```javascript
// Requires 'seller.listings.create' permission
const { data, error } = await supabase
  .from('listings')
  .insert({
    seller_id: profileId,
    title: "Auto Repair Shop",
    description: "Well-established business...",
    price: 250000,
    business_type: "auto_repair",
    location: "Dallas, TX",
    status: "draft"
  });
```

### Update Listing (Owner/Admin Only)
```javascript
const { data, error } = await supabase
  .from('listings')
  .update({
    title: "Updated Title",
    price: 275000,
    status: "active"
  })
  .eq('id', listingId)
  .eq('seller_id', profileId); // RLS ensures ownership
```

---

## 💾 Saved Listings

### Get Saved Listings (Buyer)
```javascript
const { data: savedListings, error } = await supabase
  .from('saved_listings')
  .select(`
    *,
    listings (
      title,
      price,
      location,
      status
    )
  `)
  .eq('buyer_id', profileId)
  .order('created_at', { ascending: false });
```

### Save Listing (Buyer Only)
```javascript
const { data, error } = await supabase
  .from('saved_listings')
  .insert({
    buyer_id: profileId,
    listing_id: listingId,
    notes: "Interested in this property"
  });
```

---

## 💬 Messaging System

### Get Messages
```javascript
const { data: messages, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles!sender_id (first_name, last_name),
    recipient:profiles!recipient_id (first_name, last_name)
  `)
  .or(`sender_id.eq.${profileId},recipient_id.eq.${profileId}`)
  .order('created_at', { ascending: false });
```

### Send Message
```javascript
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: senderProfileId,
    recipient_id: recipientProfileId,
    subject: "Inquiry about listing",
    content: "I'm interested in your business listing...",
    listing_id: listingId // optional
  });
```

---

## 🔔 Notifications

### Get User Notifications
```javascript
const { data: notifications, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', profileId)
  .order('created_at', { ascending: false })
  .limit(20);
```

### Mark Notification as Read
```javascript
const { data, error } = await supabase
  .from('notifications')
  .update({ read: true })
  .eq('id', notificationId)
  .eq('user_id', profileId);
```

---

## 💳 Subscription Management

### Get User Subscription
```javascript
const { data: subscription, error } = await supabase
  .from('user_subscriptions')
  .select(`
    *,
    subscription_tiers (
      name,
      slug,
      price,
      features,
      limits
    )
  `)
  .eq('user_id', user.id)
  .eq('status', 'active')
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "tier_id": "uuid",
  "status": "active",
  "subscription_tiers": {
    "name": "Pro",
    "slug": "pro",
    "price": 29.99,
    "features": ["unlimited_listings", "advanced_search"],
    "limits": {"listings": -1, "searches": -1}
  }
}
```

---

## 📊 Analytics & Search

### Record Analytics Event
```javascript
const { data, error } = await supabase
  .from('analytics_events')
  .insert({
    user_id: profileId,
    event_type: "listing_view",
    event_data: {
      listing_id: listingId,
      source: "search_results"
    }
  });
```

### Save Search History
```javascript
const { data, error } = await supabase
  .from('search_history')
  .insert({
    user_id: profileId,
    search_query: "auto repair Dallas",
    filters: {
      price_min: 100000,
      price_max: 500000,
      location: "Dallas, TX"
    },
    results_count: 15
  });
```

---

## 🛡️ Security & Permissions

### Permission Levels

#### Buyer Permissions
- `buyer.search.basic` - Basic search functionality
- `buyer.listings.save` - Save listings to favorites
- `buyer.inquiries.create` - Send inquiries to sellers
- `buyer.deals.view` - View deal progress
- `buyer.profile.manage` - Manage own profile

#### Seller Permissions
- `seller.listings.create` - Create business listings
- `seller.listings.update` - Update own listings
- `seller.listings.delete` - Delete own listings
- `seller.inquiries.manage` - Manage incoming inquiries
- `seller.deals.manage` - Manage deal pipeline
- `seller.analytics.view` - View listing analytics

#### Admin Permissions
- `admin.users.read` - View user information
- `admin.users.update` - Update user profiles
- `admin.analytics.view` - View system analytics
- `admin.system.configure` - System configuration

### RLS Policy Examples

#### Profiles Table
```sql
-- Users can view all profiles but only update their own
CREATE POLICY "profiles_select_all" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (user_id = auth.uid());
```

#### Listings Table
```sql
-- Anyone can view active listings, sellers can manage their own
CREATE POLICY "listings_select_active" ON listings
    FOR SELECT USING (
        status = 'active' OR 
        seller_id = auth.get_profile_id() OR
        auth.is_admin()
    );
```

---

## 🔧 Helper Functions

### Authentication Helpers
```javascript
// Check if user is authenticated
roleBasedAuth.requireAuthentication();

// Check specific role
roleBasedAuth.requireRole('seller');

// Check permission
roleBasedAuth.requirePermission('seller.listings.create');

// Get authorized dashboard URL
const dashboardUrl = roleBasedAuth.getAuthorizedDashboardUrl();
```

### Database Helpers
```sql
-- Check if user has specific role
SELECT auth.has_role('seller');

-- Check if user has any of specified roles
SELECT auth.has_any_role(ARRAY['buyer', 'seller']);

-- Check if user is admin
SELECT auth.is_admin();

-- Get user's profile ID
SELECT auth.get_profile_id();
```

---

## 📝 Error Handling

### Common Error Codes
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `422` - Validation error
- `500` - Server error

### Error Response Format
```json
{
  "error": {
    "message": "Insufficient permissions",
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "User does not have 'seller.listings.create' permission"
  }
}
```

### Error Handling Example
```javascript
try {
  const { data, error } = await supabase
    .from('listings')
    .insert(listingData);
    
  if (error) {
    throw error;
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle specific error types
  if (error.code === '42501') {
    // RLS policy violation
    alert('Access denied: Insufficient permissions');
  }
}
```

---

## 🚀 Rate Limits

### Current Limits
- **Authentication:** 60 requests/minute
- **Database Operations:** 100 requests/minute
- **File Uploads:** 10 requests/minute

### Best Practices
- Implement client-side caching
- Use pagination for large datasets
- Batch operations when possible
- Handle rate limit errors gracefully

---

**API Version:** 2.0  
**Documentation Updated:** January 12, 2025  
**Support:** support@ardonie.com
