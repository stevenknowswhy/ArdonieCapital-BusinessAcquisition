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

## Quick Start: Automated Production Package

### Create Production Package (One Command)

For fastest deployment, use this single command to create the production package:

```bash
# Navigate to project and create production package
cd "/Users/stephenstokes/Downloads/Projects/5 May2025 Projects/BuyMartV1" && \
zip -r ardonie-capital-production.zip \
  *.html favicon* \
  assets/css/ assets/js/ assets/images/ \
  components/main-navigation.js components/navigation-styles.css \
  auth/ blog/ documents/ funding/ marketplace/ matchmaking/ \
  portals/ sections/ tools/ vendor-portal/ \
  -x "*.git*" "*.DS_Store" "*.log" "*.md" "*.backup" "*.img-backup" \
     "node_modules/*" "scripts/*" "tests/*" "docs/*" "database/*" \
     "*.sh" "amplify*" "aws-*" "cloudformation*" "package*.json" \
     "*.config.js" "*.zip" "*.py" "sw.js" "mcp-*" "src/*" \
     ".env*" ".aws*" "simple-swiper-js-example/*" "vendor-directory/*" ".mcp/*" && \
echo "✅ Production package ready: ardonie-capital-production.zip"
```

**Then simply upload `ardonie-capital-production.zip` to Hostinger and extract it in `public_html`.**

---

## Deployment Methods

### Method 1: File Manager Upload (Recommended for Most Users)

