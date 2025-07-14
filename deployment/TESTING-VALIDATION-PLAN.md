# Testing & Validation Plan for BuyMartV1 Production Deployment

## Test User Accounts
- **Buyer Free:** buyer.free@testuser.ardonie.com (Password: gK9.t1|ROnQ52U[)
- **Buyer Pro:** buyer.pro@testuser.ardonie.com  
- **Seller Free:** seller.free@testuser.ardonie.com
- **Seller Pro:** seller.pro@testuser.ardonie.com
- **Financial Vendor:** financial.vendor@testuser.ardonie.com
- **Legal Vendor:** legal.vendor@testuser.ardonie.com

## Phase 1: Authentication & Security Testing (30 minutes)

### 1.1 Multi-Role Authentication
- [ ] **Login Flow:** Test login with each test user account
- [ ] **Role Detection:** Verify correct role assignment and dashboard routing
- [ ] **Session Persistence:** Confirm sessions persist across page refreshes
- [ ] **Logout:** Test logout functionality clears sessions properly
- [ ] **Unauthorized Access:** Verify restricted pages redirect to login

### 1.2 Row Level Security (RLS)
- [ ] **Data Isolation:** Buyer users only see their own deals/chats
- [ ] **Cross-User Access:** Verify users cannot access other users' data
- [ ] **Admin Access:** Test admin users can access appropriate data
- [ ] **API Security:** Test direct API calls respect RLS policies

## Phase 2: Dashboard Functionality Testing (45 minutes)

### 2.1 Buyer Dashboard (buyer.free@testuser.ardonie.com)
- [ ] **KPI Cards:** All statistics load with real data
  - Saved Listings count
  - Active Matches count  
  - Unread Chat count
  - Active Deals count
- [ ] **Real-time Updates:** KPIs update when data changes
- [ ] **Quick Actions:** All buttons navigate to correct pages
- [ ] **Responsive Design:** Dashboard works on mobile/tablet

### 2.2 Sidebar Navigation
- [ ] **Profile Page:** Loads user data from database
- [ ] **Settings Page:** Displays subscription and preferences
- [ ] **Active States:** Current page highlighted correctly
- [ ] **Mobile Menu:** Hamburger menu works on mobile
- [ ] **User Context:** Correct name and role displayed

### 2.3 Free Tier Limitations
- [ ] **Deal Limits:** Free users see max 3 deals with upgrade prompt
- [ ] **Feature Restrictions:** Premium features show upgrade prompts
- [ ] **Subscription Status:** Correct tier displayed in settings

## Phase 3: Chat System Testing (30 minutes)

### 3.1 Chat Functionality
- [ ] **Send Messages:** Users can send messages to each other
- [ ] **Receive Messages:** Real-time message delivery works
- [ ] **Read Receipts:** Read status updates correctly
- [ ] **Conversation List:** Shows recent conversations with previews
- [ ] **Unread Counts:** Badge updates with new messages

### 3.2 Chat Security
- [ ] **Participant Access:** Only conversation participants see messages
- [ ] **Message Privacy:** Users cannot access unauthorized conversations
- [ ] **Real-time Security:** Live updates respect user permissions

## Phase 4: Active Deals Testing (30 minutes)

### 4.1 Deals Management
- [ ] **Deal Display:** Active deals load from database
- [ ] **Deal Details:** Clicking deals shows detailed view
- [ ] **Progress Tracking:** Progress bars reflect actual status
- [ ] **Search/Filter:** Deal filtering works correctly
- [ ] **New Deal:** Button navigates to listings page

### 4.2 Deal Data Integrity
- [ ] **Status Updates:** Deal status changes reflect in UI
- [ ] **Participant Access:** Only deal participants see deal data
- [ ] **Activity Tracking:** Last activity timestamps are accurate

## Phase 5: Express Listings Testing (20 minutes)

### 5.1 Listings Functionality
- [ ] **Listing Display:** Listings load from Supabase database
- [ ] **Search:** Search functionality queries database
- [ ] **Filters:** Price, location, type filters work
- [ ] **Save Listings:** Save/favorite functionality persists
- [ ] **Pagination:** Large result sets paginate correctly

## Phase 6: Performance & Load Testing (15 minutes)

### 6.1 Performance Metrics
- [ ] **Page Load Times:** All pages load under 3 seconds
- [ ] **Database Queries:** No slow queries (check Supabase logs)
- [ ] **Real-time Latency:** Messages deliver within 1 second
- [ ] **Mobile Performance:** Smooth experience on mobile devices

### 6.2 Error Handling
- [ ] **Network Errors:** Graceful handling of connection issues
- [ ] **Database Errors:** Proper error messages for DB failures
- [ ] **Authentication Errors:** Clear messaging for auth failures
- [ ] **Loading States:** Appropriate loading indicators

## Phase 7: Cross-Browser Testing (15 minutes)

### 7.1 Browser Compatibility
- [ ] **Chrome:** Full functionality works
- [ ] **Firefox:** All features operational
- [ ] **Safari:** iOS/macOS compatibility
- [ ] **Edge:** Windows compatibility
- [ ] **Mobile Browsers:** iOS Safari, Chrome Mobile

## Phase 8: Integration Testing (20 minutes)

### 8.1 End-to-End Workflows
- [ ] **Complete Deal Flow:** From listing view to deal creation
- [ ] **Chat Integration:** From deal to messaging seller
- [ ] **Profile Updates:** Changes persist across sessions
- [ ] **Subscription Upgrade:** Settings page upgrade flow

## Automated Testing Scripts

### Database Validation Script
```sql
-- Run after deployment to verify data integrity
SELECT 
    'Profiles' as table_name, COUNT(*) as record_count 
FROM profiles
UNION ALL
SELECT 'Deals', COUNT(*) FROM deals
UNION ALL  
SELECT 'Chat Conversations', COUNT(*) FROM chat_conversations
UNION ALL
SELECT 'Listings', COUNT(*) FROM listings;

-- Verify RLS is working
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
AND tablename IN ('deals', 'chat_conversations', 'chat_messages', 'profiles')
ORDER BY tablename;
```

### Frontend Health Check
```javascript
// Add to dashboard for monitoring
const healthCheck = async () => {
    const checks = {
        supabaseConnection: false,
        authentication: false,
        realTimeConnection: false,
        databaseQueries: false
    };
    
    try {
        // Test Supabase connection
        const { data, error } = await supabase.from('profiles').select('count');
        checks.supabaseConnection = !error;
        
        // Test authentication
        const { data: { user } } = await supabase.auth.getUser();
        checks.authentication = !!user;
        
        // Test real-time
        const channel = supabase.channel('health-check');
        checks.realTimeConnection = channel.state === 'joined';
        
        checks.databaseQueries = checks.supabaseConnection;
        
    } catch (error) {
        console.error('Health check failed:', error);
    }
    
    return checks;
};
```

## Success Criteria
- [ ] All test scenarios pass without critical errors
- [ ] Performance metrics meet targets
- [ ] Security tests confirm proper data isolation
- [ ] Real-time features work reliably
- [ ] Mobile experience is smooth
- [ ] Error handling is graceful

## Failure Response Plan
1. **Critical Issues:** Rollback deployment immediately
2. **Minor Issues:** Document and schedule fixes
3. **Performance Issues:** Optimize queries and caching
4. **Security Issues:** Immediate investigation and patching

## Post-Testing Actions
- [ ] Document any issues found
- [ ] Update user documentation
- [ ] Schedule follow-up testing in 24-48 hours
- [ ] Monitor error logs for 72 hours post-deployment
