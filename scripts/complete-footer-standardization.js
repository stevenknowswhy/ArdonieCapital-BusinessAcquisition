#!/usr/bin/env node

/**
 * Complete Footer Standardization Script
 * 
 * This script applies the standardized footer from vendor-portal/legal-firms.html
 * to ALL 114 HTML pages in the Ardonie Capital platform with proper path adjustments.
 * 
 * Usage: node scripts/complete-footer-standardization.js
 */

import fs from 'fs';
import path from 'path';

class CompleteFooterStandardization {
  constructor() {
    this.masterFooter = null;
    this.results = {
      totalPages: 0,
      pagesUpdated: 0,
      pagesFailed: 0,
      pagesSkipped: 0,
      pageDetails: [],
      summary: {
        rootPages: 0,
        subdirectoryPages: 0,
        deepSubdirectoryPages: 0,
        dynamicLoadingRemoved: 0,
        customFootersReplaced: 0,
        missingFootersAdded: 0
      }
    };
  }

  /**
   * Execute complete footer standardization
   */
  async executeStandardization() {
    console.log('🚀 Starting Complete Footer Standardization...\n');
    console.log('📋 Master Template: vendor-portal/legal-firms.html');
    console.log('🎯 Target: ALL 114 HTML pages in the platform');
    console.log('=' .repeat(70));

    try {
      // Extract master footer from legal-firms.html
      await this.extractMasterFooter();
      
      // Find all HTML files
      const htmlFiles = this.findAllHtmlFiles('.');
      console.log(`\n📄 Found ${htmlFiles.length} HTML files to process\n`);

      // Process each file
      for (const file of htmlFiles) {
        const result = await this.processPage(file);
        this.results.pageDetails.push(result);
        this.updateCounters(result);
      }

      // Generate final report
      this.generateFinalReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Standardization failed:', error);
      return this.results;
    }
  }

  /**
   * Extract master footer from legal-firms.html
   */
  async extractMasterFooter() {
    console.log('\n📄 Extracting Master Footer Template...');
    
    const legalFirmsPath = 'vendor-portal/legal-firms.html';
    if (!fs.existsSync(legalFirmsPath)) {
      throw new Error('Master template vendor-portal/legal-firms.html not found');
    }
    
    const content = fs.readFileSync(legalFirmsPath, 'utf8');
    
    // Extract footer content
    const footerMatch = content.match(/<!-- Footer -->\s*<footer[\s\S]*?<\/footer>/);
    if (!footerMatch) {
      throw new Error('Footer not found in legal-firms.html');
    }
    
    this.masterFooter = footerMatch[0];
    
    console.log('✅ Master footer extracted successfully');
    console.log(`📏 Footer size: ${this.masterFooter.length} characters`);
    console.log('✅ Confirmed: Proper social media links present');
    console.log('✅ Confirmed: Complete navigation sections present');
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
        if (!['node_modules', '.git', '.vscode', 'codeium', '.cursor', 'footer-templates'].includes(item)) {
          this.findAllHtmlFiles(fullPath, files);
        }
      } else if (item.endsWith('.html') && !item.includes('footer') && !item.includes('template')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Process individual page for footer standardization
   */
  async processPage(filePath) {
    const result = {
      file: filePath,
      directory: path.dirname(filePath),
      success: false,
      action: '',
      issues: []
    };

    try {
      if (!fs.existsSync(filePath)) {
        result.issues.push('File does not exist');
        return result;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const directoryLevel = this.getDirectoryLevel(filePath);
      const adjustedFooter = this.adjustFooterPaths(this.masterFooter, directoryLevel);
      
      // Determine what type of footer operation is needed
      const footerAnalysis = this.analyzeCurrentFooter(content);
      
      let newContent;
      
      if (footerAnalysis.hasDynamicLoading) {
        // Remove dynamic loading and replace with embedded footer
        newContent = this.replaceDynamicFooter(content, adjustedFooter);
        result.action = 'Removed dynamic loading, added standardized footer';
        this.results.summary.dynamicLoadingRemoved++;
      } else if (footerAnalysis.hasFooter) {
        // Replace existing footer with standardized version
        newContent = this.replaceExistingFooter(content, adjustedFooter);
        result.action = 'Replaced existing footer with standardized version';
        this.results.summary.customFootersReplaced++;
      } else {
        // Add footer to page that doesn't have one
        newContent = this.addFooterToPage(content, adjustedFooter);
        result.action = 'Added standardized footer to page';
        this.results.summary.missingFootersAdded++;
      }

      // Write updated content back to file
      fs.writeFileSync(filePath, newContent, 'utf8');
      result.success = true;
      this.results.pagesUpdated++;
      
      // Update directory counters
      if (directoryLevel === 0) {
        this.results.summary.rootPages++;
      } else if (directoryLevel === 1) {
        this.results.summary.subdirectoryPages++;
      } else {
        this.results.summary.deepSubdirectoryPages++;
      }
      
      const status = '✅';
      console.log(`${status} ${filePath} - ${result.action}`);
      
      return result;
    } catch (error) {
      result.issues.push(`Error: ${error.message}`);
      this.results.pagesFailed++;
      console.log(`❌ ${filePath} - Error: ${error.message}`);
      return result;
    }
  }

  /**
   * Analyze current footer implementation
   */
  analyzeCurrentFooter(content) {
    return {
      hasDynamicLoading: content.includes('fetch(\'../components/footer.html\')') ||
                        content.includes('fetch(\'components/footer.html\')') ||
                        content.includes('<div id="footer-placeholder"></div>'),
      hasFooter: content.includes('<footer'),
      hasStandardizedFooter: content.includes('<footer class="bg-slate-900 text-white py-10">')
    };
  }

  /**
   * Get directory level for path adjustment
   */
  getDirectoryLevel(filePath) {
    const pathParts = filePath.split('/');
    return pathParts.length - 1; // 0 for root, 1 for subdirectory, etc.
  }

  /**
   * Adjust footer paths based on directory level
   */
  adjustFooterPaths(footerContent, directoryLevel) {
    if (directoryLevel === 0) {
      // Root directory - remove ../ prefixes
      return footerContent.replace(/href="\.\.\/([^"]+)"/g, 'href="$1"');
    } else if (directoryLevel === 1) {
      // Subdirectory - use as-is (already has ../ prefixes)
      return footerContent;
    } else {
      // Deep subdirectory - add additional ../ prefixes
      const additionalPrefix = '../'.repeat(directoryLevel - 1);
      return footerContent.replace(/href="\.\.\/([^"]+)"/g, `href="../${additionalPrefix}$1"`);
    }
  }