#### Step 1: Access Hostinger File Manager
1. Log into your Hostinger control panel
2. Navigate to "File Manager"
3. Go to `public_html` directory (or your domain's root folder)

#### Step 2: Create Production-Ready Deployment Package
```bash
# Navigate to the project directory
cd "/Users/stephenstokes/Downloads/Projects/5 May2025 Projects/BuyMartV1"

# Create a production-ready deployment package with only necessary files
zip -r ardonie-capital-production.zip \
  index.html \
  for-buyers.html \
  for-sellers.html \
  about.html \
  contact.html \
  how-it-works.html \
  express-deal.html \
  careers.html \
  partner-with-us.html \
  prelaunch-express.html \
  blog.html \
  cookie-policy.html \
  privacy-policy.html \
  terms-of-service.html \
  assets/css/ \
  assets/js/ \
  assets/images/ \
  components/main-navigation.js \
  components/navigation-styles.css \
  auth/ \
  blog/ \
  documents/ \
  funding/ \
  marketplace/ \
  matchmaking/ \
  portals/ \
  sections/ \
  tools/ \
  vendor-portal/ \
  favicon.ico \
  favicon.svg \
  favicon-16.png \
  favicon-32.png \
  favicon-48.png \
  -x "*.git*" "*.DS_Store" "*.log" "*.md" "*.backup" "*.img-backup" \
     "node_modules/*" "scripts/*" "tests/*" "docs/*" "database/*" \
     "deploy.sh" "validate-deployment.sh" "amplify*" "aws-*" \
     "cloudformation*" "package*.json" "babel.config.js" "jest.config.js" \
     "*.zip" "*.py" "*.sh" "sw.js" "mcp-*" "src/*" ".env*" ".aws*" \
     "simple-swiper-js-example/*" "vendor-directory/*" ".mcp/*"

echo "✅ Production deployment package created: ardonie-capital-production.zip"
echo "📦 Package contains only production-ready files for Hostinger hosting"
```

**Files Included in Production Package:**
- **Core HTML Pages**: All main website pages (index.html, for-buyers.html, etc.)
- **Essential Assets**: CSS, JavaScript, and image files from assets/ folder
- **Navigation System**: main-navigation.js and navigation-styles.css
- **Content Directories**: auth/, blog/, documents/, portals/, tools/, etc.
- **Favicon Files**: All favicon variants for proper browser support
- **Subdirectory Pages**: All HTML files in subdirectories (blog posts, portals, etc.)

**Files Excluded from Production Package:**
- Development files (package.json, babel.config.js, jest.config.js)
- Documentation files (*.md, docs/, README files)
- Build scripts (scripts/, deploy.sh, validate-deployment.sh)
- AWS/Amplify configuration (aws-*, amplify*, cloudformation*)
- Git files (.git*, .gitignore)
- Backup files (*.backup, *.img-backup)
- Development tools (node_modules/, tests/, src/)
- Temporary files (*.log, *.DS_Store, *.zip)

#### Step 3: Upload and Extract Production Package

**Using Hostinger File Manager:**

1. **Access File Manager**
   - Log into your Hostinger control panel
   - Navigate to "File Manager"
   - Go to `public_html` directory (your domain's root folder)

2. **Upload Production Package**
   - Click "Upload" button in File Manager
   - Select `ardonie-capital-production.zip` from your local machine
   - Wait for upload to complete (file size should be ~10-20MB)

3. **Extract Files**
   - Right-click on `ardonie-capital-production.zip` in File Manager
   - Select "Extract" or "Unzip"
   - Choose to extract to current directory (`public_html`)
   - Confirm extraction

4. **Verify File Structure**
   After extraction, your `public_html` should contain:
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
   ├── favicon.ico
   └── [other directories and files]
   ```

5. **Clean Up**
   - Delete the `ardonie-capital-production.zip` file from `public_html`
   - Remove any empty folders created during extraction

**Important Notes:**
- ✅ All files should be directly in `public_html`, not in a subfolder
- ✅ Verify `index.html` is in the root of `public_html`
- ✅ Check that `assets/`, `components/`, and other folders are present
- ✅ Ensure file permissions are set correctly (644 for files, 755 for directories)

#### Step 4: Test Deployment Package Locally (Optional but Recommended)

Before uploading to Hostinger, test the production package locally:

```bash
# Create a test directory
mkdir ~/Desktop/hostinger-test
cd ~/Desktop/hostinger-test

# Extract the production package
unzip "/Users/stephenstokes/Downloads/Projects/5 May2025 Projects/BuyMartV1/ardonie-capital-production.zip"

# Start a local server to test
python3 -m http.server 8080

# Open browser to test
# Visit: http://localhost:8080
```

**Local Testing Checklist:**
- ✅ Homepage (index.html) loads correctly
- ✅ For-buyers page displays with working navigation
- ✅ Navigation menu works across all pages
- ✅ CSS styles load properly
- ✅ JavaScript functionality works (modals, forms)
- ✅ All internal links work correctly
- ✅ Images and assets load without 404 errors

**If local testing passes, proceed with Hostinger upload. If issues found, fix them in the main project and recreate the production package.**

### Method 2: FTP/SFTP Upload (Recommended for Full Deployments)

#### Step 1: Get FTP Credentials
From Hostinger control panel:
- FTP Host: Usually your domain name
- Username: Provided by Hostinger
- Password: Set in control panel
- Port: 21 (FTP) or 22 (SFTP)

#### Step 2: Upload Production Package via FTP

**Option A: Upload Zip File and Extract on Server**
1. Connect to your Hostinger FTP using FileZilla or similar:
   ```
   Host: ftp.yourdomain.com
   Username: [your-ftp-username]
   Password: [your-ftp-password]
   Port: 21
   ```

2. Navigate to `public_html` directory
3. Upload `ardonie-capital-production.zip` to `public_html`
4. Use Hostinger File Manager to extract the zip file (as described in Method 1)

**Option B: Extract Locally and Upload Files**
1. Extract the production package locally:
   ```bash
   cd ~/Desktop
   unzip "/Users/stephenstokes/Downloads/Projects/5 May2025 Projects/BuyMartV1/ardonie-capital-production.zip" -d hostinger-upload
   ```

2. Connect to FTP and navigate to `public_html`
3. Upload all extracted files and folders to `public_html`:
   - All HTML files (index.html, for-buyers.html, etc.)
   - `assets/` folder (complete directory)
   - `components/` folder (navigation files)
   - `auth/`, `blog/`, `portals/`, `tools/` folders
   - All favicon files
   - All other directories from the production package

**Recommended: Use Option A (upload zip and extract on server) for faster upload and fewer file transfer errors.**

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
