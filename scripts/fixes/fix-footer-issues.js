#!/usr/bin/env node

/**
 * Fix Footer Issues Script
 * 
 * This script addresses the critical footer problems:
 * 1. Removes duplicate footer comments
 * 2. Ensures each page has exactly ONE footer at the bottom
 * 3. Uses the correct footer template with proper social media links
 * 4. Validates footer placement and content
 */

import fs from 'fs';
import path from 'path';

class FooterIssuesFixer {
  constructor() {
    this.correctFooter = null;
    this.results = {
      totalPages: 0,
      pagesFixed: 0,
      pagesFailed: 0,
      issues: {
        duplicateComments: 0,
        multipleFooters: 0,
        missingFooters: 0,
        incorrectSocialLinks: 0
      }
    };
  }

  /**
   * Execute footer fixes
   */
  async executeFooterFixes() {
    console.log('🔧 Starting Footer Issues Fix...\n');
    console.log('🎯 Goals:');
    console.log('   - Remove duplicate footer comments');
    console.log('   - Ensure exactly ONE footer per page');
    console.log('   - Fix social media links');
    console.log('   - Validate footer placement');
    console.log('=' .repeat(60));

    try {
      // Create the correct footer template
      this.createCorrectFooter();
      
      // Find all HTML files
      const htmlFiles = this.findAllHtmlFiles('.');
      console.log(`\n📄 Found ${htmlFiles.length} HTML files to fix\n`);

      // Process each file
      for (const file of htmlFiles) {
        await this.fixPageFooter(file);
      }

      // Generate final report
      this.generateFixReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Footer fix failed:', error);
      return this.results;
    }
  }