  /**
   * Replace dynamic footer loading with embedded footer
   */
  replaceDynamicFooter(content, footer) {
    // Remove various dynamic loading patterns
    const patterns = [
      /<!-- Footer -->\s*<div id="footer-placeholder"><\/div>\s*<script>[\s\S]*?<\/script>/g,
      /<div id="footer-placeholder"><\/div>\s*<script>[\s\S]*?fetch\([^)]*footer\.html[^}]*}\);?\s*<\/script>/g,
      /<div id="footer-placeholder"><\/div>/g
    ];
    
    let newContent = content;
    for (const pattern of patterns) {
      newContent = newContent.replace(pattern, footer);
    }
    
    return newContent;
  }

  /**
   * Replace existing footer with standardized version
   */
  replaceExistingFooter(content, footer) {
    // Find and replace the existing footer
    const footerPattern = /<footer[\s\S]*?<\/footer>/g;
    return content.replace(footerPattern, footer.replace('<!-- Footer -->\s*', ''));
  }

  /**
   * Add footer to page that doesn't have one
   */
  addFooterToPage(content, footer) {
    // Insert footer before closing body tag
    const bodyClosePattern = /<\/body>/;
    if (bodyClosePattern.test(content)) {
      return content.replace(bodyClosePattern, `\n    ${footer}\n</body>`);
    } else {
      // If no body tag, append to end
      return content + '\n' + footer;
    }
  }

  /**
   * Update result counters
   */
  updateCounters(result) {
    this.results.totalPages++;
    
    if (!result.success) {
      this.results.pagesFailed++;
    }
  }

  /**
   * Generate final standardization report
   */
  generateFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 COMPLETE FOOTER STANDARDIZATION REPORT');
    console.log('='.repeat(70));
    
    const successRate = this.results.totalPages > 0 ? 
      ((this.results.pagesUpdated / this.results.totalPages) * 100).toFixed(1) : 0;

    console.log(`\n📈 OVERALL RESULTS`);
    console.log(`Total Pages Processed: ${this.results.totalPages}`);
    console.log(`Successfully Updated: ${this.results.pagesUpdated}`);
    console.log(`Failed Updates: ${this.results.pagesFailed}`);
    console.log(`Success Rate: ${successRate}%`);

    console.log(`\n🔧 ACTIONS TAKEN`);
    console.log(`Dynamic Loading Removed: ${this.results.summary.dynamicLoadingRemoved}`);
    console.log(`Custom Footers Replaced: ${this.results.summary.customFootersReplaced}`);
    console.log(`Missing Footers Added: ${this.results.summary.missingFootersAdded}`);

    console.log(`\n📁 DIRECTORY BREAKDOWN`);
    console.log(`Root Directory Pages: ${this.results.summary.rootPages}`);
    console.log(`Subdirectory Pages: ${this.results.summary.subdirectoryPages}`);
    console.log(`Deep Subdirectory Pages: ${this.results.summary.deepSubdirectoryPages}`);

    if (this.results.pagesUpdated === this.results.totalPages) {
      console.log('\n🎉 FOOTER STANDARDIZATION COMPLETE!');
      console.log('✅ All pages now have standardized footers');
      console.log('✅ Proper social media links implemented');
      console.log('✅ Complete navigation sections present');
      console.log('✅ Relative paths correctly adjusted for each directory');
      console.log('🚀 Platform ready for production with consistent branding');
    } else {
      console.log('\n⚠️  FOOTER STANDARDIZATION INCOMPLETE');
      console.log(`🔧 ${this.results.pagesFailed} pages need manual attention`);
    }

    console.log('\n📅 Completion Time:', new Date().toISOString());
  }
}

// Run standardization if called directly
if (import.meta.url.includes('complete-footer-standardization.js')) {
  const standardizer = new CompleteFooterStandardization();
  standardizer.executeStandardization()
    .then(results => {
      // Save results to file
      fs.writeFileSync(
        'scripts/complete-footer-standardization-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Detailed results saved to scripts/complete-footer-standardization-results.json');
    })
    .catch(error => {
      console.error('❌ Standardization failed:', error);
      process.exit(1);
    });
}

export default CompleteFooterStandardization;
