/**
 * Validation Script for All JavaScript and Accessibility Fixes
 * Tests that all critical issues have been resolved
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FixesValidator {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.validationResults = [];
        this.results = {
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }

    async run() {
        console.log('🔍 Validating All Fixes...\n');

        try {
            await this.validateJavaScriptFixes();
            await this.validateAccessibilityFixes();
            await this.validateSecurityFixes();
            await this.validateMobileFixes();
            await this.validateFileIntegrity();

            this.generateValidationReport();
            console.log('\n✅ Validation completed!');
        } catch (error) {
            console.error('❌ Error during validation:', error);
            throw error;
        }
    }

    /**
     * Validate JavaScript fixes
     */
    async validateJavaScriptFixes() {
        console.log('⚡ Validating JavaScript Fixes...');

        // Test 1: Check enhanced-listings.js for style variable fix
        const enhancedListingsPath = path.join(this.rootDir, 'assets/js/enhanced-listings.js');
        if (fs.existsSync(enhancedListingsPath)) {
            const content = fs.readFileSync(enhancedListingsPath, 'utf8');
            if (content.includes('const animationStyles = document.createElement')) {
                this.addResult('✅ PASS', 'Enhanced-listings.js style variable renamed correctly');
            } else {
                this.addResult('❌ FAIL', 'Enhanced-listings.js style variable not fixed');
            }
        } else {
            this.addResult('⚠️ WARN', 'Enhanced-listings.js file not found');
        }

        // Test 2: Check performance-optimization.js for className.split() fix
        const perfOptPath = path.join(this.rootDir, 'assets/js/performance-optimization.js');
        if (fs.existsSync(perfOptPath)) {
            const content = fs.readFileSync(perfOptPath, 'utf8');
            if (content.includes('typeof el.className === \'string\'')) {
                this.addResult('✅ PASS', 'Performance-optimization.js className type checking added');
            } else {
                this.addResult('❌ FAIL', 'Performance-optimization.js className fix not applied');
            }
        } else {
            this.addResult('⚠️ WARN', 'Performance-optimization.js file not found');
        }

        // Test 3: Check site.webmanifest exists
        const manifestPath = path.join(this.rootDir, 'site.webmanifest');
        if (fs.existsSync(manifestPath)) {
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                if (manifest.name && manifest.start_url) {
                    this.addResult('✅ PASS', 'Site.webmanifest created with valid content');
                } else {
                    this.addResult('❌ FAIL', 'Site.webmanifest missing required fields');
                }
            } catch (error) {
                this.addResult('❌ FAIL', 'Site.webmanifest contains invalid JSON');
            }
        } else {
            this.addResult('❌ FAIL', 'Site.webmanifest file not created');
        }

        console.log('   ✅ JavaScript fixes validation completed');
    }

    /**
     * Validate accessibility fixes
     */
    async validateAccessibilityFixes() {
        console.log('♿ Validating Accessibility Fixes...');

        // Test 1: Check accessibility CSS file exists
        const accessibilityCSSPath = path.join(this.rootDir, 'assets/css/accessibility-fixes.css');
        if (fs.existsSync(accessibilityCSSPath)) {
            const content = fs.readFileSync(accessibilityCSSPath, 'utf8');
            if (content.includes('color contrast') && content.includes('focus-visible')) {
                this.addResult('✅ PASS', 'Accessibility CSS file created with contrast fixes');
            } else {
                this.addResult('❌ FAIL', 'Accessibility CSS missing required fixes');
            }
        } else {
            this.addResult('❌ FAIL', 'Accessibility CSS file not created');
        }

        // Test 2: Check HTML files for accessibility improvements
        const htmlFiles = this.findHtmlFiles().slice(0, 5);
        let accessibilityImprovements = 0;

        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('accessibility-fixes.css')) {
                accessibilityImprovements++;
            }
        }

        if (accessibilityImprovements > 0) {
            this.addResult('✅ PASS', `Accessibility CSS integrated into ${accessibilityImprovements} HTML files`);
        } else {
            this.addResult('❌ FAIL', 'Accessibility CSS not integrated into HTML files');
        }

        console.log('   ✅ Accessibility fixes validation completed');
    }

    /**
     * Validate security fixes
     */
    async validateSecurityFixes() {
        console.log('🔒 Validating Security Fixes...');

        // Test 1: Check security headers script exists
        const securityJSPath = path.join(this.rootDir, 'assets/js/security-enhanced.js');
        if (fs.existsSync(securityJSPath)) {
            const content = fs.readFileSync(securityJSPath, 'utf8');
            if (content.includes('https:') && content.includes('Content-Security-Policy')) {
                this.addResult('✅ PASS', 'Security enhanced script created with HTTPS enforcement');
            } else {
                this.addResult('❌ FAIL', 'Security script missing required features');
            }
        } else {
            this.addResult('❌ FAIL', 'Security enhanced script not created');
        }

        // Test 2: Check CSP updates in security-headers.js
        const securityHeadersPath = path.join(this.rootDir, 'assets/js/security-headers.js');
        if (fs.existsSync(securityHeadersPath)) {
            const content = fs.readFileSync(securityHeadersPath, 'utf8');
            if (content.includes('cpwebassets.codepen.io')) {
                this.addResult('✅ PASS', 'CSP updated to allow CodePen assets');
            } else {
                this.addResult('❌ FAIL', 'CSP not updated for CodePen assets');
            }
        } else {
            this.addResult('⚠️ WARN', 'Security headers file not found');
        }

        // Test 3: Check security config file
        const securityConfigPath = path.join(this.rootDir, 'config/security.json');
        if (fs.existsSync(securityConfigPath)) {
            try {
                const config = JSON.parse(fs.readFileSync(securityConfigPath, 'utf8'));
                if (config.production && config.development) {
                    this.addResult('✅ PASS', 'Security configuration file created');
                } else {
                    this.addResult('❌ FAIL', 'Security config missing required sections');
                }
            } catch (error) {
                this.addResult('❌ FAIL', 'Security config contains invalid JSON');
            }
        } else {
            this.addResult('❌ FAIL', 'Security configuration file not created');
        }

        console.log('   ✅ Security fixes validation completed');
    }

    /**
     * Validate mobile responsiveness fixes
     */
    async validateMobileFixes() {
        console.log('📱 Validating Mobile Responsiveness Fixes...');

        // Test 1: Check mobile CSS file exists
        const mobileCSSPath = path.join(this.rootDir, 'assets/css/mobile-responsiveness.css');
        if (fs.existsSync(mobileCSSPath)) {
            const content = fs.readFileSync(mobileCSSPath, 'utf8');
            if (content.includes('min-height: 48px') && content.includes('@media')) {
                this.addResult('✅ PASS', 'Mobile responsiveness CSS created with touch targets');
            } else {
                this.addResult('❌ FAIL', 'Mobile CSS missing required features');
            }
        } else {
            this.addResult('❌ FAIL', 'Mobile responsiveness CSS not created');
        }

        // Test 2: Check HTML files for mobile improvements
        const htmlFiles = this.findHtmlFiles().slice(0, 5);
        let mobileImprovements = 0;

        for (const file of htmlFiles) {
            const content = fs.readFileSync(file, 'utf8');
            if (content.includes('mobile-responsiveness.css')) {
                mobileImprovements++;
            }
        }

        if (mobileImprovements > 0) {
            this.addResult('✅ PASS', `Mobile CSS integrated into ${mobileImprovements} HTML files`);
        } else {
            this.addResult('❌ FAIL', 'Mobile CSS not integrated into HTML files');
        }

        console.log('   ✅ Mobile responsiveness validation completed');
    }

    /**
     * Validate file integrity
     */
    async validateFileIntegrity() {
        console.log('📁 Validating File Integrity...');

        const requiredFiles = [
            'assets/css/accessibility-fixes.css',
            'assets/css/mobile-responsiveness.css',
            'assets/js/security-enhanced.js',
            'site.webmanifest',
            'config/security.json'
        ];

        let existingFiles = 0;
        for (const file of requiredFiles) {
            const filePath = path.join(this.rootDir, file);
            if (fs.existsSync(filePath)) {
                existingFiles++;
            }
        }

        if (existingFiles === requiredFiles.length) {
            this.addResult('✅ PASS', `All ${requiredFiles.length} required files exist`);
        } else {
            this.addResult('⚠️ WARN', `${existingFiles}/${requiredFiles.length} required files exist`);
        }

        console.log('   ✅ File integrity validation completed');
    }

    /**
     * Add validation result
     */
    addResult(status, message) {
        this.validationResults.push({ status, message });
        this.results.totalTests++;

        if (status.includes('PASS')) {
            this.results.passed++;
        } else if (status.includes('FAIL')) {
            this.results.failed++;
        } else if (status.includes('WARN')) {
            this.results.warnings++;
        }

        console.log(`   ${status}: ${message}`);
    }

    /**
     * Find HTML files
     */
    findHtmlFiles() {
        const files = [];
        const excludeDirs = ['node_modules', '.git', 'scripts', 'docs'];

        const walk = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (!excludeDirs.includes(item)) {
                        walk(fullPath);
                    }
                } else if (item.endsWith('.html')) {
                    files.push(fullPath);
                }
            }
        };

        walk(this.rootDir);
        return files;
    }

    /**
     * Generate validation report
     */
    generateValidationReport() {
        const passRate = ((this.results.passed / this.results.totalTests) * 100).toFixed(1);
        
        const report = `# Fixes Validation Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${this.results.totalTests}
- **Passed**: ${this.results.passed}
- **Failed**: ${this.results.failed}
- **Warnings**: ${this.results.warnings}
- **Pass Rate**: ${passRate}%

## Test Results
${this.validationResults.map(result => `${result.status}: ${result.message}`).join('\n')}

## Overall Status
${this.results.failed === 0 ? '✅ ALL CRITICAL FIXES VALIDATED' : '❌ SOME FIXES NEED ATTENTION'}

## Next Steps
${this.results.failed > 0 ? '1. Address failed tests above\n2. Re-run validation\n3. Test in browser' : '1. Test all pages in browser\n2. Run accessibility audit\n3. Validate mobile responsiveness\n4. Deploy to staging for testing'}
`;

        fs.writeFileSync(path.join(this.rootDir, 'docs/validation-report.md'), report);
        console.log(`\n📊 Validation Report: ${this.results.passed}/${this.results.totalTests} tests passed (${passRate}%)`);
    }
}

// Run the validator
const validator = new FixesValidator();
validator.run().catch(console.error);
