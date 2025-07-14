#!/usr/bin/env node

/**
 * Final Navigation Validation Script
 * Comprehensive testing for production readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// All pages that should have navigation
const ALL_PAGES = [
    // Root level pages
    { file: 'contact.html', type: 'Root Level' },
    { file: 'careers.html', type: 'Root Level' },
    { file: 'for-sellers.html', type: 'Root Level' },
    { file: 'for-buyers.html', type: 'Root Level' },
    { file: 'express-deal.html', type: 'Root Level' },
    { file: 'prelaunch-express.html', type: 'Root Level' },
    
    // Blog pages
    { file: 'blog/index.html', type: 'Blog' },
    
    // Marketplace pages
    { file: 'marketplace/listings.html', type: 'Marketplace' },
    
    // Portal pages
    { file: 'portals/accountant-portal.html', type: 'Portal' },
    { file: 'portals/attorney-portal.html', type: 'Portal' },
    { file: 'portals/buyer-portal.html', type: 'Portal' },
    { file: 'portals/seller-portal.html', type: 'Portal' },
    { file: 'portals/lender-portal.html', type: 'Portal' },
    
    // Dashboard pages
    { file: 'dashboard/buyer-dashboard.html', type: 'Dashboard' },
    { file: 'dashboard/seller-dashboard.html', type: 'Dashboard' },
    
    // Vendor portal pages
    { file: 'vendor-portal/accounting-firms.html', type: 'Vendor Portal' },
    { file: 'vendor-portal/financial-institutions.html', type: 'Vendor Portal' },
    { file: 'vendor-portal/legal-firms.html', type: 'Vendor Portal' },
    
    // Auth pages
    { file: 'auth/login.html', type: 'Authentication' },
    { file: 'auth/register.html', type: 'Authentication' }
];

/**
 * Validate navigation implementation
 */
function validateNavigation(filePath, pageInfo) {
    if (!fs.existsSync(filePath)) {
        return { status: 'missing', file: pageInfo.file, type: pageInfo.type };
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        
        // Check for navigation container
        if (!content.includes('id="main-navigation-container"')) {
            issues.push('Missing navigation container');
        }
        
        // Check for navigation styles
        if (!content.includes('navigation-styles.css')) {
            issues.push('Missing navigation styles');
        }
        
        // Check for navigation script
        if (!content.includes('main-navigation.js')) {
            issues.push('Missing navigation script');
        }
        
        // Check for dark mode support
        if (!content.includes('darkMode: \'class\'')) {
            issues.push('Missing dark mode configuration');
        }
        
        return {
            status: issues.length === 0 ? 'pass' : 'issues',
            file: pageInfo.file,
            type: pageInfo.type,
            issues: issues
        };
        
    } catch (error) {
        return {
            status: 'error',
            file: pageInfo.file,
            type: pageInfo.type,
            error: error.message
        };
    }
}

/**
 * Check component files
 */
function validateComponents() {
    const components = [
        'components/main-navigation.js',
        'components/navigation-styles.css'
    ];
    
    const results = [];
    
    for (const component of components) {
        const filePath = path.join(ROOT_DIR, component);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (component.includes('main-navigation.js')) {
                // Check for required functions
                const requiredFunctions = [
                    'initThemeToggle',
                    'toggleTheme',
                    'updateThemeIcons',
                    'updateAuthState',
                    'bindEvents'
                ];
                
                const missingFunctions = requiredFunctions.filter(func => !content.includes(func));
                
                results.push({
                    component,
                    status: missingFunctions.length === 0 ? 'complete' : 'incomplete',
                    missingFunctions
                });
            } else {
                results.push({
                    component,
                    status: 'found'
                });
            }
        } else {
            results.push({
                component,
                status: 'missing'
            });
        }
    }
    
    return results;
}

/**
 * Generate final validation report
 */
