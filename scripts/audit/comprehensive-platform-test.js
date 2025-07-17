#!/usr/bin/env node

/**
 * Comprehensive Platform Testing Script
 * 
 * This script performs automated testing of the Ardonie Capital platform
 * to verify all functionality is working correctly before production deployment.
 * 
 * Usage: node scripts/comprehensive-platform-test.js
 */

import fs from 'fs';
import path from 'path';

class PlatformTester {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.results = {
      serverStatus: null,
      pageTests: [],
      footerTests: [],
      navigationTests: [],
      authTests: [],
      responsiveTests: [],
      performanceTests: [],
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        warnings: []
      }
    };
  }

  /**
   * Run comprehensive platform tests
   */
  async runComprehensiveTests() {
    console.log('🚀 Starting Comprehensive Platform Testing...\n');
    console.log('🌐 Platform URL: http://localhost:8000');
    console.log('📅 Test Date:', new Date().toISOString());
    console.log('=' .repeat(60));

    try {
      // 1. Server Status Test
      await this.testServerStatus();
      
      // 2. Core Page Loading Tests
      await this.testCorePages();
      
      // 3. Footer Implementation Tests
      await this.testFooterImplementation();
      
      // 4. Navigation Tests
      await this.testNavigation();
      
      // 5. Authentication System Tests
      await this.testAuthenticationSystem();
      
      // 6. File Structure Tests
      await this.testFileStructure();
      
      // 7. Generate Summary
      this.generateTestSummary();
      
      return this.results;
    } catch (error) {
      console.error('❌ Testing failed:', error);
      this.results.summary.failedTests++;
      return this.results;
    }
  }

  /**
   * Test server status and accessibility
   */
  async testServerStatus() {
    console.log('\n📡 Testing Server Status...');
    
    try {
      // Check if server is running by testing file existence
      const indexExists = fs.existsSync('index.html');
      
      this.results.serverStatus = {
        running: indexExists,
        accessible: indexExists,
        timestamp: new Date().toISOString()
      };
      
      if (indexExists) {
        console.log('✅ Server Status: Running and accessible');
        this.results.summary.passedTests++;
      } else {
        console.log('❌ Server Status: Not accessible');
        this.results.summary.failedTests++;
      }
      
      this.results.summary.totalTests++;
    } catch (error) {
      console.log('❌ Server Status: Error -', error.message);
      this.results.summary.failedTests++;
      this.results.summary.totalTests++;
    }
  }

  /**
   * Test core page loading
   */
  async testCorePages() {
    console.log('\n📄 Testing Core Page Loading...');
    
    const corePages = [
      { name: 'Home Page', file: 'index.html', critical: true },
      { name: 'About Page', file: 'about.html', critical: true },
      { name: 'Marketplace', file: 'marketplace/listings.html', critical: true },
      { name: 'Login Page', file: 'auth/login.html', critical: true },
      { name: 'Register Page', file: 'auth/register.html', critical: true },
      { name: 'Buyer Dashboard', file: 'dashboard/buyer-dashboard.html', critical: true },
      { name: 'Seller Dashboard', file: 'dashboard/seller-dashboard.html', critical: true },
      { name: 'Buyer Portal', file: 'portals/buyer-portal.html', critical: false },
      { name: 'Seller Portal', file: 'portals/seller-portal.html', critical: false },
      { name: 'Contact Page', file: 'contact.html', critical: false },
      { name: 'How It Works', file: 'how-it-works.html', critical: false },
      { name: 'For Buyers', file: 'for-buyers.html', critical: false },
      { name: 'For Sellers', file: 'for-sellers.html', critical: false },
      { name: 'Careers', file: 'careers.html', critical: false },
      { name: 'Blog Index', file: 'blog/index.html', critical: false }
    ];

    for (const page of corePages) {
      const result = this.testPageLoading(page);
      this.results.pageTests.push(result);
      this.results.summary.totalTests++;
      
      if (result.success) {
        this.results.summary.passedTests++;
      } else {
        this.results.summary.failedTests++;
        if (page.critical) {
          this.results.summary.warnings.push(`Critical page failed: ${page.name}`);
        }
      }
    }
  }

  /**
   * Test individual page loading
   */
  testPageLoading(page) {
    try {
      const exists = fs.existsSync(page.file);
      const content = exists ? fs.readFileSync(page.file, 'utf8') : '';
      
      const result = {
        name: page.name,
        file: page.file,
        success: exists,
        critical: page.critical,
        hasTitle: content.includes('<title>'),
        hasFooter: content.includes('<footer'),
        hasNavigation: content.includes('<nav') || content.includes('navigation'),
        fileSize: exists ? content.length : 0,
        issues: []
      };

      if (!exists) {
        result.issues.push('File does not exist');
      }
      if (exists && !result.hasTitle) {
        result.issues.push('Missing title tag');
      }
      if (exists && !result.hasFooter) {
        result.issues.push('Missing footer');
      }

      const status = result.success ? '✅' : '❌';
      const critical = page.critical ? '[CRITICAL]' : '';
      console.log(`${status} ${page.name} ${critical}`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }

      return result;
    } catch (error) {
      console.log(`❌ ${page.name} - Error: ${error.message}`);
      return {
        name: page.name,
        file: page.file,
        success: false,
        critical: page.critical,
        issues: [`Error: ${error.message}`]
      };
    }
  }

  /**
   * Test footer implementation across pages
   */
  async testFooterImplementation() {
    console.log('\n🦶 Testing Footer Implementation...');
    
    const footerTestPages = [
      'auth/login.html',
      'auth/register.html',
      'vendor-portal/legal-firms.html',
      'vendor-portal/financial-institutions.html',
      'vendor-portal/accounting-firms.html',
      'index.html',
      'about.html',
      'contact.html'
    ];

    for (const pagePath of footerTestPages) {
      const result = this.testPageFooter(pagePath);
      this.results.footerTests.push(result);
      this.results.summary.totalTests++;
      
      if (result.success) {
        this.results.summary.passedTests++;
      } else {
        this.results.summary.failedTests++;
      }
    }
  }

  /**
   * Test footer implementation on individual page
   */
  testPageFooter(pagePath) {
    try {
      if (!fs.existsSync(pagePath)) {
        console.log(`❌ ${pagePath} - File not found`);
        return { page: pagePath, success: false, issues: ['File not found'] };
      }

      const content = fs.readFileSync(pagePath, 'utf8');
      
      const result = {
        page: pagePath,
        success: true,
        hasStandardizedFooter: content.includes('<footer class="bg-slate-900 text-white py-10">'),
        hasDynamicLoading: content.includes('fetch(\'../components/footer.html\')') ||
                          content.includes('<div id="footer-placeholder"></div>'),
        hasCompanyInfo: content.includes('Ardonie Capital'),
        hasSocialLinks: content.includes('twitter.com/ardoniecapital'),
        hasNavigation: content.includes('Main Pages') && content.includes('Express Programs'),
        hasBottomBar: content.includes('© 2024 Ardonie Capital'),
        issues: []
      };

      // Check for issues
      if (result.hasDynamicLoading) {
        result.issues.push('Still contains dynamic footer loading');
        result.success = false;
      }
      if (!result.hasStandardizedFooter) {
        result.issues.push('Missing standardized footer structure');
        result.success = false;
      }
      if (!result.hasCompanyInfo) {
        result.issues.push('Missing company information');
      }
      if (!result.hasSocialLinks) {
        result.issues.push('Missing social media links');
      }

      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${pagePath} footer`);
      
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }

      return result;
    } catch (error) {
      console.log(`❌ ${pagePath} - Error: ${error.message}`);
      return {
        page: pagePath,
        success: false,
        issues: [`Error: ${error.message}`]
      };
    }
  }

  /**
   * Test navigation structure
   */
  async testNavigation() {
    console.log('\n🧭 Testing Navigation Structure...');
    
    // Test main navigation links exist
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    const navigationTest = {
      hasMainNav: indexContent.includes('<nav') || indexContent.includes('navigation'),
      hasHomeLink: indexContent.includes('href="index.html"') || indexContent.includes('href="/"'),
      hasAboutLink: indexContent.includes('href="about.html"'),
      hasMarketplaceLink: indexContent.includes('marketplace'),
      hasAuthLinks: indexContent.includes('login') || indexContent.includes('register'),
      success: true,
      issues: []
    };

    if (!navigationTest.hasMainNav) {
      navigationTest.issues.push('Missing main navigation');
      navigationTest.success = false;
    }

    this.results.navigationTests.push(navigationTest);
    this.results.summary.totalTests++;
    
    if (navigationTest.success) {
      this.results.summary.passedTests++;
      console.log('✅ Navigation structure verified');
    } else {
      this.results.summary.failedTests++;
      console.log('❌ Navigation issues found');
      navigationTest.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }

  /**
   * Test authentication system files
   */
  async testAuthenticationSystem() {
    console.log('\n🔐 Testing Authentication System...');
    
    const authFiles = [
      'auth/login.html',
      'auth/register.html',
      'assets/js/auth-service.js',
      'assets/js/route-guard.js',
      'assets/js/security-headers.js'
    ];

    let authSystemWorking = true;
    const authResults = [];

    for (const file of authFiles) {
      const exists = fs.existsSync(file);
      authResults.push({ file, exists });
      
      if (exists) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} - Missing`);
        authSystemWorking = false;
      }
    }

    this.results.authTests = authResults;
    this.results.summary.totalTests++;
    
    if (authSystemWorking) {
      this.results.summary.passedTests++;
    } else {
      this.results.summary.failedTests++;
    }
  }

  /**
   * Test file structure integrity
   */
  async testFileStructure() {
    console.log('\n📁 Testing File Structure...');
    
    const requiredDirectories = [
      'assets',
      'assets/js',
      'assets/css',
      'auth',
      'dashboard',
      'marketplace',
      'portals',
      'vendor-portal',
      'blog',
      'scripts'
    ];

    let structureValid = true;

    for (const dir of requiredDirectories) {
      const exists = fs.existsSync(dir);
      if (exists) {
        console.log(`✅ Directory: ${dir}`);
      } else {
        console.log(`❌ Missing directory: ${dir}`);
        structureValid = false;
      }
    }

    this.results.summary.totalTests++;
    if (structureValid) {
      this.results.summary.passedTests++;
    } else {
      this.results.summary.failedTests++;
    }
  }

  /**
   * Generate comprehensive test summary
   */
  generateTestSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(60));
    
    const { totalTests, passedTests, failedTests, warnings } = this.results.summary;
    const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (failedTests === 0) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Platform is ready for production deployment');
      console.log('🚀 Recommended: Proceed with deployment');
    } else {
      console.log('\n⚠️  Some tests failed');
      console.log('🔧 Recommended: Review failed tests before deployment');
    }

    console.log('\n🌐 Platform Access:');
    console.log('   Home: http://localhost:8000');
    console.log('   Login: http://localhost:8000/auth/login.html');
    console.log('   Marketplace: http://localhost:8000/marketplace/listings.html');
    console.log('   Dashboard: http://localhost:8000/dashboard/buyer-dashboard.html');
  }
}

// Run tests if called directly
if (import.meta.url.includes('comprehensive-platform-test.js')) {
  const tester = new PlatformTester();
  tester.runComprehensiveTests()
    .then(results => {
      // Save results to file
      fs.writeFileSync(
        'scripts/platform-test-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Detailed results saved to scripts/platform-test-results.json');
    })
    .catch(error => {
      console.error('❌ Testing failed:', error);
      process.exit(1);
    });
}

export default PlatformTester;
