#!/usr/bin/env node

/**
 * Platform Testing Script
 * Automated testing for key platform functionality
 */

import http from 'http';
import fs from 'fs';

class PlatformTester {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.testResults = [];
        this.errors = [];
    }

    /**
     * Test if a URL is accessible
     */
    async testUrl(path, description) {
        return new Promise((resolve) => {
            const url = `${this.baseUrl}${path}`;
            
            const req = http.get(url, (res) => {
                const success = res.statusCode === 200;
                const result = {
                    path,
                    description,
                    status: res.statusCode,
                    success,
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                
                if (success) {
                    console.log(`✅ ${description}: ${path}`);
                } else {
                    console.log(`❌ ${description}: ${path} (Status: ${res.statusCode})`);
                    this.errors.push(result);
                }
                
                resolve(result);
            });

            req.on('error', (error) => {
                const result = {
                    path,
                    description,
                    status: 'ERROR',
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                this.errors.push(result);
                console.log(`❌ ${description}: ${path} (Error: ${error.message})`);
                resolve(result);
            });

            req.setTimeout(5000, () => {
                req.destroy();
                const result = {
                    path,
                    description,
                    status: 'TIMEOUT',
                    success: false,
                    error: 'Request timeout',
                    timestamp: new Date().toISOString()
                };
                
                this.testResults.push(result);
                this.errors.push(result);
                console.log(`❌ ${description}: ${path} (Timeout)`);
                resolve(result);
            });
        });
    }

    /**
     * Run comprehensive platform tests
     */
    async runTests() {
        console.log('🧪 Starting Ardonie Capital Platform Tests...\n');

        // Core pages
        await this.testUrl('/', 'Home Page');
        await this.testUrl('/about', 'About Page');
        await this.testUrl('/contact', 'Contact Page');
        await this.testUrl('/how-it-works', 'How It Works Page');
        await this.testUrl('/express-deal', 'Express Deal Page');

        // Marketplace
        await this.testUrl('/marketplace/listings', 'Marketplace Listings');
        await this.testUrl('/for-buyers', 'For Buyers Page');
        await this.testUrl('/for-sellers', 'For Sellers Page');

        // Portals
        await this.testUrl('/portals/buyer-portal', 'Buyer Portal');
        await this.testUrl('/portals/seller-portal', 'Seller Portal');
        await this.testUrl('/portals/attorney-portal', 'Attorney Portal');
        await this.testUrl('/portals/accountant-portal', 'Accountant Portal');
        await this.testUrl('/portals/lender-portal', 'Lender Portal');

        // Dashboards
        await this.testUrl('/dashboard/buyer-dashboard', 'Buyer Dashboard');
        await this.testUrl('/dashboard/seller-dashboard', 'Seller Dashboard');

        // Content pages
        await this.testUrl('/blog', 'Blog Index');
        await this.testUrl('/careers', 'Careers Page');
        await this.testUrl('/partner-with-us', 'Partner With Us');

        // Legal pages
        await this.testUrl('/terms-of-service', 'Terms of Service');
        await this.testUrl('/privacy-policy', 'Privacy Policy');
        await this.testUrl('/cookie-policy', 'Cookie Policy');

        // Assets
        await this.testUrl('/assets/css/common.css', 'Common CSS');
        await this.testUrl('/assets/js/common.js', 'Common JavaScript');
        await this.testUrl('/assets/js/marketplace-listings.js', 'Marketplace JavaScript');

        // Generate report
        this.generateReport();
    }

    /**
     * Generate test report
     */
    generateReport() {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = this.errors.length;
        const successRate = Math.round((passedTests / totalTests) * 100);

        console.log('\n📊 Test Results Summary');
        console.log('========================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);

        if (this.errors.length > 0) {
            console.log('\n❌ Failed Tests:');
            this.errors.forEach(error => {
                console.log(`   - ${error.description}: ${error.path} (${error.status})`);
            });
        }

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate
            },
            results: this.testResults,
            errors: this.errors
        };

        fs.writeFileSync('platform-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Detailed report saved to: platform-test-report.json');

        if (successRate >= 90) {
            console.log('\n🎉 Platform testing PASSED! Ready for user testing.');
        } else if (successRate >= 70) {
            console.log('\n⚠️ Platform testing PARTIAL. Some issues need attention.');
        } else {
            console.log('\n❌ Platform testing FAILED. Critical issues need fixing.');
        }
    }
}

// Run tests if server is available
const tester = new PlatformTester();

// Check if server is running first
http.get('http://localhost:3000', (res) => {
    console.log('🚀 Development server detected. Starting tests...\n');
    tester.runTests();
}).on('error', (error) => {
    console.log('❌ Development server not running.');
    console.log('Please start the server first: node scripts/start-dev-server.js');
    process.exit(1);
});

export default PlatformTester;