function generateFinalReport(pageResults, componentResults) {
    console.log('\n🎯 FINAL NAVIGATION VALIDATION REPORT');
    console.log('=' .repeat(60));
    
    // Overall statistics
    const totalPages = pageResults.length;
    const passedPages = pageResults.filter(r => r.status === 'pass').length;
    const pagesWithIssues = pageResults.filter(r => r.status === 'issues').length;
    const missingPages = pageResults.filter(r => r.status === 'missing').length;
    const errorPages = pageResults.filter(r => r.status === 'error').length;
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`Total Pages: ${totalPages}`);
    console.log(`✅ Fully Compliant: ${passedPages}`);
    console.log(`⚠️  With Issues: ${pagesWithIssues}`);
    console.log(`❌ Missing: ${missingPages}`);
    console.log(`🔥 Errors: ${errorPages}`);
    console.log(`📈 Success Rate: ${((passedPages / totalPages) * 100).toFixed(1)}%`);
    
    // Group by page type
    const byType = {};
    pageResults.forEach(result => {
        if (!byType[result.type]) byType[result.type] = [];
        byType[result.type].push(result);
    });
    
    console.log(`\n📋 Results by Page Type:`);
    for (const [type, results] of Object.entries(byType)) {
        const typePassed = results.filter(r => r.status === 'pass').length;
        const typeTotal = results.length;
        console.log(`  ${type}: ${typePassed}/${typeTotal} (${((typePassed/typeTotal)*100).toFixed(0)}%)`);
    }
    
    // Component validation
    console.log(`\n🔧 Component Validation:`);
    componentResults.forEach(result => {
        const status = result.status === 'complete' || result.status === 'found' ? '✅' : '❌';
        console.log(`  ${status} ${result.component}: ${result.status}`);
        if (result.missingFunctions && result.missingFunctions.length > 0) {
            console.log(`    Missing: ${result.missingFunctions.join(', ')}`);
        }
    });
    
    // Issues summary
    const issuePages = pageResults.filter(r => r.status === 'issues');
    if (issuePages.length > 0) {
        console.log(`\n⚠️  Pages with Issues:`);
        issuePages.forEach(page => {
            console.log(`  ${page.file}: ${page.issues.join(', ')}`);
        });
    }
    
    // Missing pages
    const missingPagesList = pageResults.filter(r => r.status === 'missing');
    if (missingPagesList.length > 0) {
        console.log(`\n❌ Missing Pages:`);
        missingPagesList.forEach(page => {
            console.log(`  ${page.file}`);
        });
    }
    
    // Production readiness assessment
    console.log(`\n🚀 Production Readiness Assessment:`);
    
    const criticalIssues = componentResults.filter(r => r.status === 'missing').length + 
                          pageResults.filter(r => r.status === 'error').length;
    
    const minorIssues = pageResults.filter(r => r.status === 'issues').length + 
                       missingPages;
    
    if (criticalIssues === 0 && minorIssues === 0) {
        console.log(`✅ READY FOR PRODUCTION`);
        console.log(`   All components and pages are fully compliant.`);
    } else if (criticalIssues === 0 && minorIssues <= 3) {
        console.log(`⚠️  READY WITH MINOR ISSUES`);
        console.log(`   ${minorIssues} minor issues that don't affect core functionality.`);
    } else if (criticalIssues === 0) {
        console.log(`🔧 NEEDS ATTENTION`);
        console.log(`   ${minorIssues} issues should be resolved before production.`);
    } else {
        console.log(`❌ NOT READY`);
        console.log(`   ${criticalIssues} critical issues must be resolved.`);
    }
    
    console.log('\n' + '=' .repeat(60));
}

/**
 * Main execution
 */
function main() {
    console.log('🔍 Starting Final Navigation Validation...');
    
    // Validate all pages
    const pageResults = [];
    for (const pageInfo of ALL_PAGES) {
        const filePath = path.join(ROOT_DIR, pageInfo.file);
        const result = validateNavigation(filePath, pageInfo);
        pageResults.push(result);
    }
    
    // Validate components
    const componentResults = validateComponents();
    
    // Generate final report
    generateFinalReport(pageResults, componentResults);
}

// Run the script
main();
