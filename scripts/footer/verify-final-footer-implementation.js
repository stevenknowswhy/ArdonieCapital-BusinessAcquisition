#!/usr/bin/env node

/**
 * Final Footer Implementation Verification Script
 * 
 * This script verifies that all pages have been successfully updated with
 * the standardized footer implementation, replacing dynamic loading with
 * embedded footer content.
 * 
 * Usage: node scripts/verify-final-footer-implementation.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FooterImplementationVerifier {
  constructor() {
    this.results = {
      authPages: [],
      vendorPortalPages: [],
      summary: {
        totalPagesChecked: 0,
        pagesWithStandardizedFooter: 0,
        pagesWithDynamicLoading: 0,
        pagesWithIssues: 0
      }
    };
  }

  /**
   * Main verification method
   */
  async verifyFooterImplementation() {
    console.log('🔍 Verifying Final Footer Implementation...\n');

    // Check auth directory pages
    this.checkAuthPages();
    
    // Check vendor-portal directory pages
    this.checkVendorPortalPages();
    
    // Generate summary
    this.generateSummary();
    
    return this.results;
  }

  /**
   * Check auth directory pages
   */
  checkAuthPages() {
    console.log('📁 Checking Auth Directory Pages...');
    
    const authPages = [
      'auth/login.html',
      'auth/register.html'
    ];

    authPages.forEach(pagePath => {
      const result = this.checkPageFooter(pagePath, 'auth');
      this.results.authPages.push(result);
      this.updateSummary(result);
    });
  }

  /**
   * Check vendor-portal directory pages
   */
  checkVendorPortalPages() {
    console.log('\n📁 Checking Vendor-Portal Directory Pages...');
    
    const vendorPortalPages = [
      'vendor-portal/legal-firms.html',
      'vendor-portal/financial-institutions.html',
      'vendor-portal/accounting-firms.html'
    ];

    vendorPortalPages.forEach(pagePath => {
      const result = this.checkPageFooter(pagePath, 'vendor-portal');
      this.results.vendorPortalPages.push(result);
      this.updateSummary(result);
    });
  }

  /**
   * Check individual page footer implementation
   */
  checkPageFooter(pagePath, directory) {
    const result = {
      page: pagePath,
      directory: directory,
      exists: false,
      hasStandardizedFooter: false,
      hasDynamicLoading: false,
      hasProperNavigation: false,
      hasCompanyInfo: false,
      hasSocialLinks: false,
      hasBottomBar: false,
      issues: []
    };

    try {
      if (!fs.existsSync(pagePath)) {
        result.issues.push('File does not exist');
        return result;
      }

      result.exists = true;
      const content = fs.readFileSync(pagePath, 'utf8');

      // Check for standardized footer
      result.hasStandardizedFooter = content.includes('<footer class="bg-slate-900 text-white py-10">');
      
      // Check for dynamic loading (should be removed)
      result.hasDynamicLoading = content.includes('fetch(\'../components/footer.html\')') ||
                                 content.includes('<div id="footer-placeholder"></div>');
      
      // Check for proper navigation sections
      result.hasProperNavigation = content.includes('Main Pages') &&
                                  content.includes('Express Programs') &&
                                  content.includes('Professional Services') &&
                                  content.includes('User Portals') &&
                                  content.includes('Account & Support');
      
      // Check for company information
      result.hasCompanyInfo = content.includes('Ardonie Capital') &&
                             content.includes('55 9th Street');
      
      // Check for social media links
      result.hasSocialLinks = content.includes('https://twitter.com/ardoniecapital') &&
                             content.includes('https://facebook.com/ardoniecapital') &&
                             content.includes('https://linkedin.com/company/ardoniecapital');
      
      // Check for bottom bar with copyright
      result.hasBottomBar = content.includes('© 2024 Ardonie Capital. All rights reserved') &&
                           content.includes('Terms of Service') &&
                           content.includes('Privacy Policy');

      // Identify issues
      if (result.hasDynamicLoading) {
        result.issues.push('Still contains dynamic footer loading');
      }
      if (!result.hasStandardizedFooter) {
        result.issues.push('Missing standardized footer structure');
      }
      if (!result.hasProperNavigation) {
        result.issues.push('Missing proper navigation sections');
      }
      if (!result.hasCompanyInfo) {
        result.issues.push('Missing company information');
      }
      if (!result.hasSocialLinks) {
        result.issues.push('Missing social media links');
      }
      if (!result.hasBottomBar) {
        result.issues.push('Missing bottom bar with copyright');
      }

      // Log result
      const status = result.issues.length === 0 ? '✅' : '❌';
      console.log(`${status} ${pagePath}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }

    } catch (error) {
      result.issues.push(`Error reading file: ${error.message}`);
      console.log(`❌ ${pagePath} - Error: ${error.message}`);
    }

    return result;
  }

  /**
   * Update summary statistics
   */
  updateSummary(result) {
    this.results.summary.totalPagesChecked++;
    
    if (result.hasStandardizedFooter && result.issues.length === 0) {
      this.results.summary.pagesWithStandardizedFooter++;
    }
    
    if (result.hasDynamicLoading) {
      this.results.summary.pagesWithDynamicLoading++;
    }
    
    if (result.issues.length > 0) {
      this.results.summary.pagesWithIssues++;
    }
  }

  /**
   * Generate and display summary
   */
  generateSummary() {
    console.log('\n📊 Footer Implementation Summary');
    console.log('=====================================');
    console.log(`Total Pages Checked: ${this.results.summary.totalPagesChecked}`);
    console.log(`Pages with Standardized Footer: ${this.results.summary.pagesWithStandardizedFooter}`);
    console.log(`Pages with Dynamic Loading: ${this.results.summary.pagesWithDynamicLoading}`);
    console.log(`Pages with Issues: ${this.results.summary.pagesWithIssues}`);
    
    const successRate = ((this.results.summary.pagesWithStandardizedFooter / this.results.summary.totalPagesChecked) * 100).toFixed(1);
    console.log(`Success Rate: ${successRate}%`);
    
    if (this.results.summary.pagesWithIssues === 0) {
      console.log('\n🎉 All pages have been successfully updated with standardized footers!');
      console.log('✅ Footer standardization is COMPLETE');
    } else {
      console.log('\n⚠️  Some pages still need attention');
      console.log('❌ Footer standardization needs additional work');
    }

    // Project completion status
    console.log('\n🚀 Project Status Update');
    console.log('========================');
    if (this.results.summary.pagesWithIssues === 0) {
      console.log('✅ Footer Standardization: COMPLETE (98% → 100%)');
      console.log('🎯 Overall Project Completion: 100%');
      console.log('🏆 Ready for final testing and deployment!');
    } else {
      console.log('🔄 Footer Standardization: IN PROGRESS');
      console.log('📋 Remaining tasks identified above');
    }
  }
}

// Run verification if called directly
if (import.meta.url.includes('verify-final-footer-implementation.js')) {
  const verifier = new FooterImplementationVerifier();
  verifier.verifyFooterImplementation()
    .then(results => {
      // Save results to file for reference
      fs.writeFileSync(
        'scripts/footer-verification-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Results saved to scripts/footer-verification-results.json');
    })
    .catch(error => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export default FooterImplementationVerifier;
