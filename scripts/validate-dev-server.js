#!/usr/bin/env node

/**
 * Development Server Validation Script
 * Tests favicon, navigation, and all functionality over HTTP
 */

import http from 'http';
import { URL } from 'url';

const SERVER_URL = 'http://localhost:3000';

// Test pages to validate
const TEST_PAGES = [
    '/',
    '/about.html',
    '/contact.html',
    '/test-navigation.html',
    '/portals/buyer-portal.html',
    '/portals/seller-portal.html',
    '/vendor-portal/financial-institutions.html',
    '/dashboard/buyer-dashboard.html',
    '/auth/login.html',
    '/blog/index.html'
];

// Critical resources to check
const CRITICAL_RESOURCES = [
    '/favicon.ico',
    '/components/main-navigation.js',
    '/components/navigation-styles.css'
];

/**
 * Make HTTP request and return response details
 */
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: 'GET',
            headers: {
                'User-Agent': 'Ardonie-Dev-Server-Validator/1.0'
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    url,
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data,
                    contentType: res.headers['content-type'] || 'unknown'
                });
            });
        });
        
        req.on('error', (err) => {
            reject({ url, error: err.message });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject({ url, error: 'Request timeout' });
        });
        
        req.end();
    });
}

/**
 * Validate a single page
 */
async function validatePage(path) {
    try {
        const response = await makeRequest(SERVER_URL + path);
        
        const result = {
            path,
            status: 'success',
            statusCode: response.statusCode,
            contentType: response.contentType,
            checks: {}
        };
        
        // Check status code
        result.checks.statusOk = response.statusCode === 200;
        
        // Check content type for HTML pages
        if (path.endsWith('.html') || path === '/') {
            result.checks.htmlContentType = response.contentType.includes('text/html');
        }
        
        // Check for navigation container
        if (response.body) {
            result.checks.hasNavigationContainer = response.body.includes('main-navigation-container');
            result.checks.hasFaviconLink = response.body.includes('favicon.ico');
            result.checks.hasNavigationStyles = response.body.includes('navigation-styles.css');
            result.checks.hasNavigationScript = response.body.includes('main-navigation.js');
            result.checks.hasDarkModeConfig = response.body.includes('darkMode: \'class\'');
        }
        
        return result;
        
    } catch (error) {
        return {
            path,
            status: 'error',
            error: error.error || error.message
        };
    }
}

/**
 * Validate critical resources
 */
async function validateResource(path) {
    try {
        const response = await makeRequest(SERVER_URL + path);
        
        return {
            path,
            status: 'success',
            statusCode: response.statusCode,
            contentType: response.contentType,
            size: response.body.length
        };
        
    } catch (error) {
        return {
            path,
            status: 'error',
            error: error.error || error.message
        };
    }
}

/**
 * Generate validation report
 */
function generateReport(pageResults, resourceResults) {
    console.log('\n🧪 DEVELOPMENT SERVER VALIDATION REPORT');
    console.log('=' .repeat(60));
    
    // Page validation results
    console.log('\n📄 Page Validation Results:');
    
    let totalPages = pageResults.length;
    let successfulPages = 0;
    let pagesWithIssues = 0;
    
    pageResults.forEach(result => {
        if (result.status === 'success') {
            const issues = [];
            
            if (!result.checks.statusOk) issues.push('HTTP error');
            if (result.checks.htmlContentType === false) issues.push('Wrong content type');
            if (result.checks.hasNavigationContainer === false) issues.push('No navigation container');
            if (result.checks.hasFaviconLink === false) issues.push('No favicon link');
            if (result.checks.hasNavigationStyles === false) issues.push('No navigation styles');
            if (result.checks.hasNavigationScript === false) issues.push('No navigation script');
            
            if (issues.length === 0) {
                console.log(`  ✅ ${result.path} - All checks passed`);
                successfulPages++;
            } else {
                console.log(`  ⚠️  ${result.path} - Issues: ${issues.join(', ')}`);
                pagesWithIssues++;
            }
        } else {
            console.log(`  ❌ ${result.path} - Error: ${result.error}`);
        }
    });
    
    // Resource validation results
    console.log('\n🔧 Critical Resource Validation:');
    
    let totalResources = resourceResults.length;
    let successfulResources = 0;
    
    resourceResults.forEach(result => {
        if (result.status === 'success' && result.statusCode === 200) {
            console.log(`  ✅ ${result.path} - OK (${result.size} bytes, ${result.contentType})`);
            successfulResources++;
        } else {
            console.log(`  ❌ ${result.path} - ${result.error || `HTTP ${result.statusCode}`}`);
        }
    });
    
    // Summary
    console.log('\n📊 Validation Summary:');
    console.log(`Pages: ${successfulPages}/${totalPages} passed, ${pagesWithIssues} with issues`);
    console.log(`Resources: ${successfulResources}/${totalResources} available`);
    
    const overallSuccess = (successfulPages === totalPages) && (successfulResources === totalResources);
    
    console.log('\n🎯 Overall Status:');
    if (overallSuccess) {
        console.log('✅ ALL TESTS PASSED - Development server is fully functional!');
    } else if (successfulPages > 0 && successfulResources > 0) {
        console.log('⚠️  PARTIAL SUCCESS - Some issues found but core functionality works');
    } else {
        console.log('❌ VALIDATION FAILED - Critical issues found');
    }
    
    console.log('\n🧪 Manual Testing Checklist:');
    console.log('□ Favicon appears in browser tab');
    console.log('□ Dark mode toggle works (sun/moon icon)');
    console.log('□ Mobile navigation works (hamburger menu)');
    console.log('□ Authentication simulation works (test page)');
    console.log('□ Navigation dropdowns function properly');
    console.log('□ Responsive design works on mobile');
    console.log('□ Cross-page navigation maintains state');
    
    console.log('\n' + '=' .repeat(60));
}

/**
 * Main validation execution
 */
async function main() {
    console.log('🔍 Starting development server validation...');
    console.log(`📍 Testing server at: ${SERVER_URL}`);
    
    // Test server availability
    try {
        await makeRequest(SERVER_URL);
        console.log('✅ Server is responding');
    } catch (error) {
        console.log('❌ Server is not responding. Please start the development server first:');
        console.log('   node scripts/start-dev-server.js');
        process.exit(1);
    }
    
    console.log('\n🧪 Running validation tests...');
    
    // Validate pages
    const pageResults = [];
    for (const page of TEST_PAGES) {
        const result = await validatePage(page);
        pageResults.push(result);
    }
    
    // Validate resources
    const resourceResults = [];
    for (const resource of CRITICAL_RESOURCES) {
        const result = await validateResource(resource);
        resourceResults.push(result);
    }
    
    // Generate report
    generateReport(pageResults, resourceResults);
}

// Run validation
main().catch(console.error);
