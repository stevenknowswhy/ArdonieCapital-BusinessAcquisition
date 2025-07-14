# Post-Deployment Monitoring Plan for BuyMartV1

## 🚨 Critical Monitoring (First 72 Hours)

### 1. System Health Monitoring

#### Real-time Dashboards to Monitor:
```bash
# Supabase Dashboard Metrics:
- Database connections (should be < 50% of limit)
- API requests per minute (baseline establishment)
- Authentication success rate (should be > 95%)
- Real-time connections (chat/deals updates)
- Error rates (should be < 1%)

# Hostinger Control Panel:
- Server resource usage (CPU < 80%, Memory < 85%)
- Bandwidth usage
- SSL certificate status
- Uptime monitoring
```

#### Automated Health Checks:
```javascript
// Add to main dashboard - runs every 5 minutes
const systemHealthCheck = async () => {
    const healthStatus = {
        timestamp: new Date().toISOString(),
        supabaseConnection: false,
        authenticationWorking: false,
        realTimeActive: false,
        databaseResponsive: false,
        pageLoadTime: 0
    };
    
    try {
        // Test Supabase connection
        const startTime = performance.now();
        const { data, error } = await supabase.from('profiles').select('count');
        const endTime = performance.now();
        
        healthStatus.supabaseConnection = !error;
        healthStatus.databaseResponsive = (endTime - startTime) < 2000; // Under 2 seconds
        
        // Test authentication
        const { data: { user } } = await supabase.auth.getUser();
        healthStatus.authenticationWorking = true; // No error means auth is working
        
        // Test real-time
        const channel = supabase.channel('health-monitor');
        healthStatus.realTimeActive = channel.state !== 'closed';
        
        // Log to monitoring system
        console.log('Health Check:', healthStatus);
        
        // Send to external monitoring if configured
        if (window.MONITORING_ENABLED) {
            await fetch('/api/health-log', {
                method: 'POST',
                body: JSON.stringify(healthStatus)
            });
        }
        
    } catch (error) {
        console.error('Health check failed:', error);
        healthStatus.error = error.message;
    }
    
    return healthStatus;
};

// Run health check every 5 minutes
setInterval(systemHealthCheck, 5 * 60 * 1000);
```

### 2. User Experience Monitoring

#### Key Metrics to Track:
```javascript
// Performance monitoring
const trackPerformance = () => {
    // Page load times
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page Load Time:', loadTime + 'ms');
        
        // Alert if > 5 seconds
        if (loadTime > 5000) {
            console.warn('Slow page load detected:', loadTime);
        }
    });
    
    // Track user interactions
    document.addEventListener('click', (e) => {
        if (e.target.matches('button, a, .clickable')) {
            console.log('User interaction:', e.target.textContent);
        }
    });
    
    // Track JavaScript errors
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', {
            message: e.message,
            filename: e.filename,
            line: e.lineno,
            column: e.colno,
            timestamp: new Date().toISOString()
        });
    });
};
```

### 3. Database Performance Monitoring

#### Supabase Metrics to Watch:
```sql
-- Run these queries daily to monitor database health

-- Check for slow queries (run in Supabase SQL Editor)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 1000  -- Queries taking > 1 second
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check RLS policy performance
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename) as policy_count
FROM pg_tables t 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

## 📈 Ongoing Monitoring (Weekly/Monthly)

### 1. User Analytics

#### Track User Behavior:
```javascript
// User engagement metrics
const trackUserEngagement = () => {
    // Session duration
    const sessionStart = Date.now();
    
    window.addEventListener('beforeunload', () => {
        const sessionDuration = Date.now() - sessionStart;
        localStorage.setItem('lastSessionDuration', sessionDuration);
    });
    
    // Feature usage
    const trackFeatureUsage = (feature) => {
        const usage = JSON.parse(localStorage.getItem('featureUsage') || '{}');
        usage[feature] = (usage[feature] || 0) + 1;
        localStorage.setItem('featureUsage', JSON.stringify(usage));
    };
    
    // Track dashboard sections visited
    document.addEventListener('click', (e) => {
        if (e.target.matches('.dashboard-nav-item')) {
            trackFeatureUsage('navigation_' + e.target.textContent.trim());
        }
    });
};
```

### 2. Business Metrics

#### Key Performance Indicators:
```sql
-- Weekly business metrics (run every Monday)

-- User registration trends
SELECT 
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as new_users,
    COUNT(CASE WHEN user_roles.role = 'buyer' THEN 1 END) as new_buyers,
    COUNT(CASE WHEN user_roles.role = 'seller' THEN 1 END) as new_sellers
FROM profiles 
LEFT JOIN user_roles ON user_roles.user_id = profiles.id
WHERE created_at >= NOW() - INTERVAL '4 weeks'
GROUP BY week
ORDER BY week;

