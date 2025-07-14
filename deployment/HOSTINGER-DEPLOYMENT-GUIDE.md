# Hostinger Production Deployment Guide for BuyMartV1

## Pre-Deployment Preparation

### 1. File Organization & Cleanup
```bash
# Create production-ready file structure
BuyMartV1-Production/
├── index.html                          # Homepage
├── favicon.ico                         # Site favicon
├── assets/                             # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── auth/                               # Authentication pages
│   ├── login.html
│   ├── register.html
│   ├── logout.html
│   └── auth-service-fixed.js
├── dashboard/                          # Dashboard pages
│   ├── buyer-dashboard.html
│   ├── buyer-profile.html
│   ├── buyer-settings.html
│   └── modules/                        # Dashboard modules
├── marketplace/                        # Marketplace features
│   ├── listings.html
│   └── express-listings-supabase-integration.js
├── chat/                              # Chat system
│   └── index.html
├── components/                         # Reusable components
│   ├── main-navigation.js
│   ├── main-footer.js
│   └── navigation-styles.css
├── legal/                             # Legal pages
├── vendor-portal/                     # Vendor pages
└── .htaccess                          # Apache configuration
```

### 2. Environment Configuration
Create production environment variables:

```javascript
// config/production-config.js
const PRODUCTION_CONFIG = {
    SUPABASE_URL: 'https://pbydepsqcypwqbicnsco.supabase.co',
    SUPABASE_ANON_KEY: 'your-production-anon-key',
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    API_BASE_URL: 'https://yourdomain.com',
    CHAT_REALTIME_ENABLED: true,
    ANALYTICS_ENABLED: true
};
```

### 3. Build Process

#### Step 1: Minify and Optimize
```bash
# Minify CSS files
# Compress JavaScript files  
# Optimize images
# Remove development comments and console.logs
```

#### Step 2: Update CDN References
```html
<!-- Replace development CDNs with production versions -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.tailwindcss.com"></script>
```

#### Step 3: Configure .htaccess
```apache
# .htaccess for production
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://pbydepsqcypwqbicnsco.supabase.co wss://pbydepsqcypwqbicnsco.supabase.co"

# Custom error pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
```

## Deployment Steps

### Step 1: Database Deployment
1. **Execute SQL files in Supabase** (follow DATABASE-DEPLOYMENT-CHECKLIST.md)
2. **Verify all schemas are deployed correctly**
3. **Test with sample data**

### Step 2: File Upload to Hostinger
```bash
# Method 1: File Manager (Recommended)
1. Login to Hostinger control panel
2. Navigate to File Manager
3. Go to public_html directory
4. Upload production-ready zip file
5. Extract with folder name: "buymart-production"
6. Move contents to public_html root

# Method 2: FTP Upload
Host: your-domain.com
Username: your-ftp-username
Password: your-ftp-password
Port: 21 (or 22 for SFTP)
```

### Step 3: Domain Configuration
```bash
# DNS Settings (if using custom domain)
A Record: @ -> Your Hostinger IP
CNAME: www -> your-domain.com

# SSL Certificate
# Enable in Hostinger control panel: Security > SSL
# Force HTTPS redirect
```

### Step 4: Environment Variables Setup
```javascript
// Update all config files with production values
// Replace localhost references with production domain
// Update Supabase project references
// Configure error tracking (optional)
```

## Post-Deployment Configuration

### 1. Supabase Production Settings
```bash
# In Supabase Dashboard:
1. Settings > API > URL Configuration
   - Add your production domain to allowed origins
   
2. Authentication > URL Configuration  
   - Site URL: https://yourdomain.com
   - Redirect URLs: https://yourdomain.com/auth/callback
   
3. Settings > Database > Extensions
   - Ensure all required extensions are enabled
   
4. Auth > Providers
   - Configure OAuth providers for production
```

### 2. Performance Optimization
```javascript
// Enable caching in dashboard modules
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes production

// Implement service worker for offline functionality (optional)
// Add performance monitoring
```

### 3. Security Hardening
```bash
# Hostinger Security Settings:
1. Enable ModSecurity
2. Configure IP blocking for suspicious activity  
3. Enable DDoS protection
4. Set up automated backups (daily)
5. Configure SSL monitoring
```

## Monitoring & Maintenance

### 1. Health Monitoring
```javascript
// Add to main dashboard
const monitorHealth = () => {
    // Check Supabase connection
    // Monitor page load times
    // Track JavaScript errors
    // Monitor real-time connection status
};

// Run every 5 minutes
setInterval(monitorHealth, 5 * 60 * 1000);
```

### 2. Error Tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    // Log to external service or Supabase
    console.error('Production Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: new Date().toISOString()
    });
});
```

### 3. Analytics Setup
```html
<!-- Add Google Analytics or similar -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Backup Strategy
```bash
# Automated Backups:
1. Hostinger: Enable daily file backups
2. Supabase: Configure automatic database backups
3. Manual: Weekly full system backup
4. Code: Git repository with production branch

# Backup Schedule:
- Files: Daily at 2 AM
- Database: Every 6 hours  
- Full System: Weekly on Sundays
- Retention: 30 days for daily, 90 days for weekly
```

## Rollback Plan
```bash
# If deployment fails:
1. Immediate: Restore from last known good backup
2. Database: Rollback to pre-deployment snapshot
3. Files: Replace with previous version
4. DNS: Revert to staging if needed

# Rollback triggers:
- Critical functionality broken
- Security vulnerabilities discovered
- Performance degradation > 50%
- User authentication failures
```

## Success Metrics
- [ ] All pages load under 3 seconds
- [ ] SSL certificate active and valid
- [ ] Database connections successful
- [ ] Real-time features operational
- [ ] Authentication working for all user types
- [ ] Mobile responsiveness confirmed
- [ ] Error rates < 1%
- [ ] Uptime > 99.5%

## Post-Deployment Checklist
- [ ] Run full testing suite
- [ ] Monitor error logs for 24 hours
- [ ] Verify SSL certificate
- [ ] Test all user flows
- [ ] Check mobile compatibility
- [ ] Validate performance metrics
- [ ] Confirm backup systems active
- [ ] Update documentation
- [ ] Notify stakeholders of successful deployment
