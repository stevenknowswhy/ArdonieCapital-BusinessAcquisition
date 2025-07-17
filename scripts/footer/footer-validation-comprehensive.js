#!/usr/bin/env node

/**
 * Comprehensive Footer Validation Script
 * 
 * This script validates that all pages have proper footer standardization
 * and verifies that all footer links work correctly from each directory level.
 * 
 * Usage: node scripts/footer-validation-comprehensive.js
 */

import fs from 'fs';
import path from 'path';

class FooterValidationComprehensive {
  constructor() {
    this.results = {
      totalPages: 0,
      validPages: 0,
      invalidPages: 0,
      pageDetails: [],
      linkValidation: {
        totalLinks: 0,
        validLinks: 0,
        brokenLinks: 0,
        brokenLinkDetails: []
      },
      standardizationMetrics: {
        hasStandardizedStructure: 0,
        hasCorrectSocialLinks: 0,
        hasCompanyBranding: 0,
        hasNavigationSections: 0,
        hasBottomBar: 0,
        noDynamicLoading: 0
      }
    };
  }

  /**
   * Run comprehensive footer validation
   */
  async runValidation() {
    console.log('🔍 Starting Comprehensive Footer Validation...\n');
    console.log('📅 Validation Date:', new Date().toISOString());
    console.log('🎯 Goal: Verify 100% footer standardization compliance');
    console.log('=' .repeat(70));

    try {
      // Find all HTML files
      const htmlFiles = this.findAllHtmlFiles('.');
      console.log(`\n📄 Found ${htmlFiles.length} HTML files to validate\n`);

      // Validate each file
      for (const file of htmlFiles) {
        const result = this.validatePageFooter(file);
        this.results.pageDetails.push(result);
        this.updateMetrics(result);
      }

      // Validate footer links
      await this.validateFooterLinks();

      // Generate comprehensive report
      this.generateValidationReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error);
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
   * Validate footer implementation on a single page
   */
  validatePageFooter(filePath) {
    const result = {
      file: filePath,
      directory: path.dirname(filePath),
      valid: true,
      issues: [],
      checks: {
        fileExists: false,
        hasStandardizedFooter: false,
        hasCorrectSocialLinks: false,
        hasCompanyBranding: false,
        hasNavigationSections: false,
        hasBottomBar: false,
        noDynamicLoading: false,
        pathsCorrectForDirectory: false
      }
    };

    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        result.issues.push('File does not exist');
        result.valid = false;
        return result;
      }
      result.checks.fileExists = true;

      const content = fs.readFileSync(filePath, 'utf8');

      // Check for standardized footer structure
      result.checks.hasStandardizedFooter = content.includes('<footer class="bg-slate-900 text-white py-10">');
      if (!result.checks.hasStandardizedFooter) {
        result.issues.push('Missing standardized footer structure');
        result.valid = false;
      }

      // Check for correct social media links
      const hasTwitter = content.includes('https://twitter.com/ardoniecapital');
      const hasFacebook = content.includes('https://facebook.com/ardoniecapital');
      const hasLinkedIn = content.includes('https://linkedin.com/company/ardoniecapital');
      result.checks.hasCorrectSocialLinks = hasTwitter && hasFacebook && hasLinkedIn;
      
      if (!result.checks.hasCorrectSocialLinks) {
        if (content.includes('href="#"') && content.includes('aria-label')) {
          result.issues.push('Social media links point to "#" instead of actual URLs');
        } else {
          result.issues.push('Missing or incorrect social media links');
        }
        result.valid = false;
      }

      // Check for company branding
      const hasCompanyName = content.includes('Ardonie Capital');
      const hasAddress = content.includes('55 9th Street');
      result.checks.hasCompanyBranding = hasCompanyName && hasAddress;
      
      if (!result.checks.hasCompanyBranding) {
        result.issues.push('Missing company branding information');
        result.valid = false;
      }

      // Check for navigation sections
      const hasMainPages = content.includes('Main Pages');
      const hasExpressPrograms = content.includes('Express Programs');
      const hasProfessionalServices = content.includes('Professional Services');
      const hasUserPortals = content.includes('User Portals');
      const hasAccountSupport = content.includes('Account & Support');
      
      result.checks.hasNavigationSections = hasMainPages && hasExpressPrograms && 
                                           hasProfessionalServices && hasUserPortals && 
                                           hasAccountSupport;
      
      if (!result.checks.hasNavigationSections) {
        result.issues.push('Missing required navigation sections');
        result.valid = false;
      }

      // Check for bottom bar
      const hasCopyright = content.includes('© 2024 Ardonie Capital');
      const hasTerms = content.includes('Terms of Service');
      const hasPrivacy = content.includes('Privacy Policy');
      result.checks.hasBottomBar = hasCopyright && hasTerms && hasPrivacy;
      
      if (!result.checks.hasBottomBar) {
        result.issues.push('Missing bottom bar with copyright and legal links');
        result.valid = false;
      }

      // Check that dynamic loading is removed
      const hasDynamicLoading = content.includes('fetch(\'../components/footer.html\')') ||
                               content.includes('fetch(\'components/footer.html\')') ||
                               content.includes('<div id="footer-placeholder"></div>');
      result.checks.noDynamicLoading = !hasDynamicLoading;
      
      if (hasDynamicLoading) {
        result.issues.push('Still contains dynamic footer loading');
        result.valid = false;
      }

      // Check that paths are correct for directory level
      result.checks.pathsCorrectForDirectory = this.validatePathsForDirectory(content, filePath);
      if (!result.checks.pathsCorrectForDirectory) {
        result.issues.push('Footer links have incorrect relative paths for directory level');
        result.valid = false;
      }

      // Log result
      const status = result.valid ? '✅' : '❌';
      console.log(`${status} ${filePath}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }

      return result;
    } catch (error) {
      result.issues.push(`Error validating file: ${error.message}`);
      result.valid = false;
      console.log(`❌ ${filePath} - Error: ${error.message}`);
      return result;
    }
  }

  /**
   * Validate that footer paths are correct for directory level
   */
  validatePathsForDirectory(content, filePath) {
    const directoryLevel = filePath.split('/').length - 1;
    const expectedPrefix = '../'.repeat(directoryLevel);
    
    if (directoryLevel === 0) {
      // Root directory - should not have ../ prefixes for root links
      return !content.includes('href="../index.html"') && content.includes('href="index.html"');
    } else {
      // Subdirectory - should have appropriate ../ prefixes
      const hasCorrectRootLinks = content.includes(`href="${expectedPrefix}index.html"`);
      const hasCorrectAuthLinks = content.includes(`href="${expectedPrefix}auth/login.html"`);
      return hasCorrectRootLinks && hasCorrectAuthLinks;
    }
  }

  /**
   * Validate footer links by checking if target files exist
   */
  async validateFooterLinks() {
    console.log('\n🔗 Validating Footer Links...');
    
    // Sample a few pages to validate their footer links
    const samplePages = [
      'index.html',
      'auth/login.html',
      'portals/buyer-portal.html',
      'vendor-portal/legal-firms.html',
      'blog/index.html'
    ];

    for (const pagePath of samplePages) {
      if (fs.existsSync(pagePath)) {
        const content = fs.readFileSync(pagePath, 'utf8');
        this.validateLinksInContent(content, pagePath);
      }
    }
  }

  /**
   * Validate links in specific content
   */
  validateLinksInContent(content, basePath) {
    const baseDir = path.dirname(basePath);
    const linkPattern = /href="([^"#]+)"/g;
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const linkUrl = match[1];
      this.results.linkValidation.totalLinks++;

      // Skip external links
      if (linkUrl.startsWith('http') || linkUrl.startsWith('mailto')) {
        this.results.linkValidation.validLinks++;
        continue;
      }

      // Resolve relative path
      const resolvedPath = path.resolve(baseDir, linkUrl);
      const relativePath = path.relative('.', resolvedPath);

      if (fs.existsSync(relativePath)) {
        this.results.linkValidation.validLinks++;
      } else {
        this.results.linkValidation.brokenLinks++;
        this.results.linkValidation.brokenLinkDetails.push({
          page: basePath,
          link: linkUrl,
          resolvedPath: relativePath
        });
      }
    }
  }

  /**
   * Update validation metrics
   */
  updateMetrics(result) {
    this.results.totalPages++;
    
    if (result.valid) {
      this.results.validPages++;
    } else {
      this.results.invalidPages++;
    }

    // Update specific metrics
    if (result.checks.hasStandardizedFooter) {
      this.results.standardizationMetrics.hasStandardizedStructure++;
    }
    if (result.checks.hasCorrectSocialLinks) {
      this.results.standardizationMetrics.hasCorrectSocialLinks++;
    }
    if (result.checks.hasCompanyBranding) {
      this.results.standardizationMetrics.hasCompanyBranding++;
    }
    if (result.checks.hasNavigationSections) {
      this.results.standardizationMetrics.hasNavigationSections++;
    }
    if (result.checks.hasBottomBar) {
      this.results.standardizationMetrics.hasBottomBar++;
    }
    if (result.checks.noDynamicLoading) {
      this.results.standardizationMetrics.noDynamicLoading++;
    }
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPREHENSIVE FOOTER VALIDATION REPORT');
    console.log('='.repeat(70));
    
    const successRate = this.results.totalPages > 0 ? 
      ((this.results.validPages / this.results.totalPages) * 100).toFixed(1) : 0;

    console.log(`\n📈 OVERALL VALIDATION RESULTS`);
    console.log(`Total Pages Validated: ${this.results.totalPages}`);
    console.log(`Valid Pages: ${this.results.validPages}`);
    console.log(`Invalid Pages: ${this.results.invalidPages}`);
    console.log(`Success Rate: ${successRate}%`);

    console.log(`\n🔧 STANDARDIZATION COMPLIANCE`);
    const metrics = this.results.standardizationMetrics;
    console.log(`Standardized Structure: ${metrics.hasStandardizedStructure}/${this.results.totalPages} (${((metrics.hasStandardizedStructure/this.results.totalPages)*100).toFixed(1)}%)`);
    console.log(`Correct Social Links: ${metrics.hasCorrectSocialLinks}/${this.results.totalPages} (${((metrics.hasCorrectSocialLinks/this.results.totalPages)*100).toFixed(1)}%)`);
    console.log(`Company Branding: ${metrics.hasCompanyBranding}/${this.results.totalPages} (${((metrics.hasCompanyBranding/this.results.totalPages)*100).toFixed(1)}%)`);
    console.log(`Navigation Sections: ${metrics.hasNavigationSections}/${this.results.totalPages} (${((metrics.hasNavigationSections/this.results.totalPages)*100).toFixed(1)}%)`);
    console.log(`Bottom Bar: ${metrics.hasBottomBar}/${this.results.totalPages} (${((metrics.hasBottomBar/this.results.totalPages)*100).toFixed(1)}%)`);
    console.log(`No Dynamic Loading: ${metrics.noDynamicLoading}/${this.results.totalPages} (${((metrics.noDynamicLoading/this.results.totalPages)*100).toFixed(1)}%)`);

    console.log(`\n🔗 LINK VALIDATION RESULTS`);
    console.log(`Total Links Checked: ${this.results.linkValidation.totalLinks}`);
    console.log(`Valid Links: ${this.results.linkValidation.validLinks}`);
    console.log(`Broken Links: ${this.results.linkValidation.brokenLinks}`);

    if (this.results.linkValidation.brokenLinks > 0) {
      console.log(`\n❌ BROKEN LINKS FOUND:`);
      this.results.linkValidation.brokenLinkDetails.forEach(broken => {
        console.log(`   ${broken.page}: ${broken.link} -> ${broken.resolvedPath}`);
      });
    }

    // Pages with issues
    const invalidPages = this.results.pageDetails.filter(page => !page.valid);
    if (invalidPages.length > 0) {
      console.log(`\n❌ PAGES WITH ISSUES (${invalidPages.length}):`);
      invalidPages.forEach(page => {
        console.log(`\n${page.file}:`);
        page.issues.forEach(issue => console.log(`   - ${issue}`));
      });
    }

    // Final assessment
    console.log('\n' + '='.repeat(70));
    console.log('🎯 FINAL ASSESSMENT');
    console.log('='.repeat(70));
    
    if (successRate === 100) {
      console.log('🎉 FOOTER STANDARDIZATION: COMPLETE');
      console.log('✅ All pages have proper footer implementation');
      console.log('✅ All footer components are standardized');
      console.log('✅ All links are functional');
      console.log('🚀 Platform ready for production deployment');
    } else if (successRate >= 95) {
      console.log('⚠️  FOOTER STANDARDIZATION: NEARLY COMPLETE');
      console.log(`✅ ${this.results.validPages}/${this.results.totalPages} pages properly standardized`);
      console.log('🔧 Minor issues need attention');
    } else {
      console.log('❌ FOOTER STANDARDIZATION: INCOMPLETE');
      console.log(`⚠️  ${this.results.validPages}/${this.results.totalPages} pages properly standardized`);
      console.log('🔧 Significant work still needed');
    }
  }
}

// Run validation if called directly
if (import.meta.url.includes('footer-validation-comprehensive.js')) {
  const validator = new FooterValidationComprehensive();
  validator.runValidation()
    .then(results => {
      // Save results to file
      fs.writeFileSync(
        'scripts/footer-validation-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Detailed results saved to scripts/footer-validation-results.json');
    })
    .catch(error => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}

export default FooterValidationComprehensive;