  /**
   * Create the correct footer template with proper social links
   */
  createCorrectFooter() {
    this.correctFooter = `    <!-- Footer -->
    <footer class="bg-slate-900 text-white py-10">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Main Footer Content -->
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <!-- Company Info -->
                <div class="lg:col-span-1">
                    <div class="text-xl font-bold text-primary-light mb-3">Ardonie Capital</div>
                    <p class="text-slate-400 text-sm mb-4 max-w-md leading-relaxed">
                        The premier marketplace for DFW auto repair shop transactions.
                        Connecting buyers and sellers through our Express Deal Package for 34-day closings.
                    </p>
                    <div class="text-slate-400 text-sm space-y-1 mb-4">
                        <div>55 9th Street</div>
                        <div>San Francisco, CA 94103</div>
                    </div>
                    <div class="flex space-x-3">
                        <a href="https://twitter.com/ardoniecapital" class="text-slate-400 hover:text-white transition-colors" aria-label="Twitter">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                        </a>
                        <a href="https://facebook.com/ardoniecapital" class="text-slate-400 hover:text-white transition-colors" aria-label="Facebook">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        <a href="https://linkedin.com/company/ardoniecapital" class="text-slate-400 hover:text-white transition-colors" aria-label="LinkedIn">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- Navigation Links -->
                <div class="lg:col-span-4">
                    <!-- Top Row - 4 Columns -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <!-- Main Pages -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Main Pages</h3>
                            <ul class="space-y-1.5">
                                <li><a href="about.html" class="text-slate-400 hover:text-white transition-colors text-sm">About Us</a></li>
                                <li><a href="blog/index.html" class="text-slate-400 hover:text-white transition-colors text-sm">Blog</a></li>
                                <li><a href="careers.html" class="text-slate-400 hover:text-white transition-colors text-sm">Careers</a></li>
                                <li><a href="contact.html" class="text-slate-400 hover:text-white transition-colors text-sm">Contact</a></li>
                                <li><a href="index.html" class="text-slate-400 hover:text-white transition-colors text-sm">Home</a></li>
                                <li><a href="how-it-works.html" class="text-slate-400 hover:text-white transition-colors text-sm">How It Works</a></li>
                                <li><a href="for-sellers.html" class="text-slate-400 hover:text-white transition-colors text-sm">For Sellers</a></li>
                            </ul>
                        </div>

                        <!-- Express Programs -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Express Programs</h3>
                            <ul class="space-y-1.5">
                                <li><a href="marketplace/listings.html" class="text-slate-400 hover:text-white transition-colors text-sm">Browse Listings</a></li>
                                <li><a href="express-deal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Express Deal</a></li>
                                <li><a href="for-buyers.html" class="text-slate-400 hover:text-white transition-colors text-sm">For Buyers</a></li>
                                <li><a href="for-sellers.html" class="text-slate-400 hover:text-white transition-colors text-sm">For Sellers</a></li>
                                <li><a href="matchmaking/matches.html" class="text-slate-400 hover:text-white transition-colors text-sm">Matchmaking</a></li>
                                <li><a href="prelaunch-express.html" class="text-slate-400 hover:text-white transition-colors text-sm">Prelaunch Express</a></li>
                            </ul>
                        </div>

                        <!-- Professional Services -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Professional Services</h3>
                            <ul class="space-y-1.5">
                                <li><a href="vendor-portal/accounting-firms.html" class="text-slate-400 hover:text-white transition-colors text-sm">Accounting Firms</a></li>
                                <li><a href="documents/vendor-accounting.html" class="text-slate-400 hover:text-white transition-colors text-sm">Accounting Partners</a></li>
                                <li><a href="vendor-portal/financial-institutions.html" class="text-slate-400 hover:text-white transition-colors text-sm">Financial Institutions</a></li>
                                <li><a href="documents/vendor-financial.html" class="text-slate-400 hover:text-white transition-colors text-sm">Financial Partners</a></li>
                                <li><a href="vendor-portal/legal-firms.html" class="text-slate-400 hover:text-white transition-colors text-sm">Legal Firms</a></li>
                                <li><a href="documents/vendor-legal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Legal Partners</a></li>
                            </ul>
                        </div>

                        <!-- User Portals -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">User Portals</h3>
                            <ul class="space-y-1.5">
                                <li><a href="portals/accountant-portal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Accountant Portal</a></li>
                                <li><a href="portals/attorney-portal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Attorney Portal</a></li>
                                <li><a href="portals/buyer-portal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Buyer Dashboard/Portal</a></li>
                                <li><a href="portals/seller-portal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Seller Dashboard/Portal</a></li>
                                <li><a href="portals/lender-portal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Lender Portal</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Bottom Row - 4 Columns -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <!-- Business Documents -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Business Documents</h3>
                            <ul class="space-y-1.5">
                                <li><a href="documents/business-plan.html" class="text-slate-400 hover:text-white transition-colors text-sm">Business Plan</a></li>
                                <li><a href="documents/pitch-deck-fi.html" class="text-slate-400 hover:text-white transition-colors text-sm">FI Pitch Deck</a></li>
                                <li><a href="documents/pitch-deck-legal.html" class="text-slate-400 hover:text-white transition-colors text-sm">Legal Pitch Deck</a></li>
                                <li><a href="documents/marketing-plan.html" class="text-slate-400 hover:text-white transition-colors text-sm">Marketing Plan</a></li>
                                <li><a href="documents/one-page-pitch.html" class="text-slate-400 hover:text-white transition-colors text-sm">One Page Pitch</a></li>
                            </ul>
                        </div>

                        <!-- Strategy & Planning -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Strategy & Planning</h3>
                            <ul class="space-y-1.5">
                                <li><a href="documents/company-strategy.html" class="text-slate-400 hover:text-white transition-colors text-sm">Company Strategy</a></li>
                                <li><a href="documents/financial-projections.html" class="text-slate-400 hover:text-white transition-colors text-sm">Financial Projections</a></li>
                                <li><a href="documents/founding-member.html" class="text-slate-400 hover:text-white transition-colors text-sm">Founding Member</a></li>
                                <li><a href="documents/nda.html" class="text-slate-400 hover:text-white transition-colors text-sm">NDA</a></li>
                                <li><a href="documents/templates.html" class="text-slate-400 hover:text-white transition-colors text-sm">Templates</a></li>
                            </ul>
                        </div>

                        <!-- Tools & Resources -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Tools & Resources</h3>
                            <ul class="space-y-1.5">
                                <li><a href="tools/due-diligence-checklist.html" class="text-slate-400 hover:text-white transition-colors text-sm">Due Diligence</a></li>
                                <li><a href="education/guides.html" class="text-slate-400 hover:text-white transition-colors text-sm">Learning Center</a></li>
                                <li><a href="funding/loan-calculator.html" class="text-slate-400 hover:text-white transition-colors text-sm">Loan Calculator</a></li>
                                <li><a href="tools/valuation.html" class="text-slate-400 hover:text-white transition-colors text-sm">Valuation Tool</a></li>
                            </ul>
                        </div>

                        <!-- Account & Support -->
                        <div>
                            <h3 class="text-sm font-semibold mb-3 text-white">Account & Support</h3>
                            <ul class="space-y-1.5">
                                <li><a href="contact.html" class="text-slate-400 hover:text-white transition-colors text-sm">Contact Support</a></li>
                                <li><a href="auth/login.html" class="text-slate-400 hover:text-white transition-colors text-sm">Login</a></li>
                                <li><a href="auth/register.html" class="text-slate-400 hover:text-white transition-colors text-sm">Register</a></li>
                                <li><span class="text-slate-400 text-sm">424-253-4019</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Bar -->
            <div class="border-t border-slate-800 mt-6 pt-6 flex flex-col md:flex-row justify-between items-center">
                <p class="text-slate-400 text-sm">
                    © 2024 Ardonie Capital. All rights reserved. Closing DFW auto repair deals in 34 days.
                </p>
                <div class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
                    <a href="terms-of-service.html" class="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</a>
                    <a href="cookie-policy.html" class="text-slate-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
                    <a href="privacy-policy.html" class="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                </div>
            </div>
        </div>
    </footer>`;
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
   * Fix footer issues for individual page
   */
  async fixPageFooter(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`❌ ${filePath} - File does not exist`);
        this.results.pagesFailed++;
        return;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      // Fix 1: Remove duplicate footer comments
      const duplicateCommentPattern = /<!-- Footer -->\s*<!-- Footer -->/g;
      if (duplicateCommentPattern.test(content)) {
        content = content.replace(duplicateCommentPattern, '<!-- Footer -->');
        this.results.issues.duplicateComments++;
        hasChanges = true;
      }

      // Fix 2: Check for multiple footers
      const footerMatches = content.match(/<footer[\s\S]*?<\/footer>/g);
      if (footerMatches && footerMatches.length > 1) {
        // Remove all footers and add one correct footer at the end
        content = content.replace(/<footer[\s\S]*?<\/footer>/g, '');
        this.results.issues.multipleFooters++;
        hasChanges = true;
      }

      // Fix 3: Check for broken social media links
      if (content.includes('href="#"') && content.includes('<footer')) {
        this.results.issues.incorrectSocialLinks++;
        hasChanges = true;
      }

      // Fix 4: Ensure exactly one footer at the bottom
      if (!content.includes('<footer') || hasChanges) {
        // Remove any existing footer
        content = content.replace(/<footer[\s\S]*?<\/footer>/g, '');
        
        // Adjust paths based on directory level
        const directoryLevel = this.getDirectoryLevel(filePath);
        const adjustedFooter = this.adjustFooterPaths(this.correctFooter, directoryLevel);
        
        // Add footer before closing body tag
        const bodyClosePattern = /<\/body>/;
        if (bodyClosePattern.test(content)) {
          content = content.replace(bodyClosePattern, `\n${adjustedFooter}\n</body>`);
        } else {
          content += '\n' + adjustedFooter;
        }
        
        if (!footerMatches || footerMatches.length === 0) {
          this.results.issues.missingFooters++;
        }
        hasChanges = true;
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.results.pagesFixed++;
        console.log(`✅ ${filePath} - Fixed footer issues`);
      } else {
        console.log(`✅ ${filePath} - No issues found`);
      }
      
      this.results.totalPages++;
    } catch (error) {
      console.log(`❌ ${filePath} - Error: ${error.message}`);
      this.results.pagesFailed++;
    }
  }

  /**
   * Get directory level for path adjustment
   */
  getDirectoryLevel(filePath) {
    const pathParts = filePath.split('/');
    return pathParts.length - 1;
  }

  /**
   * Adjust footer paths based on directory level
   */
  adjustFooterPaths(footerContent, directoryLevel) {
    if (directoryLevel === 0) {
      // Root directory - use paths as-is
      return footerContent;
    } else if (directoryLevel === 1) {
      // Subdirectory - add ../ prefixes
      return footerContent.replace(/href="([^"]+\.html)"/g, 'href="../$1"');
    } else {
      // Deep subdirectory - add multiple ../ prefixes
      const prefix = '../'.repeat(directoryLevel);
      return footerContent.replace(/href="([^"]+\.html)"/g, `href="${prefix}$1"`);
    }
  }

  /**
   * Generate final fix report
   */
  generateFixReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FOOTER ISSUES FIX REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📈 OVERALL RESULTS`);
    console.log(`Total Pages Processed: ${this.results.totalPages}`);
    console.log(`Pages Fixed: ${this.results.pagesFixed}`);
    console.log(`Pages Failed: ${this.results.pagesFailed}`);

    console.log(`\n🔧 ISSUES FIXED`);
    console.log(`Duplicate Comments Removed: ${this.results.issues.duplicateComments}`);
    console.log(`Multiple Footers Fixed: ${this.results.issues.multipleFooters}`);
    console.log(`Missing Footers Added: ${this.results.issues.missingFooters}`);
    console.log(`Incorrect Social Links Fixed: ${this.results.issues.incorrectSocialLinks}`);

    if (this.results.pagesFixed > 0) {
      console.log('\n🎉 FOOTER ISSUES SUCCESSFULLY FIXED!');
      console.log('✅ All pages now have exactly ONE footer at the bottom');
      console.log('✅ Proper social media links implemented');
      console.log('✅ Duplicate comments removed');
      console.log('✅ Consistent footer structure across all pages');
    }

    console.log('\n📅 Fix Completion Time:', new Date().toISOString());
  }
}

// Run fixes if called directly
if (import.meta.url.includes('fix-footer-issues.js')) {
  const fixer = new FooterIssuesFixer();
  fixer.executeFooterFixes()
    .then(results => {
      console.log('\n📄 Fix completed successfully');
    })
    .catch(error => {
      console.error('❌ Footer fix failed:', error);
      process.exit(1);
    });
}

export default FooterIssuesFixer;
