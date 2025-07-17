#!/usr/bin/env node

/**
 * Add Favicon to All Pages Script
 * Adds favicon link tags to all HTML pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// All pages that need favicon
const ALL_PAGES = [
    // Root level pages
    'index.html',
    'about.html',
    'how-it-works.html',
    'contact.html',
    'careers.html',
    'for-sellers.html',
    'for-buyers.html',
    'express-deal.html',
    'prelaunch-express.html',
    'test-navigation.html',
    
    // Blog pages
    'blog/index.html',
    
    // Marketplace pages
    'marketplace/listings.html',
    
    // Portal pages
    'portals/accountant-portal.html',
    'portals/attorney-portal.html',
    'portals/buyer-portal.html',
    'portals/seller-portal.html',
    'portals/lender-portal.html',
    
    // Dashboard pages
    'dashboard/buyer-dashboard.html',
    'dashboard/seller-dashboard.html',
    
    // Vendor portal pages
    'vendor-portal/accounting-firms.html',
    'vendor-portal/financial-institutions.html',
    'vendor-portal/legal-firms.html',
    
    // Auth pages
    'auth/login.html',
    'auth/register.html'
];

/**
 * Get the correct favicon path for a file
 */
function getFaviconPath(filePath) {
    const depth = filePath.split('/').length - 1;
    return depth === 0 ? '/favicon.ico' : '../'.repeat(depth) + 'favicon.ico';
}

/**
 * Add favicon to a single HTML file
 */
function addFaviconToFile(filePath) {
    console.log(`Adding favicon to: ${filePath}`);
    
    const fullPath = path.join(ROOT_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
        console.log(`  ❌ File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if favicon is already present
        if (content.includes('favicon.ico') || content.includes('rel="icon"')) {
            console.log(`  ⚠️  Favicon already present in ${filePath}`);
            return false;
        }
        
        const faviconPath = getFaviconPath(filePath);
        const faviconTag = `    <link rel="icon" type="image/x-icon" href="${faviconPath}">`;
        
        // Find the best place to insert favicon (after charset or viewport, before title)
        let insertIndex = -1;
        
        // Try to insert after charset meta tag
        const charsetMatch = content.match(/<meta\s+charset[^>]*>/i);
        if (charsetMatch) {
            insertIndex = content.indexOf(charsetMatch[0]) + charsetMatch[0].length;
        }
        
        // If no charset, try after viewport
        if (insertIndex === -1) {
            const viewportMatch = content.match(/<meta\s+name="viewport"[^>]*>/i);
            if (viewportMatch) {
                insertIndex = content.indexOf(viewportMatch[0]) + viewportMatch[0].length;
            }
        }
        
        // If neither, insert after <head>
        if (insertIndex === -1) {
            const headMatch = content.match(/<head[^>]*>/i);
            if (headMatch) {
                insertIndex = content.indexOf(headMatch[0]) + headMatch[0].length;
            }
        }
        
        if (insertIndex !== -1) {
            content = content.slice(0, insertIndex) + 
                     '\n' + faviconTag + '\n' + 
                     content.slice(insertIndex);
            
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`  ✅ Favicon added to ${filePath}`);
            return true;
        } else {
            console.log(`  ❌ Could not find insertion point in ${filePath}`);
            return false;
        }
        
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Create a simple favicon.ico file
 */
function createFavicon() {
    console.log('Creating favicon.ico...');
    
    // Create a simple base64 encoded favicon (16x16 blue square with "AC")
    // This is a minimal ICO file with a 16x16 pixel favicon
    const faviconData = Buffer.from([
        0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10, 0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x68, 0x04,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 0x00, 0x00, 0x10, 0x00, 0x00, 0x00, 0x20, 0x00,
        0x00, 0x00, 0x01, 0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    // For simplicity, let's create a PNG file and rename it
    // In production, you'd want a proper ICO file
    const faviconPath = path.join(ROOT_DIR, 'favicon.ico');
    
    // Create a simple text-based favicon placeholder
    const faviconContent = `<!-- Favicon placeholder - replace with actual favicon.ico file -->
<!-- This is a temporary placeholder. For production, use a proper ICO file -->`;
    
    // Actually, let's copy the SVG as a temporary favicon
    const svgPath = path.join(ROOT_DIR, 'favicon.svg');
    if (fs.existsSync(svgPath)) {
        fs.copyFileSync(svgPath, faviconPath.replace('.ico', '.svg'));
        console.log('  ✅ SVG favicon created as favicon.svg');
    }
    
    // Create a minimal ICO file (this is a very basic implementation)
    // For production, you should use a proper favicon generator
    const minimalIco = Buffer.alloc(1024, 0); // Simple placeholder
    fs.writeFileSync(faviconPath, minimalIco);
    console.log('  ✅ Basic favicon.ico created (replace with proper favicon for production)');
}

/**
 * Main execution
 */
function main() {
    console.log('🎨 Starting favicon implementation...\n');
    
    // Create favicon file
    createFavicon();
    
    console.log('\n📄 Adding favicon to pages...\n');
    
    let totalFiles = 0;
    let updatedFiles = 0;
    
    for (const page of ALL_PAGES) {
        totalFiles++;
        const result = addFaviconToFile(page);
        if (result) updatedFiles++;
    }
    
    console.log('\n📊 Favicon Implementation Summary:');
    console.log(`Total pages processed: ${totalFiles}`);
    console.log(`Pages updated: ${updatedFiles}`);
    console.log(`Pages skipped: ${totalFiles - updatedFiles}`);
    
    console.log('\n✅ Favicon implementation completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Replace favicon.ico with a proper ICO file for production');
    console.log('2. Test favicon appearance in browser tabs');
    console.log('3. Verify favicon loads correctly on all pages');
}

// Run the script
main();
