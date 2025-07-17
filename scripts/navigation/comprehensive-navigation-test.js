#!/usr/bin/env node

/**
 * Comprehensive Navigation Testing Script
 * Tests navigation functionality across all updated pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Test pages from different directories
const TEST_PAGES = [
    { file: 'contact.html', type: 'Root Level', navPath: 'components/' },
    { file: 'careers.html', type: 'Root Level', navPath: 'components/' },
    { file: 'for-sellers.html', type: 'Root Level', navPath: 'components/' },
    { file: 'portals/buyer-portal.html', type: 'Portal', navPath: '../components/' },
    { file: 'portals/seller-portal.html', type: 'Portal', navPath: '../components/' },
    { file: 'vendor-portal/financial-institutions.html', type: 'Vendor Portal', navPath: '../components/' },
    { file: 'dashboard/buyer-dashboard.html', type: 'Dashboard', navPath: '../components/' },
    { file: 'blog/index.html', type: 'Blog', navPath: '../components/' },
    { file: 'auth/login.html', type: 'Authentication', navPath: '../components/' },
    { file: 'marketplace/listings.html', type: 'Marketplace', navPath: '../components/' }
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
 * Test navigation implementation on a single page
 */
function testPageNavigation(filePath, pageInfo) {
    console.log(`\n🔍 Testing: ${pageInfo.file} (${pageInfo.type})`);
    
    if (!fileExists(filePath)) {
        console.log(`  ❌ File not found: ${filePath}`);
        return { passed: false, errors: ['File not found'] };
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const errors = [];
        const warnings = [];
        
        // Test 1: Navigation container present
        if (!content.includes('id="main-navigation-container"')) {
            errors.push('Navigation container missing');
        } else {
            console.log('  ✅ Navigation container found');
        }
        
        // Test 2: Navigation styles linked
        const expectedStylesPath = `${pageInfo.navPath}navigation-styles.css`;
        if (!content.includes(expectedStylesPath)) {
            errors.push(`Navigation styles not linked (expected: ${expectedStylesPath})`);
        } else {
            console.log('  ✅ Navigation styles linked correctly');
        }
        
        // Test 3: Navigation script loaded
        const expectedScriptPath = `${pageInfo.navPath}main-navigation.js`;
        if (!content.includes(expectedScriptPath)) {
            errors.push(`Navigation script not loaded (expected: ${expectedScriptPath})`);
        } else {
            console.log('  ✅ Navigation script loaded correctly');
        }
        
        // Test 4: Old navigation removed
        const oldNavPatterns = [
            /<header[^>]*class="[^"]*bg-white[^"]*"[^>]*>[\s\S]*?<\/header>/gi,
            /<nav[^>]*class="[^"]*hidden md:flex[^"]*"[^>]*>/gi,
            /mobile-menu-button/gi
        ];
        
        let oldNavFound = false;
        for (const pattern of oldNavPatterns) {
            if (pattern.test(content)) {
                oldNavFound = true;
                break;
            }
        }
        
        if (oldNavFound) {
            warnings.push('Old navigation elements may still be present');
        } else {
            console.log('  ✅ Old navigation properly removed');
        }
        
        // Test 5: Dark mode support
        if (!content.includes('darkMode: \'class\'')) {
            warnings.push('Dark mode configuration may be missing');
        } else {
            console.log('  ✅ Dark mode configuration found');
        }
        
        // Test 6: Mobile menu scripts removed
        if (content.includes('mobile-menu-button') && content.includes('addEventListener')) {
            warnings.push('Old mobile menu scripts may still be present');
        } else {
            console.log('  ✅ Old mobile scripts properly cleaned');
        }
        
        // Summary
        if (errors.length === 0) {
            console.log(`  🎉 ${pageInfo.file} - All tests passed!`);
            if (warnings.length > 0) {
                console.log(`  ⚠️  Warnings: ${warnings.join(', ')}`);
            }
        } else {
            console.log(`  ❌ ${pageInfo.file} - Errors found: ${errors.join(', ')}`);
        }
        
        return { 
            passed: errors.length === 0, 
            errors, 
            warnings,
            file: pageInfo.file,
            type: pageInfo.type
        };
        
    } catch (error) {
        console.error(`  ❌ Error testing ${pageInfo.file}:`, error.message);
        return { passed: false, errors: [error.message], file: pageInfo.file, type: pageInfo.type };
    }
}

