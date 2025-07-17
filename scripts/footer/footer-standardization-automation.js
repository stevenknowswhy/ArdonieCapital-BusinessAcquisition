#!/usr/bin/env node

/**
 * Footer Standardization Automation Script
 * 
 * This script automates the complete footer standardization process
 * across all 114 pages of the Ardonie Capital platform using the
 * footer-embedded.html master template.
 * 
 * Usage: node scripts/footer-standardization-automation.js
 */

import fs from 'fs';
import path from 'path';

class FooterStandardizationAutomation {
  constructor() {
    this.masterTemplate = null;
    this.results = {
      phase1: { total: 0, completed: 0, failed: 0 },
      phase2: { total: 0, completed: 0, failed: 0 },
      phase3: { total: 0, completed: 0, failed: 0 },
      phase4: { total: 0, completed: 0, failed: 0 },
      summary: {
        totalPages: 0,
        pagesUpdated: 0,
        pagesFailed: 0,
        dynamicLoadingRemoved: 0,
        socialLinksFixed: 0,
        customFootersReplaced: 0
      }
    };
    
    // Implementation phases with specific page lists
    this.phases = {
      phase1: {
        name: "Critical Infrastructure",
        priority: "IMMEDIATE",
        pages: [
          // Dynamic loading fixes
          'dashboard/buyer-dashboard-backup.html',
          'documents/pitch-deck-fi.html',
          'education/guides.html',
          'tools/valuation.html',
          // Social media link fixes
          'index.html',
          'about.html',
          'contact.html',
          'marketplace/listings.html'
        ]
      },
      phase2: {
        name: "User-Facing Pages",
        priority: "HIGH",
        pages: [
          // Portal pages
          'portals/buyer-portal.html',
          'portals/seller-portal.html',
          'portals/accountant-portal.html',
          'portals/lender-portal.html',
          'portals/attorney-portal.html',
          // Dashboard pages
          'dashboard/buyer-dashboard.html',
          'dashboard/seller-dashboard.html',
          // Root directory high-traffic pages
          'blog.html',
          'careers.html',
          'how-it-works.html',
          'for-buyers.html',
          'for-sellers.html',
          'express-deal.html',
          'prelaunch-express.html',
          'partner-with-us.html',
          'terms-of-service.html',
          'privacy-policy.html',
          'cookie-policy.html'
        ]
      },
      phase3: {
        name: "Content Pages",
        priority: "MEDIUM",
        pages: [
          // Blog pages
          'blog/index.html',
          'blog/auto-shop-valuation-factors.html',
          'blog/dfw-market-trends-2024.html',
          'blog/due-diligence-checklist.html',
          'blog/express-deal-success-stories.html',
          'blog/financing-options-auto-shops.html',
          'blog/preparing-auto-shop-for-sale.html',
          // Document pages
          'documents/business-plan.html',
          'documents/company-strategy.html',
          'documents/one-page-pitch.html',
          'documents/nda.html',
          'documents/templates.html',
          'documents/financial-projections.html',
          'documents/founding-member.html',
          'documents/marketing-plan.html',
          'documents/pitch-deck-legal.html',
          // Funding & tools
          'funding/loan-calculator.html',
          'tools/due-diligence-checklist.html'
        ]
      }
    };
  }

  /**
   * Main automation execution
   */
  async executeStandardization() {
    console.log('🚀 Starting Footer Standardization Automation...\n');
    console.log('📅 Start Time:', new Date().toISOString());
    console.log('🎯 Goal: 100% footer standardization across all pages');
    console.log('📋 Master Template: footer-embedded.html');
    console.log('=' .repeat(70));

    try {
      // Load master template
      await this.loadMasterTemplate();
      
      // Execute phases in order
      await this.executePhase1();
      await this.executePhase2();
      await this.executePhase3();
      
      // Generate final report
      this.generateFinalReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Automation failed:', error);
      return this.results;
    }
  }

