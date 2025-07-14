#!/usr/bin/env node

/**
 * Admin Navigation Site-Wide Implementation Script
 * Audits all HTML pages and ensures admin navigation is properly integrated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdminNavigationImplementation {
    constructor() {
        this.rootDir = path.dirname(__dirname);
        this.results = {
            total: 0,
            hasAdminNav: 0,
            needsAdminNav: 0,
            updated: 0,
            errors: 0,
            details: []
        };
    }

    /**
     * Main execution function
     */
    async run() {
        console.log('🔧 Admin Navigation Site-Wide Implementation');
        console.log('=' .repeat(50));
        
        try {
            // Find all HTML files
            const htmlFiles = this.findAllHtmlFiles(this.rootDir);
            console.log(`📁 Found ${htmlFiles.length} HTML files`);
            
            // Process each file
            for (const filePath of htmlFiles) {
                await this.processHtmlFile(filePath);
            }
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Error during execution:', error);
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
                if (!['node_modules', '.git', '.vscode', 'codeium', '.cursor', 'tests', 'scripts'].includes(item)) {
                    this.findAllHtmlFiles(fullPath, files);
                }
            } else if (item.endsWith('.html')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    /**
     * Process individual HTML file
     */
    async processHtmlFile(filePath) {
        const relativePath = path.relative(this.rootDir, filePath);
        this.results.total++;
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const analysis = this.analyzeHtmlFile(content, relativePath);
            
            console.log(`\n📄 ${relativePath}`);
            
            if (analysis.hasAdminNav) {
                console.log('  ✅ Admin navigation already integrated');
                this.results.hasAdminNav++;
            } else if (analysis.needsAdminNav) {
                console.log('  🔧 Needs admin navigation integration');
                this.results.needsAdminNav++;
                
                // Implement admin navigation
                const updated = await this.implementAdminNavigation(filePath, content, analysis);
                if (updated) {
                    console.log('  ✅ Admin navigation implemented');
                    this.results.updated++;
                } else {
                    console.log('  ❌ Failed to implement admin navigation');
                    this.results.errors++;
                }
            } else {
                console.log('  ⏭️  Skipped (not applicable)');
            }
            
            this.results.details.push({
                file: relativePath,
                ...analysis,
                updated: analysis.needsAdminNav && !analysis.hasAdminNav
            });
            
        } catch (error) {
            console.error(`  ❌ Error processing ${relativePath}:`, error.message);
            this.results.errors++;
        }
    }

    /**
     * Analyze HTML file for admin navigation requirements
     */
    analyzeHtmlFile(content, relativePath) {
        const analysis = {
            hasMainNav: false,
            hasAdminNav: false,
            hasAdminNavScript: false,
            hasAdminNavContainer: false,
            needsAdminNav: false,
            isAuthPage: false,
            isDashboard: false,
            pathDepth: 0
        };

        // Calculate path depth for relative paths
        analysis.pathDepth = relativePath.split('/').length - 1;

        // Check for main navigation
        analysis.hasMainNav = content.includes('main-navigation-container') || 
                             content.includes('main-navigation.js');

        // Check for existing admin navigation
        analysis.hasAdminNavScript = content.includes('admin-navigation.js');
        analysis.hasAdminNavContainer = content.includes('admin-navigation-container');
        analysis.hasAdminNav = analysis.hasAdminNavScript || analysis.hasAdminNavContainer;

        // Check page type
        analysis.isAuthPage = relativePath.includes('auth/') || 
                             relativePath.includes('login') || 
                             relativePath.includes('register');
        analysis.isDashboard = relativePath.includes('dashboard/');

        // Determine if admin navigation is needed
        analysis.needsAdminNav = analysis.hasMainNav && 
                                !analysis.isAuthPage && 
                                !relativePath.includes('demo') &&
                                !relativePath.includes('test');

        return analysis;
    }

    /**
     * Implement admin navigation in HTML file
     */
    async implementAdminNavigation(filePath, content, analysis) {
        try {
            let updatedContent = content;
            const pathPrefix = '../'.repeat(analysis.pathDepth);

            // Add admin navigation CSS if not present
            if (!content.includes('admin-navigation.css')) {
                const cssLink = `    <link rel="stylesheet" href="${pathPrefix}assets/css/admin-navigation.css">`;
                
                // Insert after existing CSS links or before closing head tag
                if (content.includes('</head>')) {
                    updatedContent = updatedContent.replace(
                        '</head>',
                        `${cssLink}\n</head>`
                    );
                }
            }

            // Add admin navigation script if not present
            if (!content.includes('admin-navigation.js')) {
                const scriptTag = `    <script src="${pathPrefix}components/admin-navigation.js"></script>`;
                
                // Insert before closing body tag
                if (content.includes('</body>')) {
                    updatedContent = updatedContent.replace(
                        '</body>',
                        `${scriptTag}\n</body>`
                    );
                }
            }

            // Add admin navigation container if not present
            if (!content.includes('admin-navigation-container')) {
                const containerDiv = `    <div id="admin-navigation-container"></div>`;
                
                // Insert after main navigation container
                if (content.includes('main-navigation-container')) {
                    updatedContent = updatedContent.replace(
                        /<div id="main-navigation-container"><\/div>/,
                        `<div id="main-navigation-container"></div>\n${containerDiv}`
                    );
                } else if (content.includes('<body')) {
                    // Insert after body tag if main nav container not found
                    updatedContent = updatedContent.replace(
                        /(<body[^>]*>)/,
                        `$1\n${containerDiv}`
                    );
                }
            }

            // Write updated content back to file
            if (updatedContent !== content) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                return true;
            }

            return false;
        } catch (error) {
            console.error(`Error implementing admin navigation in ${filePath}:`, error);
            return false;
        }
    }

    /**
     * Display final results
     */
    displayResults() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 ADMIN NAVIGATION IMPLEMENTATION RESULTS');
        console.log('='.repeat(50));
        
        console.log(`📁 Total HTML files processed: ${this.results.total}`);
        console.log(`✅ Files with admin navigation: ${this.results.hasAdminNav}`);
        console.log(`🔧 Files needing admin navigation: ${this.results.needsAdminNav}`);
        console.log(`✅ Files successfully updated: ${this.results.updated}`);
        console.log(`❌ Files with errors: ${this.results.errors}`);
        
        // Show detailed breakdown
        console.log('\n📋 DETAILED BREAKDOWN:');
        
        const categories = {
            'Already has admin nav': this.results.details.filter(d => d.hasAdminNav),
            'Updated with admin nav': this.results.details.filter(d => d.updated),
            'Skipped (not applicable)': this.results.details.filter(d => !d.needsAdminNav),
            'Errors': this.results.details.filter(d => d.error)
        };

        for (const [category, files] of Object.entries(categories)) {
            if (files.length > 0) {
                console.log(`\n${category} (${files.length}):`);
                files.forEach(file => {
                    console.log(`  • ${file.file}`);
                });
            }
        }

        // Show success rate
        const successRate = this.results.total > 0 ? 
            ((this.results.hasAdminNav + this.results.updated) / this.results.total * 100).toFixed(1) : 0;
        
        console.log(`\n🎯 Success Rate: ${successRate}% of applicable files have admin navigation`);
        
        if (this.results.errors > 0) {
            console.log(`\n⚠️  ${this.results.errors} files had errors and may need manual review`);
        }
        
        console.log('\n✅ Admin navigation implementation complete!');
    }
}

// Run the implementation
const implementation = new AdminNavigationImplementation();
implementation.run().catch(console.error);

export default AdminNavigationImplementation;
