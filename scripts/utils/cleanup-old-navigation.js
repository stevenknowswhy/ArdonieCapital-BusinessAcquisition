#!/usr/bin/env node

/**
 * Cleanup Old Navigation Scripts
 * Removes any remaining old mobile menu scripts and navigation elements
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Pages that may need cleanup
const PAGES_TO_CLEAN = [
    'careers.html',
    'for-sellers.html',
    'for-buyers.html',
    'portals/buyer-portal.html',
    'portals/seller-portal.html',
    'blog/index.html'
];

/**
 * Clean old navigation scripts from a file
 */
function cleanOldNavigation(filePath) {
    console.log(`Cleaning: ${filePath}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let cleaned = false;
        
        // Remove old mobile menu scripts
        const mobileMenuScriptPattern = /<script>\s*\/\/\s*Mobile menu toggle[\s\S]*?<\/script>/gi;
        if (mobileMenuScriptPattern.test(content)) {
            content = content.replace(mobileMenuScriptPattern, '');
            cleaned = true;
            console.log('  ✅ Removed old mobile menu script');
        }
        
        // Remove standalone mobile menu scripts
        const standaloneScriptPattern = /<script>[\s\S]*?mobile-menu-button[\s\S]*?<\/script>/gi;
        if (standaloneScriptPattern.test(content)) {
            content = content.replace(standaloneScriptPattern, '');
            cleaned = true;
            console.log('  ✅ Removed standalone mobile script');
        }
        
        // Remove empty script tags
        const emptyScriptPattern = /<script>\s*<\/script>/gi;
        if (emptyScriptPattern.test(content)) {
            content = content.replace(emptyScriptPattern, '');
            cleaned = true;
            console.log('  ✅ Removed empty script tags');
        }
        
        if (cleaned) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('  🎉 File cleaned successfully');
            return true;
        } else {
            console.log('  ⚠️  No cleanup needed');
            return false;
        }
        
    } catch (error) {
        console.error(`  ❌ Error cleaning ${filePath}:`, error.message);
        return false;
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🧹 Starting navigation cleanup...\n');
    
    let totalFiles = 0;
    let cleanedFiles = 0;
    
    for (const page of PAGES_TO_CLEAN) {
        const filePath = path.join(ROOT_DIR, page);
        
        if (fs.existsSync(filePath)) {
            totalFiles++;
            const result = cleanOldNavigation(filePath);
            if (result) cleanedFiles++;
        } else {
            console.log(`⚠️  File not found: ${page}`);
        }
        console.log('');
    }
    
    console.log('📊 Cleanup Summary:');
    console.log(`Total files processed: ${totalFiles}`);
    console.log(`Files cleaned: ${cleanedFiles}`);
    console.log(`Files unchanged: ${totalFiles - cleanedFiles}`);
    
    console.log('\n✅ Navigation cleanup completed!');
}

// Run the script
main();
