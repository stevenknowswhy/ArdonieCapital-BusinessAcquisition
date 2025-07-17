#!/usr/bin/env node

/**
 * Footer Implementation Audit Script
 * 
 * This script performs a comprehensive audit of footer implementation
 * across all pages in the Ardonie Capital platform to verify that
 * the standardized footer is properly applied everywhere.
 * 
 * Usage: node scripts/footer-implementation-audit.js
 */

import fs from 'fs';
import path from 'path';

class FooterAudit {
  constructor() {
    this.results = {
      totalPages: 0,
      pagesWithStandardizedFooter: 0,
      pagesWithDynamicLoading: 0,
      pagesMissingFooter: 0,
      pagesWithIncompleteFooter: 0,
      pageDetails: [],
      summary: {
        rootDirectory: [],
        authDirectory: [],
        portalsDirectory: [],
        vendorPortalDirectory: [],
        marketplaceDirectory: [],
        dashboardDirectory: [],
        blogDirectory: [],
        documentsDirectory: [],
        fundingDirectory: [],
        otherDirectories: []
      }
    };
  }

  /**
   * Run comprehensive footer audit
   */
  async runFooterAudit() {
    console.log('🔍 Starting Comprehensive Footer Implementation Audit...\n');
    console.log('📅 Audit Date:', new Date().toISOString());
    console.log('🎯 Goal: Verify standardized footer implementation across all pages');
    console.log('=' .repeat(70));

    try {
      // Find all HTML files in the project
      const htmlFiles = this.findAllHtmlFiles('.');
      
      console.log(`\n📄 Found ${htmlFiles.length} HTML files to audit\n`);

      // Audit each file
      for (const file of htmlFiles) {
        const result = this.auditPageFooter(file);
        this.results.pageDetails.push(result);
        this.categorizeResult(result);
        this.updateCounters(result);
      }

      // Generate comprehensive report
      this.generateAuditReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Audit failed:', error);
      return this.results;
    }
  }

  /**
   * Find all HTML files recursively
   */
  findAllHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip certain directories
        if (!['node_modules', '.git', '.vscode', 'codeium', '.cursor'].includes(item)) {
          this.findAllHtmlFiles(fullPath, files);
        }
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Audit footer implementation on a single page
   */
  auditPageFooter(filePath) {
    const result = {
      file: filePath,
      directory: path.dirname(filePath),
      exists: false,
      hasStandardizedFooter: false,
      hasDynamicLoading: false,
      hasCompanyInfo: false,
      hasNavigationSections: false,
      hasSocialLinks: false,
      hasBottomBar: false,
      hasAllRequiredSections: false,
      footerType: 'none',
      issues: [],
      fileSize: 0
    };

    try {
      if (!fs.existsSync(filePath)) {
        result.issues.push('File does not exist');
        return result;
      }

      result.exists = true;
      const content = fs.readFileSync(filePath, 'utf8');
      result.fileSize = content.length;

      // Check for standardized footer structure
      result.hasStandardizedFooter = content.includes('<footer class="bg-slate-900 text-white py-10">');
      
      // Check for dynamic loading (should be removed)
      result.hasDynamicLoading = content.includes('fetch(\'../components/footer.html\')') ||
                                 content.includes('fetch(\'components/footer.html\')') ||
                                 content.includes('<div id="footer-placeholder"></div>');
      
      // Check for company information
      result.hasCompanyInfo = content.includes('Ardonie Capital') &&
                             content.includes('55 9th Street');
      
      // Check for navigation sections
      result.hasNavigationSections = content.includes('Main Pages') &&
                                    content.includes('Express Programs') &&
                                    content.includes('Professional Services') &&
                                    content.includes('User Portals') &&
                                    content.includes('Account & Support');
      
      // Check for social media links
      result.hasSocialLinks = content.includes('https://twitter.com/ardoniecapital') &&
                             content.includes('https://facebook.com/ardoniecapital') &&
                             content.includes('https://linkedin.com/company/ardoniecapital');
      
      // Check for bottom bar with copyright
      result.hasBottomBar = content.includes('© 2024 Ardonie Capital. All rights reserved') &&
                           content.includes('Terms of Service') &&
                           content.includes('Privacy Policy');

      // Determine footer type and completeness
      if (result.hasStandardizedFooter) {
        result.footerType = 'standardized';
        result.hasAllRequiredSections = result.hasCompanyInfo && 
                                       result.hasNavigationSections && 
                                       result.hasSocialLinks && 
                                       result.hasBottomBar;
      } else if (result.hasDynamicLoading) {
        result.footerType = 'dynamic';
      } else if (content.includes('<footer')) {
        result.footerType = 'custom';
      } else {
        result.footerType = 'missing';
      }

      // Identify issues
      if (result.hasDynamicLoading) {
        result.issues.push('Still using dynamic footer loading');
      }
      if (!result.hasStandardizedFooter && result.footerType !== 'missing') {
        result.issues.push('Has footer but not standardized structure');
      }
      if (result.hasStandardizedFooter && !result.hasCompanyInfo) {
        result.issues.push('Missing company information');
      }
      if (result.hasStandardizedFooter && !result.hasNavigationSections) {
        result.issues.push('Missing navigation sections');
      }
      if (result.hasStandardizedFooter && !result.hasSocialLinks) {
        result.issues.push('Missing social media links');
      }
      if (result.hasStandardizedFooter && !result.hasBottomBar) {
        result.issues.push('Missing bottom bar with copyright');
      }
      if (result.footerType === 'missing') {
        result.issues.push('No footer found');
      }

      return result;
    } catch (error) {
      result.issues.push(`Error reading file: ${error.message}`);
      return result;
    }
  }

