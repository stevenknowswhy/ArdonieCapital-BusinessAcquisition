#!/usr/bin/env node

/**
 * Theme System Integration Verification Script
 * Verifies that all fixed pages properly load CSS, theme system, and responsive design
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ThemeIntegrationVerifier {
    constructor() {
        this.results = {
            cssLoading: [],
            themeSystem: [],
            responsiveDesign: [],
            summary: {
                totalPages: 0,
                cssIssues: 0,
                themeIssues: 0,
                responsiveIssues: 0
            }
        };
        
        // Pages that were fixed in this session
        this.fixedPages = [
            'tools/due-diligence-checklist.html',
            'contact.html',
            'for-buyers.html',
            'blog/index.html',
            'matchmaking/matches.html',
            'partner-with-us.html',
            'auth/login.html',
            'portals/buyer-portal.html',
            'portals/seller-portal.html',
            'portals/attorney-portal.html',
            'portals/accountant-portal.html',
            'portals/lender-portal.html'
        ];
    }

    /**
     * Run complete verification
     */
    async verify() {
        console.log('🔍 Starting Theme System Integration Verification...\n');
        
        for (const pagePath of this.fixedPages) {
            console.log(`📄 Verifying: ${pagePath}`);
            await this.verifyPage(pagePath);
        }
        
        this.generateReport();
    }

    /**
     * Verify a single page
     */
    async verifyPage(pagePath) {
        if (!fs.existsSync(pagePath)) {
            console.log(`   ❌ File not found: ${pagePath}`);
            return;
        }

        const content = fs.readFileSync(pagePath, 'utf8');
        this.results.summary.totalPages++;

        // Check CSS loading
        const cssResult = this.checkCSSLoading(pagePath, content);
        this.results.cssLoading.push(cssResult);
        if (!cssResult.hasCommonCSS) this.results.summary.cssIssues++;

        // Check theme system
        const themeResult = this.checkThemeSystem(pagePath, content);
        this.results.themeSystem.push(themeResult);
        if (!themeResult.hasThemeConfig) this.results.summary.themeIssues++;

        // Check responsive design
        const responsiveResult = this.checkResponsiveDesign(pagePath, content);
        this.results.responsiveDesign.push(responsiveResult);
        if (!responsiveResult.hasViewportMeta) this.results.summary.responsiveIssues++;

        console.log(`   ${cssResult.hasCommonCSS ? '✅' : '❌'} CSS Loading`);
        console.log(`   ${themeResult.hasThemeConfig ? '✅' : '❌'} Theme System`);
        console.log(`   ${responsiveResult.hasViewportMeta ? '✅' : '❌'} Responsive Design`);
    }

    /**
     * Check CSS loading implementation
     */
    checkCSSLoading(pagePath, content) {
        const result = {
            page: pagePath,
            hasCommonCSS: false,
            hasTailwind: false,
            cssLinks: [],
            issues: []
        };

        // Check for common.css
        const commonCSSPattern = /href="[^"]*assets\/css\/common\.css"/;
        result.hasCommonCSS = commonCSSPattern.test(content);
        
        if (!result.hasCommonCSS) {
            result.issues.push('Missing common.css link');
        }

        // Check for Tailwind CSS
        const tailwindPattern = /cdn\.tailwindcss\.com/;
        result.hasTailwind = tailwindPattern.test(content);
        
        if (!result.hasTailwind) {
            result.issues.push('Missing Tailwind CSS');
        }

        // Extract all CSS links
        const cssLinkPattern = /<link[^>]*rel="stylesheet"[^>]*>/g;
        const matches = content.match(cssLinkPattern) || [];
        result.cssLinks = matches;

        return result;
    }

    /**
     * Check theme system implementation
     */
    checkThemeSystem(pagePath, content) {
        const result = {
            page: pagePath,
            hasThemeConfig: false,
            hasDarkModeSupport: false,
            hasColorVariables: false,
            issues: []
        };

        // Check for Tailwind config with theme
        const tailwindConfigPattern = /tailwind\.config\s*=\s*{[\s\S]*?theme:/;
        result.hasThemeConfig = tailwindConfigPattern.test(content);

        // Check for dark mode support
        const darkModePattern = /darkMode:\s*['"]class['"]/;
        result.hasDarkModeSupport = darkModePattern.test(content);

        // Check for color variables
        const colorVariablesPattern = /colors:\s*{[\s\S]*?primary:/;
        result.hasColorVariables = colorVariablesPattern.test(content);

        if (!result.hasThemeConfig) {
            result.issues.push('Missing Tailwind theme configuration');
        }

        return result;
    }

    /**
     * Check responsive design implementation
     */
    checkResponsiveDesign(pagePath, content) {
        const result = {
            page: pagePath,
            hasViewportMeta: false,
            hasResponsiveClasses: false,
            hasMobileMenu: false,
            issues: []
        };

        // Check for viewport meta tag
        const viewportPattern = /<meta[^>]*name="viewport"[^>]*>/;
        result.hasViewportMeta = viewportPattern.test(content);

        // Check for responsive classes
        const responsiveClassPattern = /(sm:|md:|lg:|xl:)/;
        result.hasResponsiveClasses = responsiveClassPattern.test(content);

        // Check for mobile menu implementation
        const mobileMenuPattern = /(mobile-menu|md:hidden)/;
        result.hasMobileMenu = mobileMenuPattern.test(content);

        if (!result.hasViewportMeta) {
            result.issues.push('Missing viewport meta tag');
        }

        if (!result.hasResponsiveClasses) {
            result.issues.push('No responsive classes found');
        }

        return result;
    }

    /**
     * Generate verification report
     */
    generateReport() {
        console.log('\n📊 THEME SYSTEM INTEGRATION VERIFICATION REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total Pages Verified: ${this.results.summary.totalPages}`);
        console.log(`   CSS Issues: ${this.results.summary.cssIssues}`);
        console.log(`   Theme Issues: ${this.results.summary.themeIssues}`);
        console.log(`   Responsive Issues: ${this.results.summary.responsiveIssues}`);

        // CSS Loading Report
        console.log(`\n🎨 CSS LOADING VERIFICATION:`);
        this.results.cssLoading.forEach(result => {
            const status = result.hasCommonCSS && result.hasTailwind ? '✅' : '❌';
            console.log(`   ${status} ${result.page}`);
            if (result.issues.length > 0) {
                result.issues.forEach(issue => console.log(`      - ${issue}`));
            }
        });

        // Theme System Report
        console.log(`\n🌙 THEME SYSTEM VERIFICATION:`);
        this.results.themeSystem.forEach(result => {
            const status = result.hasThemeConfig ? '✅' : '❌';
            console.log(`   ${status} ${result.page}`);
            if (result.issues.length > 0) {
                result.issues.forEach(issue => console.log(`      - ${issue}`));
            }
        });

        // Responsive Design Report
        console.log(`\n📱 RESPONSIVE DESIGN VERIFICATION:`);
        this.results.responsiveDesign.forEach(result => {
            const status = result.hasViewportMeta && result.hasResponsiveClasses ? '✅' : '❌';
            console.log(`   ${status} ${result.page}`);
            if (result.issues.length > 0) {
                result.issues.forEach(issue => console.log(`      - ${issue}`));
            }
        });

        // Overall Status
        const totalIssues = this.results.summary.cssIssues + 
                           this.results.summary.themeIssues + 
                           this.results.summary.responsiveIssues;
        
        console.log(`\n🎯 OVERALL STATUS:`);
        if (totalIssues === 0) {
            console.log('   ✅ All pages have proper theme system integration!');
        } else {
            console.log(`   ⚠️  ${totalIssues} issues found that need attention.`);
        }

        // Save detailed report
        const reportPath = 'theme-integration-verification-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
}

// Run verification
const verifier = new ThemeIntegrationVerifier();
verifier.verify().catch(console.error);

export default ThemeIntegrationVerifier;
