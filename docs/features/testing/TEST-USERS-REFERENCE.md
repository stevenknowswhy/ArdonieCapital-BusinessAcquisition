# Test Users Reference Guide
## Multi-Role Database Schema Validation

**Created:** January 12, 2025  
**Purpose:** Comprehensive test user accounts for validating multi-role authentication and dashboard functionality  
**Password:** `TestUser123!` (for all test accounts)  

---

## 🔐 **Quick Login Reference**

### **Single-Role Users (Direct Dashboard Routing)**

#### **Buyers**
- **`buyer.free@testuser.ardonie.com`** - Free Tier, New User (Onboarding Step 2)
  - *Sarah Johnson, Individual Investor, Austin TX*
  - *Tests: Free tier limitations, onboarding flow*

- **`buyer.pro@testuser.ardonie.com`** - Pro Tier, Experienced User
  - *Michael Chen, Private Equity Firm, San Francisco CA*
  - *Tests: Pro features, advanced analytics, unlimited access*

#### **Sellers**
- **`seller.free@testuser.ardonie.com`** - Free Tier, First-time Seller (Onboarding Step 3)
  - *Robert Martinez, Auto Repair Shop, Phoenix AZ*
  - *Tests: Free tier listing limits, seller onboarding*

- **`seller.pro@testuser.ardonie.com`** - Pro Tier, Multi-location Owner
  - *Jennifer Williams, Multi-Location Auto Group, Dallas TX*
  - *Tests: Pro seller features, analytics, priority support*

#### **Vendor Professionals**
- **`financial.vendor@testuser.ardonie.com`** - Financial Professional (CPA/Business Broker)
  - *David Thompson, Thompson Financial Advisory, Chicago IL*
  - *Tests: Financial tools, business valuation, client management*

- **`legal.vendor@testuser.ardonie.com`** - Legal Professional (Business Attorney)
  - *Amanda Rodriguez, Rodriguez Business Law Group, Miami FL*
  - *Tests: Legal tools, contract management, compliance features*

### **Multi-Role Users (Role Selection Interface)**

#### **Buyer + Seller Combination**
- **`buyer.seller@testuser.ardonie.com`** - Business Owner (Buying & Selling)
  - *James Anderson, Auto Service Chain Owner, Atlanta GA*
  - *Tests: Role selection interface, role switching, dual dashboard access*

#### **Buyer + Financial Professional Combination**
- **`buyer.financial@testuser.ardonie.com`** - Investment Advisor + Buyer
  - *Lisa Parker, Investment Advisory & Auto Acquisition, Denver CO*
  - *Tests: Multi-role vendor profile, investment tools, buyer features*

### **Admin Users (Administrative Functions)**

#### **Super Admin**
- **`super.admin@testuser.ardonie.com`** - Platform Super Administrator
  - *Alex Morgan, Platform Administration, Austin TX*
  - *Tests: Full system access, user management, system settings, audit logs*

#### **Company Admin**
- **`company.admin@testuser.ardonie.com`** - Company Administrator
  - *Taylor Davis, Company Management, Austin TX*
  - *Tests: Company-level user management, company settings, limited admin scope*

### **Content Users (Blog/Content Management)**

#### **Blog Editor**
- **`blog.editor@testuser.ardonie.com`** - Content Editor
  - *Morgan Lee, Content Management, Austin TX*
  - *Tests: Full content management, publishing, SEO tools*

#### **Blog Contributor**
- **`blog.contributor@testuser.ardonie.com`** - Content Contributor
  - *Jordan Smith, Content Creation, Remote*
  - *Tests: Draft creation, content editing (no publishing rights)*

---

## 🧪 **Testing Scenarios by Category**

### **1. Authentication Flow Testing**
```
Single-Role Users → Should redirect directly to role-specific dashboard
Multi-Role Users → Should show role selection interface first
Admin Users → Should access admin dashboard with appropriate permissions
Content Users → Should access content management dashboard
```

### **2. Role-Based Dashboard Testing**
```
Buyer Dashboard → Search, saved listings, matches, KPI cards
Seller Dashboard → My listings, inquiries, performance analytics
Vendor Dashboard → Client management, service tools, professional features
Admin Dashboard → User management, system health, audit logs
Content Dashboard → Content creation, publishing queue, analytics
```

### **3. Subscription Tier Testing**
```
Free Tier Users → Limited features, search restrictions, upgrade prompts
Pro Tier Users → Full features, unlimited access, priority support
Feature Access → Test tier-specific functionality and restrictions
```