  /**
   * Categorize result by directory
   */
  categorizeResult(result) {
    const dir = result.directory;
    
    if (dir === '.') {
      this.results.summary.rootDirectory.push(result);
    } else if (dir.startsWith('auth')) {
      this.results.summary.authDirectory.push(result);
    } else if (dir.startsWith('portals')) {
      this.results.summary.portalsDirectory.push(result);
    } else if (dir.startsWith('vendor-portal')) {
      this.results.summary.vendorPortalDirectory.push(result);
    } else if (dir.startsWith('marketplace')) {
      this.results.summary.marketplaceDirectory.push(result);
    } else if (dir.startsWith('dashboard')) {
      this.results.summary.dashboardDirectory.push(result);
    } else if (dir.startsWith('blog')) {
      this.results.summary.blogDirectory.push(result);
    } else if (dir.startsWith('documents')) {
      this.results.summary.documentsDirectory.push(result);
    } else if (dir.startsWith('funding')) {
      this.results.summary.fundingDirectory.push(result);
    } else {
      this.results.summary.otherDirectories.push(result);
    }
  }

  /**
   * Update counters based on result
   */
  updateCounters(result) {
    this.results.totalPages++;
    
    if (result.hasStandardizedFooter && result.hasAllRequiredSections) {
      this.results.pagesWithStandardizedFooter++;
    }
    
    if (result.hasDynamicLoading) {
      this.results.pagesWithDynamicLoading++;
    }
    
    if (result.footerType === 'missing') {
      this.results.pagesMissingFooter++;
    }
    
    if (result.hasStandardizedFooter && !result.hasAllRequiredSections) {
      this.results.pagesWithIncompleteFooter++;
    }
  }

  /**
   * Generate comprehensive audit report
   */
  generateAuditReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FOOTER IMPLEMENTATION AUDIT REPORT');
    console.log('='.repeat(70));
    
    // Overall statistics
    console.log('\n📈 OVERALL STATISTICS');
    console.log(`Total Pages Audited: ${this.results.totalPages}`);
    console.log(`Pages with Standardized Footer: ${this.results.pagesWithStandardizedFooter}`);
    console.log(`Pages with Dynamic Loading: ${this.results.pagesWithDynamicLoading}`);
    console.log(`Pages Missing Footer: ${this.results.pagesMissingFooter}`);
    console.log(`Pages with Incomplete Footer: ${this.results.pagesWithIncompleteFooter}`);
    
    const successRate = this.results.totalPages > 0 ? 
      ((this.results.pagesWithStandardizedFooter / this.results.totalPages) * 100).toFixed(1) : 0;
    console.log(`Standardization Success Rate: ${successRate}%`);