  /**
   * Load the master footer template
   */
  async loadMasterTemplate() {
    console.log('\n📄 Loading Master Footer Template...');
    
    try {
      if (!fs.existsSync('footer-embedded.html')) {
        throw new Error('Master template footer-embedded.html not found');
      }
      
      this.masterTemplate = fs.readFileSync('footer-embedded.html', 'utf8');
      console.log('✅ Master template loaded successfully');
      console.log(`📏 Template size: ${this.masterTemplate.length} characters`);
    } catch (error) {
      console.error('❌ Failed to load master template:', error.message);
      throw error;
    }
  }

  /**
   * Execute Phase 1: Critical Infrastructure
   */
  async executePhase1() {
    console.log('\n' + '='.repeat(70));
    console.log('🔥 PHASE 1: CRITICAL INFRASTRUCTURE (IMMEDIATE PRIORITY)');
    console.log('='.repeat(70));
    
    const phase1Pages = this.phases.phase1.pages;
    this.results.phase1.total = phase1Pages.length;
    
    console.log(`📋 Processing ${phase1Pages.length} critical pages...`);
    
    for (const pagePath of phase1Pages) {
      try {
        const result = await this.processPage(pagePath, 'phase1');
        if (result.success) {
          this.results.phase1.completed++;
          console.log(`✅ ${pagePath} - ${result.action}`);
        } else {
          this.results.phase1.failed++;
          console.log(`❌ ${pagePath} - ${result.error}`);
        }
      } catch (error) {
        this.results.phase1.failed++;
        console.log(`❌ ${pagePath} - Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Phase 1 Results: ${this.results.phase1.completed}/${this.results.phase1.total} completed`);
  }

  /**
   * Execute Phase 2: User-Facing Pages
   */
  async executePhase2() {
    console.log('\n' + '='.repeat(70));
    console.log('👥 PHASE 2: USER-FACING PAGES (HIGH PRIORITY)');
    console.log('='.repeat(70));
    
    const phase2Pages = this.phases.phase2.pages;
    this.results.phase2.total = phase2Pages.length;
    
    console.log(`📋 Processing ${phase2Pages.length} user-facing pages...`);
    
    for (const pagePath of phase2Pages) {
      try {
        const result = await this.processPage(pagePath, 'phase2');
        if (result.success) {
          this.results.phase2.completed++;
          console.log(`✅ ${pagePath} - ${result.action}`);
        } else {
          this.results.phase2.failed++;
          console.log(`❌ ${pagePath} - ${result.error}`);
        }
      } catch (error) {
        this.results.phase2.failed++;
        console.log(`❌ ${pagePath} - Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Phase 2 Results: ${this.results.phase2.completed}/${this.results.phase2.total} completed`);
  }

  /**
   * Execute Phase 3: Content Pages
   */
  async executePhase3() {
    console.log('\n' + '='.repeat(70));
    console.log('📝 PHASE 3: CONTENT PAGES (MEDIUM PRIORITY)');
    console.log('='.repeat(70));
    
    const phase3Pages = this.phases.phase3.pages;
    this.results.phase3.total = phase3Pages.length;
    
    console.log(`📋 Processing ${phase3Pages.length} content pages...`);
    
    for (const pagePath of phase3Pages) {
      try {
        const result = await this.processPage(pagePath, 'phase3');
        if (result.success) {
          this.results.phase3.completed++;
          console.log(`✅ ${pagePath} - ${result.action}`);
        } else {
          this.results.phase3.failed++;
          console.log(`❌ ${pagePath} - ${result.error}`);
        }
      } catch (error) {
        this.results.phase3.failed++;
        console.log(`❌ ${pagePath} - Error: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Phase 3 Results: ${this.results.phase3.completed}/${this.results.phase3.total} completed`);
  }

  /**
   * Process individual page for footer standardization
   */
  async processPage(pagePath, phase) {
    if (!fs.existsSync(pagePath)) {
      return { success: false, error: 'File does not exist' };
    }

    const content = fs.readFileSync(pagePath, 'utf8');
    const directoryLevel = this.getDirectoryLevel(pagePath);
    const adjustedFooter = this.adjustFooterPaths(this.masterTemplate, directoryLevel);
    
    // Determine what type of footer operation is needed
    const footerAnalysis = this.analyzeFooter(content);
    
    let newContent;
    let action;
    
    if (footerAnalysis.hasDynamicLoading) {
      // Remove dynamic loading and replace with embedded footer
      newContent = this.replaceDynamicFooter(content, adjustedFooter);
      action = 'Removed dynamic loading, added standardized footer';
      this.results.summary.dynamicLoadingRemoved++;
    } else if (footerAnalysis.hasIncorrectSocialLinks) {
      // Fix social media links
      newContent = this.fixSocialMediaLinks(content);
      action = 'Fixed social media links';
      this.results.summary.socialLinksFixed++;
    } else if (footerAnalysis.hasCustomFooter) {
      // Replace custom footer with standardized version
      newContent = this.replaceCustomFooter(content, adjustedFooter);
      action = 'Replaced custom footer with standardized version';
      this.results.summary.customFootersReplaced++;
    } else if (footerAnalysis.hasNoFooter) {
      // Add footer to page
      newContent = this.addFooterToPage(content, adjustedFooter);
      action = 'Added standardized footer';
    } else {
      // Page already has correct footer
      return { success: true, action: 'Already has standardized footer' };
    }

    // Write updated content back to file
    fs.writeFileSync(pagePath, newContent, 'utf8');
    this.results.summary.pagesUpdated++;
    
    return { success: true, action };
  }

  /**
   * Analyze current footer implementation
   */
  analyzeFooter(content) {
    return {
      hasDynamicLoading: content.includes('fetch(\'../components/footer.html\')') ||
                        content.includes('fetch(\'components/footer.html\')') ||
                        content.includes('<div id="footer-placeholder"></div>'),
      hasIncorrectSocialLinks: content.includes('<footer') && content.includes('href="#"') &&
                              content.includes('aria-label="Follow us on'),
      hasCustomFooter: content.includes('<footer') && 
                      !content.includes('bg-slate-900 text-white py-10'),
      hasNoFooter: !content.includes('<footer'),
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
      // Root directory - use as-is
      return footerContent;
    }
    
    const pathPrefix = '../'.repeat(directoryLevel);
    
    // Adjust all relative paths that don't already start with ../ or http
    let adjustedContent = footerContent.replace(
      /href="(?!\.\.\/|https?:\/\/|#)([^"]+)"/g,
      `href="${pathPrefix}$1"`
    );
    
    // Fix social media links to use proper URLs
    adjustedContent = this.fixSocialMediaLinksInTemplate(adjustedContent);
    
    return adjustedContent;
  }

  /**
   * Fix social media links in template
   */
  fixSocialMediaLinksInTemplate(content) {
    return content
      .replace(/href="#" aria-label="Follow us on Twitter"/g, 
               'href="https://twitter.com/ardoniecapital" aria-label="Twitter"')
      .replace(/href="#" aria-label="Follow us on Facebook"/g, 
               'href="https://facebook.com/ardoniecapital" aria-label="Facebook"')
      .replace(/href="#" aria-label="Connect with us on LinkedIn"/g, 
               'href="https://linkedin.com/company/ardoniecapital" aria-label="LinkedIn"');
  }

  /**
   * Replace dynamic footer loading with embedded footer
   */
  replaceDynamicFooter(content, footer) {
    // Remove the dynamic loading section
    const dynamicFooterPattern = /<!-- Footer -->\s*<div id="footer-placeholder"><\/div>\s*<script>[\s\S]*?<\/script>/g;
    const altPattern = /<div id="footer-placeholder"><\/div>\s*<script>[\s\S]*?fetch\([^)]*footer\.html[^}]*}\);?\s*<\/script>/g;
    
    let newContent = content.replace(dynamicFooterPattern, footer);
    newContent = newContent.replace(altPattern, footer);
    
    return newContent;
  }

  /**
   * Fix social media links in existing footer
   */
  fixSocialMediaLinks(content) {
    return this.fixSocialMediaLinksInTemplate(content);
  }

  /**
   * Replace custom footer with standardized version
   */
  replaceCustomFooter(content, footer) {
    // Find and replace the existing footer
    const footerPattern = /<footer[\s\S]*?<\/footer>/g;
    return content.replace(footerPattern, footer);
  }

  /**
   * Add footer to page that doesn't have one
   */
  addFooterToPage(content, footer) {
    // Insert footer before closing body tag
    const bodyClosePattern = /<\/body>/;
    if (bodyClosePattern.test(content)) {
      return content.replace(bodyClosePattern, `${footer}\n</body>`);
    } else {
      // If no body tag, append to end
      return content + '\n' + footer;
    }
  }

  /**
   * Generate final automation report
   */
  generateFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FOOTER STANDARDIZATION AUTOMATION REPORT');
    console.log('='.repeat(70));
    
    const totalPages = this.results.phase1.total + this.results.phase2.total + this.results.phase3.total;
    const totalCompleted = this.results.phase1.completed + this.results.phase2.completed + this.results.phase3.completed;
    const totalFailed = this.results.phase1.failed + this.results.phase2.failed + this.results.phase3.failed;
    
    console.log(`\n📈 OVERALL RESULTS`);
    console.log(`Total Pages Processed: ${totalPages}`);
    console.log(`Successfully Updated: ${totalCompleted}`);
    console.log(`Failed Updates: ${totalFailed}`);
    console.log(`Success Rate: ${((totalCompleted / totalPages) * 100).toFixed(1)}%`);
    
    console.log(`\n🔧 SPECIFIC ACTIONS TAKEN`);
    console.log(`Dynamic Loading Removed: ${this.results.summary.dynamicLoadingRemoved}`);
    console.log(`Social Links Fixed: ${this.results.summary.socialLinksFixed}`);
    console.log(`Custom Footers Replaced: ${this.results.summary.customFootersReplaced}`);
    
    console.log(`\n📋 PHASE BREAKDOWN`);
    console.log(`Phase 1 (Critical): ${this.results.phase1.completed}/${this.results.phase1.total}`);
    console.log(`Phase 2 (User-Facing): ${this.results.phase2.completed}/${this.results.phase2.total}`);
    console.log(`Phase 3 (Content): ${this.results.phase3.completed}/${this.results.phase3.total}`);
    
    if (totalCompleted === totalPages) {
      console.log('\n🎉 FOOTER STANDARDIZATION COMPLETE!');
      console.log('✅ All targeted pages now have standardized footers');
      console.log('🚀 Platform ready for production with consistent branding');
    } else {
      console.log('\n⚠️  FOOTER STANDARDIZATION INCOMPLETE');
      console.log(`🔧 ${totalFailed} pages need manual attention`);
    }
    
    console.log('\n📅 Completion Time:', new Date().toISOString());
  }
}

// Run automation if called directly
if (import.meta.url.includes('footer-standardization-automation.js')) {
  const automation = new FooterStandardizationAutomation();
  automation.executeStandardization()
    .then(results => {
      // Save results to file
      fs.writeFileSync(
        'scripts/footer-standardization-results.json',
        JSON.stringify(results, null, 2)
      );
      console.log('\n📄 Detailed results saved to scripts/footer-standardization-results.json');
    })
    .catch(error => {
      console.error('❌ Automation failed:', error);
      process.exit(1);
    });
}

export default FooterStandardizationAutomation;