/**
 * Test navigation component integrity
 */
function testNavigationComponent() {
    console.log('\n🔧 Testing Navigation Component Files...');
    
    const componentFiles = [
        'components/main-navigation.js',
        'components/navigation-styles.css'
    ];
    
    const results = [];
    
    for (const file of componentFiles) {
        const filePath = path.join(ROOT_DIR, file);
        if (fileExists(filePath)) {
            console.log(`  ✅ ${file} - Found`);
            
            // Test navigation.js for key functions
            if (file.includes('main-navigation.js')) {
                const content = fs.readFileSync(filePath, 'utf8');
                const requiredFunctions = [
                    'initThemeToggle',
                    'toggleTheme',
                    'updateThemeIcons',
                    'updateAuthState'
                ];
                
                for (const func of requiredFunctions) {
                    if (content.includes(func)) {
                        console.log(`    ✅ Function ${func} found`);
                    } else {
                        console.log(`    ❌ Function ${func} missing`);
                        results.push({ file, error: `Missing function: ${func}` });
                    }
                }
            }
        } else {
            console.log(`  ❌ ${file} - Not found`);
            results.push({ file, error: 'File not found' });
        }
    }
    
    return results;
}

/**
 * Generate comprehensive test report
 */
function generateTestReport(results, componentResults) {
    console.log('\n📊 COMPREHENSIVE NAVIGATION TEST REPORT');
    console.log('=' .repeat(50));
    
    const totalPages = results.length;
    const passedPages = results.filter(r => r.passed).length;
    const failedPages = results.filter(r => r && !r.passed).length;
    
    console.log(`\n📈 Overall Results:`);
    console.log(`Total Pages Tested: ${totalPages}`);
    console.log(`Pages Passed: ${passedPages}`);
    console.log(`Pages Failed: ${failedPages}`);
    console.log(`Success Rate: ${((passedPages / totalPages) * 100).toFixed(1)}%`);
    
    // Group by page type
    const byType = {};
    results.forEach(result => {
        if (result && result.type) {
            if (!byType[result.type]) byType[result.type] = [];
            byType[result.type].push(result);
        }
    });
    
    console.log(`\n📋 Results by Page Type:`);
    for (const [type, typeResults] of Object.entries(byType)) {
        const typePassed = typeResults.filter(r => r.passed).length;
        console.log(`  ${type}: ${typePassed}/${typeResults.length} passed`);
    }
    
    // Show failures
    const failures = results.filter(r => r && !r.passed);
    if (failures.length > 0) {
        console.log(`\n❌ Failed Pages:`);
        failures.forEach(failure => {
            console.log(`  ${failure.file}: ${failure.errors.join(', ')}`);
        });
    }
    
    // Show warnings
    const warnings = results.filter(r => r && r.warnings && r.warnings.length > 0);
    if (warnings.length > 0) {
        console.log(`\n⚠️  Pages with Warnings:`);
        warnings.forEach(warning => {
            console.log(`  ${warning.file}: ${warning.warnings.join(', ')}`);
        });
    }
    
    // Component results
    if (componentResults.length > 0) {
        console.log(`\n🔧 Component Issues:`);
        componentResults.forEach(issue => {
            console.log(`  ${issue.file}: ${issue.error}`);
        });
    }
    
    console.log('\n' + '=' .repeat(50));
    
    if (passedPages === totalPages && componentResults.length === 0) {
        console.log('🎉 ALL TESTS PASSED! Navigation system is ready for production.');
    } else {
        console.log('⚠️  Some issues found. Please review and fix before production deployment.');
    }
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Starting Comprehensive Navigation Testing...');
    
    // Test component files
    const componentResults = testNavigationComponent();
    
    // Test individual pages
    const results = [];
    for (const pageInfo of TEST_PAGES) {
        const filePath = path.join(ROOT_DIR, pageInfo.file);
        const result = testPageNavigation(filePath, pageInfo);
        results.push(result);
    }
    
    // Generate report
    generateTestReport(results, componentResults);
}

// Run the script
main();