    // Directory-by-directory analysis
    this.reportDirectoryStatus('Root Directory', this.results.summary.rootDirectory);
    this.reportDirectoryStatus('Auth Directory', this.results.summary.authDirectory);
    this.reportDirectoryStatus('Portals Directory', this.results.summary.portalsDirectory);
    this.reportDirectoryStatus('Vendor Portal Directory', this.results.summary.vendorPortalDirectory);
    this.reportDirectoryStatus('Marketplace Directory', this.results.summary.marketplaceDirectory);
    this.reportDirectoryStatus('Dashboard Directory', this.results.summary.dashboardDirectory);
    this.reportDirectoryStatus('Blog Directory', this.results.summary.blogDirectory);
    this.reportDirectoryStatus('Documents Directory', this.results.summary.documentsDirectory);
    this.reportDirectoryStatus('Funding Directory', this.results.summary.fundingDirectory);
    this.reportDirectoryStatus('Other Directories', this.results.summary.otherDirectories);

    // Issues summary
    this.reportIssuesSummary();

    // Final assessment
    this.generateFinalAssessment();
  }

  /**
   * Report status for a specific directory
   */
  reportDirectoryStatus(directoryName, pages) {
    if (pages.length === 0) return;

    console.log(`\n📁 ${directoryName.toUpperCase()}`);
    
    for (const page of pages) {
      const status = this.getPageStatus(page);
      const fileName = path.basename(page.file);
      console.log(`${status} ${fileName} (${page.footerType})`);
      
      if (page.issues.length > 0) {
        page.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    }
  }

  /**
   * Get status icon for a page
   */
  getPageStatus(page) {
    if (page.hasStandardizedFooter && page.hasAllRequiredSections) {
      return '✅';
    } else if (page.hasDynamicLoading) {
      return '🔄';
    } else if (page.footerType === 'missing') {
      return '❌';
    } else if (page.hasStandardizedFooter && !page.hasAllRequiredSections) {
      return '⚠️';
    } else {
      return '🔧';
    }
  }

  /**
   * Report issues summary
   */
  reportIssuesSummary() {
    console.log('\n🚨 ISSUES SUMMARY');
    
    const pagesWithIssues = this.results.pageDetails.filter(page => page.issues.length > 0);
    
    if (pagesWithIssues.length === 0) {
      console.log('✅ No issues found - all pages have proper footer implementation');
      return;
    }

    console.log(`Found ${pagesWithIssues.length} pages with issues:`);
    
    for (const page of pagesWithIssues) {
      console.log(`\n❌ ${page.file}:`);
      page.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }

  /**
   * Generate final assessment
   */
  generateFinalAssessment() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 FINAL ASSESSMENT');
    console.log('='.repeat(70));
    
    const successRate = (this.results.pagesWithStandardizedFooter / this.results.totalPages) * 100;
    
    if (successRate === 100 && this.results.pagesWithDynamicLoading === 0) {
      console.log('🎉 FOOTER STANDARDIZATION: COMPLETE');
      console.log('✅ All pages have standardized footer implementation');
      console.log('✅ No pages using dynamic loading');
      console.log('✅ All required footer sections present');
      console.log('🚀 Platform ready for production');
    } else if (successRate >= 90) {
      console.log('⚠️  FOOTER STANDARDIZATION: MOSTLY COMPLETE');
      console.log(`✅ ${this.results.pagesWithStandardizedFooter}/${this.results.totalPages} pages standardized`);
      console.log('🔧 Minor issues need attention');
    } else {
      console.log('❌ FOOTER STANDARDIZATION: INCOMPLETE');
      console.log(`⚠️  ${this.results.pagesWithStandardizedFooter}/${this.results.totalPages} pages standardized`);
      console.log('🔧 Significant work needed');
    }

    if (this.results.pagesWithDynamicLoading > 0) {
      console.log(`\n🔄 ${this.results.pagesWithDynamicLoading} pages still using dynamic loading`);
    }
    
    if (this.results.pagesMissingFooter > 0) {
      console.log(`\n❌ ${this.results.pagesMissingFooter} pages missing footer completely`);
    }
  }
}

// Run audit if called directly
if (import.meta.url.includes('footer-implementation-audit.js')) {
  const auditor = new FooterAudit();
  auditor.runFooterAudit()
    .then(results => {
      // Save results to file
      fs.writeFileSync(
        'scripts/footer-audit-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Detailed results saved to scripts/footer-audit-results.json');
    })
    .catch(error => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}

export default FooterAudit;