### **4. Multi-Role Functionality Testing**
```
Role Selection → Interface appears for multi-role users
Role Switching → Can switch roles within dashboard settings
Dashboard Adaptation → UI adapts to selected role
Permissions → Role-specific features and access controls
```

### **5. Vendor Professional Testing**
```
Financial Professionals → Business valuation tools, financial analysis
Legal Professionals → Contract templates, compliance tools
Vendor Profiles → Service listings, credentials, client management
Professional Features → Specialized tools and workflows
```

---

## 📊 **Expected Dashboard Features by Role**

### **Buyer Dashboard**
- ✅ KPI Cards: Saved listings, recent activity, matches
- ✅ Search & Filter: Advanced search with Pro tier
- ✅ Saved Listings: Favorites and watch lists
- ✅ Messages: Communication with sellers
- ✅ Quick Match: AI-powered recommendations

### **Seller Dashboard**
- ✅ KPI Cards: Listing views, inquiries, performance
- ✅ My Listings: Create, edit, manage listings
- ✅ Inquiries: Buyer messages and interest
- ✅ Analytics: Performance metrics (Pro tier)
- ✅ Market Insights: Industry trends and data

### **Vendor Dashboard**
- ✅ KPI Cards: Client pipeline, revenue, reviews
- ✅ Client Management: Contact and project tracking
- ✅ Service Tools: Role-specific professional tools
- ✅ Portfolio: Showcase work and credentials
- ✅ Professional Network: Industry connections

### **Admin Dashboard**
- ✅ User Management: Create, edit, manage users
- ✅ System Health: Platform metrics and monitoring
- ✅ Audit Logs: Security and activity tracking
- ✅ Settings: Platform configuration and controls
- ✅ Analytics: Platform-wide usage statistics

### **Content Dashboard**
- ✅ Content Management: Create, edit, publish content
- ✅ Publishing Queue: Workflow and approval process
- ✅ SEO Tools: Optimization and analytics
- ✅ Content Calendar: Planning and scheduling
- ✅ Performance Metrics: Content engagement stats

---

## 🔄 **Validation Checklist**

### **Authentication & Routing**
- [ ] Single-role users redirect to correct dashboard
- [ ] Multi-role users see role selection interface
- [ ] Role switching works in dashboard settings
- [ ] Session persistence maintains selected role
- [ ] Logout/login preserves user preferences

### **Dashboard Functionality**
- [ ] KPI cards display real data (not mock data)
- [ ] Role-specific features are accessible
- [ ] Navigation adapts to user role
- [ ] Dashboard preferences load correctly
- [ ] Theme and layout settings work

### **Subscription & Access Control**
- [ ] Free tier shows feature limitations
- [ ] Pro tier provides full access
- [ ] Upgrade prompts appear for free users
- [ ] Feature restrictions are enforced
- [ ] Billing information is accessible

### **Multi-Role Features**
- [ ] Role selection interface is intuitive
- [ ] Role switching is seamless
- [ ] Dashboard content adapts to selected role
- [ ] Permissions change with role selection
- [ ] User can access all assigned roles

### **Vendor Professional Features**
- [ ] Vendor profiles display correctly
- [ ] Professional tools are accessible
- [ ] Service categories work properly
- [ ] Client management features function
- [ ] Verification status is displayed

---

## 🧹 **Cleanup Instructions**

### **Remove All Test Users**
```sql
-- Execute this SQL to remove all test users and related data
DELETE FROM profiles WHERE email LIKE '%@testuser.ardonie.com';
-- This will cascade delete all related records automatically
```

### **Verify Cleanup**
```sql
-- Verify all test data has been removed
SELECT COUNT(*) FROM profiles WHERE email LIKE '%@testuser.ardonie.com';
-- Should return 0
```

---

## 📞 **Support & Troubleshooting**

### **If Login Fails**
1. Verify email address is exactly as listed above
2. Ensure password is `TestUser123!` (case-sensitive)
3. Check that test users were created successfully
4. Verify Supabase Auth is configured correctly

### **If Dashboard Doesn't Load**
1. Check browser console for JavaScript errors
2. Verify dashboard files exist and are accessible
3. Confirm role-based routing is implemented
4. Test with different browsers/incognito mode

### **If Features Don't Work**
1. Verify subscription tier is correctly assigned
2. Check role permissions in database
3. Confirm feature flags are properly configured
4. Test with different user roles for comparison

---

**🎯 Ready for comprehensive multi-role system testing!**

Use these test accounts to validate all aspects of your multi-role authentication and dashboard functionality. Each user represents a different testing scenario to ensure complete system validation.

**Remember:** All test users use the same password: `TestUser123!`