-- Active deals by status
SELECT 
    status,
    COUNT(*) as deal_count,
    AVG(asking_price) as avg_price,
    SUM(asking_price) as total_value
FROM deals 
WHERE created_at >= NOW() - INTERVAL '1 month'
GROUP BY status;

-- Chat activity
SELECT 
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as messages_sent,
    COUNT(DISTINCT sender_id) as active_users
FROM chat_messages 
WHERE created_at >= NOW() - INTERVAL '1 week'
GROUP BY day
ORDER BY day;

-- Subscription conversions
SELECT 
    st.name as tier,
    COUNT(*) as subscriber_count,
    COUNT(CASE WHEN us.created_at >= NOW() - INTERVAL '1 month' THEN 1 END) as new_this_month
FROM user_subscriptions us
JOIN subscription_tiers st ON st.id = us.tier_id
WHERE us.status = 'active'
GROUP BY st.name;
```

## 🚨 Alert Thresholds

### Critical Alerts (Immediate Response Required):
```javascript
const CRITICAL_THRESHOLDS = {
    // System alerts
    errorRate: 5,              // > 5% error rate
    responseTime: 10000,       // > 10 seconds response time
    uptimeBelow: 99,           // < 99% uptime
    
    // Database alerts  
    connectionPoolUsage: 90,   // > 90% connection pool usage
    slowQueryTime: 5000,       // > 5 second query time
    
    // Business alerts
    authFailureRate: 10,       // > 10% auth failure rate
    zeroNewUsers: 24,          // No new users for 24 hours
    chatSystemDown: 5          // Chat down for > 5 minutes
};

// Alert notification system
const sendAlert = (type, message, severity = 'warning') => {
    console.error(`[${severity.toUpperCase()}] ${type}: ${message}`);
    
    // Send to external monitoring service
    if (window.MONITORING_WEBHOOK) {
        fetch(window.MONITORING_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                message,
                severity,
                timestamp: new Date().toISOString(),
                url: window.location.href
            })
        });
    }
};
```

### Warning Alerts (Monitor Closely):
```javascript
const WARNING_THRESHOLDS = {
    errorRate: 2,              // > 2% error rate
    responseTime: 5000,        // > 5 seconds response time
    uptimeBelow: 99.5,         // < 99.5% uptime
    connectionPoolUsage: 70,   // > 70% connection pool usage
    slowQueryTime: 2000,       // > 2 second query time
    authFailureRate: 5,        // > 5% auth failure rate
    lowDiskSpace: 85,          // > 85% disk usage
    highMemoryUsage: 80        // > 80% memory usage
};
```

## 📊 Monitoring Tools Setup

### 1. External Monitoring Services (Recommended):
```bash
# Option 1: UptimeRobot (Free tier available)
- Monitor: https://yourdomain.com
- Check interval: 5 minutes
- Alert methods: Email, SMS

# Option 2: Pingdom
- Full page monitoring
- Performance insights
- Real user monitoring

# Option 3: Google Analytics
- User behavior tracking
- Conversion funnel analysis
- Real-time user monitoring
```

### 2. Custom Monitoring Dashboard:
```html
<!-- Add to admin dashboard -->
<div id="monitoring-dashboard" class="hidden">
    <h3>System Health</h3>
    <div class="metrics-grid">
        <div class="metric">
            <span>Uptime</span>
            <span id="uptime-metric">99.9%</span>
        </div>
        <div class="metric">
            <span>Response Time</span>
            <span id="response-time-metric">1.2s</span>
        </div>
        <div class="metric">
            <span>Active Users</span>
            <span id="active-users-metric">42</span>
        </div>
        <div class="metric">
            <span>Error Rate</span>
            <span id="error-rate-metric">0.1%</span>
        </div>
    </div>
</div>
```

## 📋 Daily Monitoring Checklist

### Morning Check (9 AM):
- [ ] Review overnight error logs
- [ ] Check system uptime status
- [ ] Verify SSL certificate validity
- [ ] Monitor database performance metrics
- [ ] Review user registration numbers
- [ ] Check backup completion status

### Evening Check (6 PM):
- [ ] Review daily user activity
- [ ] Check for any performance degradation
- [ ] Monitor chat system activity
- [ ] Review deal creation/updates
- [ ] Check for any security alerts
- [ ] Verify real-time features working

### Weekly Review (Mondays):
- [ ] Analyze weekly performance trends
- [ ] Review user feedback/support tickets
- [ ] Check for needed security updates
- [ ] Monitor subscription conversions
- [ ] Review and optimize slow queries
- [ ] Plan any necessary maintenance

## 🔧 Maintenance Schedule

### Daily (Automated):
- Database backups
- Log rotation
- Performance metric collection
- Security scan

### Weekly:
- Full system health review
- Performance optimization
- User feedback analysis
- Security patch review

### Monthly:
- Comprehensive security audit
- Database optimization
- User experience analysis
- Feature usage review
- Capacity planning assessment
