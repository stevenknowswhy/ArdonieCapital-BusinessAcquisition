#!/usr/bin/env node

/**
 * Site-wide Navigation Update Script
 * Updates all HTML pages to use the centralized navigation component
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const NAVIGATION_STYLES_LINK = '<link rel="stylesheet" href="components/navigation-styles.css">';
const NAVIGATION_SCRIPT = '<script src="components/main-navigation.js"></script>';
const NAVIGATION_CONTAINER = '<div id="main-navigation-container"></div>';

// Pages to update with their relative paths for navigation assets
const PAGES_TO_UPDATE = [
    // Root level pages
    { file: 'contact.html', navPath: 'components/' },
    { file: 'careers.html', navPath: 'components/' },
    { file: 'for-sellers.html', navPath: 'components/' },
    { file: 'for-buyers.html', navPath: 'components/' },
    { file: 'express-deal.html', navPath: 'components/' },
    { file: 'prelaunch-express.html', navPath: 'components/' },
    
    // Blog pages
    { file: 'blog/index.html', navPath: '../components/' },
    
    // Marketplace pages
    { file: 'marketplace/listings.html', navPath: '../components/' },
    
    // Portal pages
    { file: 'portals/accountant-portal.html', navPath: '../components/' },
    { file: 'portals/attorney-portal.html', navPath: '../components/' },
    { file: 'portals/buyer-portal.html', navPath: '../components/' },
    { file: 'portals/seller-portal.html', navPath: '../components/' },
    { file: 'portals/lender-portal.html', navPath: '../components/' },
    
    // Dashboard pages
    { file: 'dashboard/buyer-dashboard.html', navPath: '../components/' },
    { file: 'dashboard/seller-dashboard.html', navPath: '../components/' },
    
    // Vendor portal pages
    { file: 'vendor-portal/accounting-firms.html', navPath: '../components/' },
    { file: 'vendor-portal/financial-institutions.html', navPath: '../components/' },
    { file: 'vendor-portal/legal-firms.html', navPath: '../components/' },
    
    // Auth pages
    { file: 'auth/login.html', navPath: '../components/' },
    { file: 'auth/register.html', navPath: '../components/' },
];

/**
 * Check if file exists
 */
function fileExists(filePath) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (err) {
        return false;
    }
}

/**
 * Update a single HTML file
 */
function updateHtmlFile(filePath, navPath) {
    console.log(`Updating: ${filePath}`);
    
    if (!fileExists(filePath)) {
        console.log(`  ❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        // Add navigation styles to head if not present
        const stylesLink = `<link rel="stylesheet" href="${navPath}navigation-styles.css">`;
        if (!content.includes('navigation-styles.css')) {
            // Find the last CSS link or the closing head tag
            const headCloseIndex = content.indexOf('</head>');
            if (headCloseIndex !== -1) {
                content = content.slice(0, headCloseIndex) + 
                         `    \n    <!-- Navigation Styles -->\n    ${stylesLink}\n` + 
                         content.slice(headCloseIndex);
                updated = true;
            }
        }
        
        // Replace existing navigation with container
        const navPatterns = [
            /<header[^>]*>[\s\S]*?<\/header>/gi,
            /<nav[^>]*>[\s\S]*?<\/nav>/gi,
            /<!-- Navigation[\s\S]*?<!-- \/Navigation -->/gi,
            /<!-- Header[\s\S]*?<!-- \/Header -->/gi
        ];
        
        for (const pattern of navPatterns) {
            if (pattern.test(content)) {
                content = content.replace(pattern, `    <!-- Navigation Component -->\n    ${NAVIGATION_CONTAINER}`);
                updated = true;
                break;
            }
        }
        
        // Add navigation script before closing body tag if not present
        const scriptTag = `<script src="${navPath}main-navigation.js"></script>`;
        if (!content.includes('main-navigation.js')) {
            const bodyCloseIndex = content.lastIndexOf('</body>');
            if (bodyCloseIndex !== -1) {
                content = content.slice(0, bodyCloseIndex) + 
                         `    \n    <!-- Load Navigation Component -->\n    ${scriptTag}\n` + 
                         content.slice(bodyCloseIndex);
                updated = true;
            }
        }
        
        // Remove old mobile menu scripts
        const mobileMenuScriptPattern = /<!-- Mobile Menu Script -->[\s\S]*?<\/script>/gi;
        if (mobileMenuScriptPattern.test(content)) {
            content = content.replace(mobileMenuScriptPattern, '');
            updated = true;
        }
        
        if (updated) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Updated successfully`);
            return true;
        } else {
            console.log(`  ⚠️  No changes needed`);
            return false;
        }
        
    } catch (error) {
        console.error(`  ❌ Error updating ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Starting site-wide navigation update...\n');
    
    let totalFiles = 0;
    let updatedFiles = 0;
    let skippedFiles = 0;
    
    for (const page of PAGES_TO_UPDATE) {
        const filePath = path.join(ROOT_DIR, page.file);
        totalFiles++;
        
        const result = updateHtmlFile(filePath, page.navPath);
        if (result === true) {
            updatedFiles++;
        } else if (result === false && fileExists(filePath)) {
            skippedFiles++;
        }
    }
    
    console.log('\n📊 Summary:');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Files updated: ${updatedFiles}`);
    console.log(`Files skipped (no changes): ${skippedFiles}`);
    console.log(`Files not found: ${totalFiles - updatedFiles - skippedFiles}`);
    
    console.log('\n✅ Site-wide navigation update completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test navigation on updated pages');
    console.log('2. Verify dark mode toggle functionality');
    console.log('3. Check responsive design on mobile devices');
    console.log('4. Validate accessibility features');
}

// Run the script
main();
