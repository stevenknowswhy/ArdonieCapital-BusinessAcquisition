# Hostinger Deployment Guide - Ardonie Capital

## Overview
This guide provides step-by-step instructions for deploying the Ardonie Capital business acquisition platform to Hostinger hosting.

## Prerequisites

### 1. Hostinger Account Setup
- Active Hostinger hosting account with cPanel access
- Domain configured and pointing to Hostinger nameservers
- FTP/SFTP credentials from Hostinger control panel

### 2. Local Development Environment
- Git repository cloned locally
- All recent changes committed and tested
- Local HTTP server tested (python3 -m http.server)

## Deployment Methods

### Method 1: File Manager Upload (Recommended for Small Updates)

#### Step 1: Access Hostinger File Manager
1. Log into your Hostinger control panel
2. Navigate to "File Manager"
3. Go to `public_html` directory (or your domain's root folder)

#### Step 2: Prepare Files for Upload
```bash
# Create a clean deployment package
cd /path/to/BuyMartV1
zip -r ardonie-capital-deployment.zip . \
  -x "*.git*" "node_modules/*" "*.DS_Store" "*.log" \
  "scripts/*" "tests/*" "docs/*" "*.md" "deploy.sh" \
  "aws-*" "amplify*" "cloudformation*"
```

#### Step 3: Upload and Extract
1. Upload the zip file to `public_html`
2. Extract the contents
3. Move all files from the extracted folder to `public_html` root
4. Delete the zip file and empty folder

### Method 2: FTP/SFTP Upload (Recommended for Full Deployments)

#### Step 1: Get FTP Credentials
From Hostinger control panel:
- FTP Host: Usually your domain name
- Username: Provided by Hostinger
- Password: Set in control panel
- Port: 21 (FTP) or 22 (SFTP)

#### Step 2: Upload Files via FTP Client
Using FileZilla or similar:
```
Host: ftp.yourdomain.com
Username: [your-ftp-username]
Password: [your-ftp-password]
Port: 21
```

Upload these essential files/folders:
- `index.html` (homepage)
- `for-buyers.html` (fixed page)
- `assets/` (CSS, JS, images)
- `components/` (navigation system)
- All HTML pages
- `favicon.ico`

#### Step 3: Set File Permissions
Ensure proper permissions:
- HTML files: 644
- CSS/JS files: 644
- Directories: 755
- Images: 644

## Production Configuration

### 1. Update Asset Paths
Verify all relative paths work correctly:
```html
<!-- Correct relative paths -->
<link rel="stylesheet" href="assets/css/common.css">
<script src="components/main-navigation.js"></script>
<link rel="icon" type="image/x-icon" href="favicon.ico">
```

### 2. Configure .htaccess (Optional)
Create `.htaccess` in `public_html` for better performance:
```apache
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

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/icon "access plus 1 month"
    ExpiresByType text/html "access plus 1 hour"
</IfModule>

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

## Post-Deployment Verification

### 1. Test Core Functionality
Visit your domain and verify:
- [ ] Homepage loads correctly
- [ ] Navigation works across all pages
- [ ] For-buyers.html displays properly with working modal
- [ ] All CSS styles load correctly
- [ ] JavaScript functionality works
- [ ] Mobile responsiveness

### 2. Test All Pages
Key pages to verify:
- [ ] `index.html` - Homepage
- [ ] `for-buyers.html` - Fixed buyer page
- [ ] `for-sellers.html` - Seller page
- [ ] `about.html` - About page
- [ ] `contact.html` - Contact page
- [ ] `how-it-works.html` - Process page

### 3. Performance Check
- Test page load speeds
- Verify images load correctly
- Check mobile performance
- Test form submissions (if applicable)

## Troubleshooting

### Common Issues

#### 1. Navigation Not Working
**Problem**: Navigation container not found error
**Solution**: Ensure `components/main-navigation.js` is uploaded and accessible

#### 2. CSS Not Loading
**Problem**: Styles not applying
**Solution**: Check file paths and ensure CSS files are uploaded to correct directories

#### 3. 404 Errors
**Problem**: Pages not found
**Solution**: Verify file names match exactly (case-sensitive on Linux servers)

#### 4. Modal Not Working
**Problem**: For-buyers modal not opening
**Solution**: Ensure `assets/js/for-buyers-modal.js` is uploaded and linked correctly

### File Structure Verification
Your `public_html` should contain:
```
public_html/
├── index.html
├── for-buyers.html
├── for-sellers.html
├── about.html
├── contact.html
├── how-it-works.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── components/
│   ├── main-navigation.js
│   └── navigation-styles.css
├── auth/
├── blog/
├── portals/
└── favicon.ico
```

## Maintenance

### Regular Updates
1. Test changes locally first
2. Create backup of current live site
3. Upload only changed files
4. Test immediately after upload
5. Monitor for any issues

### Backup Strategy
- Download complete site backup monthly
- Keep local git repository updated
- Document all changes in commit messages

## Support Resources

### Hostinger Support
- Knowledge Base: https://support.hostinger.com
- Live Chat: Available 24/7
- Ticket System: For complex issues

### Technical Support
- Check browser console for JavaScript errors
- Use browser dev tools to debug CSS issues
- Test on multiple devices and browsers
- Monitor site performance regularly

## Security Considerations

### 1. File Permissions
- Never set files to 777
- Use 644 for files, 755 for directories
- Protect sensitive configuration files

### 2. Regular Updates
- Keep all dependencies updated
- Monitor for security vulnerabilities
- Regular security scans

### 3. Backup and Recovery
- Automated daily backups (if available)
- Test backup restoration process
- Keep offline backups

---

**Note**: This guide assumes a standard Hostinger shared hosting environment. For VPS or dedicated servers, additional configuration may be required.
