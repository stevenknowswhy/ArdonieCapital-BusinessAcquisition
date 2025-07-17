/**
 * Test script to verify CSS loading on vendor portal pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VendorPortalCSSTest {
    constructor() {
        this.results = {
            summary: {
                totalPages: 0,
                passedPages: 0,
                failedPages: 0
            },
            pageDetails: []
        };
    }

    async runTests() {
        console.log('🧪 Testing Vendor Portal CSS Loading...\n');

        const vendorPages = [
            'vendor-portal/accounting-firms.html',
            'vendor-portal/financial-institutions.html',
            'vendor-portal/legal-firms.html'
        ];

        for (const page of vendorPages) {
            const result = this.testPage(page);
            this.results.pageDetails.push(result);
            this.updateCounters(result);
        }

        this.generateReport();
        return this.results;
    }

    testPage(filePath) {
        const result = {
            page: filePath,
            success: true,
            issues: [],
            checks: {
                hasCommonCSS: false,
                hasTailwindCDN: false,
                hasThemeSystem: false,
                hasSecurityHeaders: false,
                hasCorrectPaths: false
            }
        };

        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Check for common.css with correct relative path
            if (content.includes('href="../assets/css/common.css"')) {
                result.checks.hasCommonCSS = true;
            } else {
                result.issues.push('Missing common.css with correct relative path');
                result.success = false;
            }

            // Check for Tailwind CSS CDN
            if (content.includes('https://cdn.tailwindcss.com')) {
                result.checks.hasTailwindCDN = true;
            } else {
                result.issues.push('Missing Tailwind CSS CDN');
                result.success = false;
            }

            // Check for theme system integration
            if (content.includes('useTheme') && content.includes('useMobileMenu')) {
                result.checks.hasThemeSystem = true;
            } else {
                result.issues.push('Missing theme system integration');
                result.success = false;
            }

            // Check for security headers
            if (content.includes('security-headers.js')) {
                result.checks.hasSecurityHeaders = true;
            } else {
                result.issues.push('Missing security headers');
                result.success = false;
            }

            // Check for correct relative paths in imports
            if (content.includes('../src/shared/index.js') && content.includes('../assets/js/security-headers.js')) {
                result.checks.hasCorrectPaths = true;
            } else {
                result.issues.push('Incorrect relative paths in imports');
                result.success = false;
            }

        } catch (error) {
            result.success = false;
            result.issues.push(`File read error: ${error.message}`);
        }

        return result;
    }

    updateCounters(result) {
        this.results.summary.totalPages++;
        if (result.success) {
            this.results.summary.passedPages++;
        } else {
            this.results.summary.failedPages++;
        }
    }

    generateReport() {
        console.log('📊 VENDOR PORTAL CSS TEST RESULTS\n');
        console.log(`✅ Passed: ${this.results.summary.passedPages}/${this.results.summary.totalPages}`);
        console.log(`❌ Failed: ${this.results.summary.failedPages}/${this.results.summary.totalPages}\n`);

        this.results.pageDetails.forEach(page => {
            const status = page.success ? '✅' : '❌';
            console.log(`${status} ${page.page}`);
            
            if (page.success) {
                console.log('   All CSS loading checks passed');
            } else {
                console.log('   Issues found:');
                page.issues.forEach(issue => {
                    console.log(`   - ${issue}`);
                });
            }

            console.log('   Checks:');
            Object.entries(page.checks).forEach(([check, passed]) => {
                const checkStatus = passed ? '✅' : '❌';
                console.log(`   ${checkStatus} ${check}`);
            });
            console.log('');
        });

        // Save detailed results
        const outputPath = 'vendor-portal-css-test-results.json';
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`💾 Detailed results saved to: ${outputPath}`);
    }
}

// Run the test
const tester = new VendorPortalCSSTest();
tester.runTests().then(results => {
    const allPassed = results.summary.failedPages === 0;
    process.exit(allPassed ? 0 : 1);
}).catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});

export default VendorPortalCSSTest;
