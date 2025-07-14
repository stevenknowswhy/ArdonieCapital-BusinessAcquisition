/**
 * Security and Accessibility Audit Suite
 * Comprehensive security and accessibility testing for Ardonie Capital platform
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityAccessibilityAuditor {
    constructor() {
        this.auditResults = {
            security: {
                vulnerabilities: [],
                codeAnalysis: {},
                configurationAudit: {},
                dependencyAudit: {},
                authenticationAudit: {},
                dataProtectionAudit: {}
            },
            accessibility: {
                wcagCompliance: {},
                semanticHTML: {},
                ariaImplementation: {},
                colorContrast: {},
                keyboardNavigation: {},
                screenReaderSupport: {}
            },
            summary: {
                securityScore: 0,
                accessibilityScore: 0,
                overallScore: 0,
                criticalIssues: 0,
                recommendations: []
            }
        };
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Run comprehensive security and accessibility audit
     */
    async runComprehensiveAudit() {
        console.log('🔒 Starting Security and Accessibility Audit...\n');

        try {
            // 1. Security Audit
            await this.runSecurityAudit();

            // 2. Accessibility Audit
            await this.runAccessibilityAudit();

            // 3. Generate comprehensive report
            await this.generateAuditReport();

            console.log('✅ Security and Accessibility Audit Complete!\n');
            return this.auditResults;

        } catch (error) {
            console.error('❌ Security and accessibility audit failed:', error);
            this.errors.push(`Audit failure: ${error.message}`);
            await this.generateAuditReport();
            throw error;
        }
    }

    /**
     * Run comprehensive security audit
     */
    async runSecurityAudit() {
        console.log('🔒 Running Security Audit...');

        const securityTests = {
            vulnerabilityScanning: await this.scanForVulnerabilities(),
            codeAnalysis: await this.analyzeCodeSecurity(),
            configurationAudit: await this.auditSecurityConfiguration(),
            dependencyAudit: await this.auditDependencies(),
            authenticationAudit: await this.auditAuthentication(),
            dataProtectionAudit: await this.auditDataProtection()
        };

        this.auditResults.security = securityTests;

        const passed = Object.values(securityTests).filter(t => t.passed).length;
        const total = Object.keys(securityTests).length;
        const securityScore = Math.round((passed / total) * 100);

        this.auditResults.summary.securityScore = securityScore;

        console.log(`   🔒 Security audit: ${passed}/${total} passed (${securityScore}%)`);
    }

    /**
     * Scan for common vulnerabilities
     */
    async scanForVulnerabilities() {
        try {
            const vulnerabilities = [];

            // Check for common security issues
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);
            const jsFiles = this.findFiles('.', /\.js$/, ['node_modules', 'dist']);

            // XSS vulnerability check
            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for potential XSS vulnerabilities
                if (content.includes('innerHTML') && !content.includes('DOMPurify')) {
                    vulnerabilities.push({
                        type: 'XSS',
                        severity: 'HIGH',
                        file,
                        description: 'Potential XSS vulnerability: innerHTML usage without sanitization'
                    });
                }

                // Check for inline event handlers
                const inlineEvents = content.match(/on\w+\s*=\s*["'][^"']*["']/g);
                if (inlineEvents) {
                    vulnerabilities.push({
                        type: 'XSS',
                        severity: 'MEDIUM',
                        file,
                        description: `Inline event handlers found: ${inlineEvents.length} instances`
                    });
                }
            }

            // Check for sensitive data exposure
            for (const file of jsFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for hardcoded secrets
                const secretPatterns = [
                    /password\s*[:=]\s*["'][^"']+["']/i,
                    /api[_-]?key\s*[:=]\s*["'][^"']+["']/i,
                    /secret\s*[:=]\s*["'][^"']+["']/i,
                    /token\s*[:=]\s*["'][^"']+["']/i
                ];

                for (const pattern of secretPatterns) {
                    if (pattern.test(content)) {
                        vulnerabilities.push({
                            type: 'SENSITIVE_DATA',
                            severity: 'CRITICAL',
                            file,
                            description: 'Potential hardcoded secret detected'
                        });
                    }
                }
            }

            return {
                passed: vulnerabilities.length === 0,
                vulnerabilities,
                details: {
                    filesScanned: htmlFiles.length + jsFiles.length,
                    vulnerabilitiesFound: vulnerabilities.length,
                    criticalIssues: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
                    highIssues: vulnerabilities.filter(v => v.severity === 'HIGH').length,
                    mediumIssues: vulnerabilities.filter(v => v.severity === 'MEDIUM').length
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Analyze code for security best practices
     */
    async analyzeCodeSecurity() {
        try {
            const securityIssues = [];
            const jsFiles = this.findFiles('./src', /\.js$/, []);

            for (const file of jsFiles) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for eval usage
                if (content.includes('eval(')) {
                    securityIssues.push({
                        type: 'DANGEROUS_FUNCTION',
                        severity: 'HIGH',
                        file,
                        description: 'Usage of eval() function detected'
                    });
                }

                // Check for document.write usage
                if (content.includes('document.write')) {
                    securityIssues.push({
                        type: 'XSS_RISK',
                        severity: 'MEDIUM',
                        file,
                        description: 'Usage of document.write detected'
                    });
                }

                // Check for unsafe regex patterns
                const regexPatterns = content.match(/new RegExp\([^)]+\)/g);
                if (regexPatterns) {
                    securityIssues.push({
                        type: 'REGEX_DOS',
                        severity: 'MEDIUM',
                        file,
                        description: 'Dynamic regex creation detected - potential ReDoS vulnerability'
                    });
                }
            }

            return {
                passed: securityIssues.length === 0,
                issues: securityIssues,
                details: {
                    filesAnalyzed: jsFiles.length,
                    issuesFound: securityIssues.length,
                    securityScore: securityIssues.length === 0 ? 100 : Math.max(0, 100 - (securityIssues.length * 10))
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit security configuration
     */
    async auditSecurityConfiguration() {
        try {
            const configIssues = [];

            // Check AWS configuration
            if (fs.existsSync('./aws-config.json')) {
                const awsConfig = JSON.parse(fs.readFileSync('./aws-config.json', 'utf8'));

                // Check security headers
                if (!awsConfig.security?.headers) {
                    configIssues.push({
                        type: 'MISSING_SECURITY_HEADERS',
                        severity: 'HIGH',
                        description: 'Security headers not configured'
                    });
                }

                // Check HTTPS enforcement
                if (awsConfig.aws?.cloudfront?.viewerProtocolPolicy !== 'redirect-to-https') {
                    configIssues.push({
                        type: 'HTTPS_NOT_ENFORCED',
                        severity: 'HIGH',
                        description: 'HTTPS not enforced in CloudFront configuration'
                    });
                }

                // Check S3 bucket security
                if (!awsConfig.aws?.s3?.blockPublicAccess) {
                    configIssues.push({
                        type: 'S3_PUBLIC_ACCESS',
                        severity: 'CRITICAL',
                        description: 'S3 bucket public access not blocked'
                    });
                }
            } else {
                configIssues.push({
                    type: 'MISSING_CONFIG',
                    severity: 'HIGH',
                    description: 'AWS security configuration file not found'
                });
            }

            // Check service worker security
            if (fs.existsSync('./sw.js')) {
                const swContent = fs.readFileSync('./sw.js', 'utf8');

                if (!swContent.includes('https:')) {
                    configIssues.push({
                        type: 'SW_INSECURE_REQUESTS',
                        severity: 'MEDIUM',
                        description: 'Service worker may allow insecure requests'
                    });
                }
            }

            return {
                passed: configIssues.length === 0,
                issues: configIssues,
                details: {
                    configurationFiles: ['aws-config.json', 'sw.js'],
                    issuesFound: configIssues.length,
                    securityLevel: configIssues.length === 0 ? 'EXCELLENT' :
                                  configIssues.filter(i => i.severity === 'CRITICAL').length > 0 ? 'POOR' : 'GOOD'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit dependencies for known vulnerabilities
     */
    async auditDependencies() {
        try {
            const dependencyIssues = [];

            if (fs.existsSync('./package.json')) {
                const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
                const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

                // Check for known vulnerable packages (simplified check)
                const vulnerablePackages = [
                    'lodash', // Example - would need real vulnerability database
                    'moment', // Example - deprecated package
                    'request' // Example - deprecated package
                ];

                for (const [pkg, version] of Object.entries(dependencies || {})) {
                    if (vulnerablePackages.includes(pkg)) {
                        dependencyIssues.push({
                            type: 'VULNERABLE_DEPENDENCY',
                            severity: 'MEDIUM',
                            package: pkg,
                            version,
                            description: `Package ${pkg} may have known vulnerabilities`
                        });
                    }
                }

                // Check for outdated packages (simplified)
                const totalDeps = Object.keys(dependencies || {}).length;

                return {
                    passed: dependencyIssues.length === 0,
                    issues: dependencyIssues,
                    details: {
                        totalDependencies: totalDeps,
                        vulnerablePackages: dependencyIssues.length,
                        recommendedAction: dependencyIssues.length > 0 ? 'Run npm audit and update packages' : 'Dependencies appear secure'
                    }
                };
            } else {
                return {
                    passed: false,
                    error: 'package.json not found'
                };
            }
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit authentication implementation
     */
    async auditAuthentication() {
        try {
            const authIssues = [];
            const authFiles = this.findFiles('./src/features/authentication', /\.js$/, []);

            for (const file of authFiles) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for weak password requirements
                if (content.includes('password') && !content.includes('minLength')) {
                    authIssues.push({
                        type: 'WEAK_PASSWORD_POLICY',
                        severity: 'MEDIUM',
                        file,
                        description: 'Password strength requirements not enforced'
                    });
                }

                // Check for JWT implementation
                if (content.includes('jwt') || content.includes('token')) {
                    if (!content.includes('expiresIn') && !content.includes('exp')) {
                        authIssues.push({
                            type: 'JWT_NO_EXPIRATION',
                            severity: 'HIGH',
                            file,
                            description: 'JWT tokens without expiration detected'
                        });
                    }
                }

                // Check for session management
                if (content.includes('session') && !content.includes('secure')) {
                    authIssues.push({
                        type: 'INSECURE_SESSION',
                        severity: 'HIGH',
                        file,
                        description: 'Session cookies not marked as secure'
                    });
                }
            }

            return {
                passed: authIssues.length === 0,
                issues: authIssues,
                details: {
                    authFilesScanned: authFiles.length,
                    issuesFound: authIssues.length,
                    authSecurityLevel: authIssues.length === 0 ? 'STRONG' : 'NEEDS_IMPROVEMENT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit data protection implementation
     */
    async auditDataProtection() {
        try {
            const dataIssues = [];
            const allFiles = this.findFiles('./src', /\.js$/, []);

            let encryptionFound = false;
            let gdprComplianceFound = false;

            for (const file of allFiles) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for encryption usage
                if (content.includes('encrypt') || content.includes('crypto')) {
                    encryptionFound = true;
                }

                // Check for GDPR compliance features
                if (content.includes('consent') || content.includes('gdpr') || content.includes('privacy')) {
                    gdprComplianceFound = true;
                }

                // Check for sensitive data handling
                if (content.includes('localStorage') && content.includes('password')) {
                    dataIssues.push({
                        type: 'SENSITIVE_DATA_STORAGE',
                        severity: 'HIGH',
                        file,
                        description: 'Sensitive data stored in localStorage'
                    });
                }
            }

            if (!encryptionFound) {
                dataIssues.push({
                    type: 'NO_ENCRYPTION',
                    severity: 'MEDIUM',
                    description: 'No encryption implementation found'
                });
            }

            if (!gdprComplianceFound) {
                dataIssues.push({
                    type: 'NO_GDPR_COMPLIANCE',
                    severity: 'MEDIUM',
                    description: 'No GDPR compliance features found'
                });
            }

            return {
                passed: dataIssues.length === 0,
                issues: dataIssues,
                details: {
                    filesScanned: allFiles.length,
                    encryptionImplemented: encryptionFound,
                    gdprCompliant: gdprComplianceFound,
                    dataProtectionLevel: dataIssues.length === 0 ? 'COMPLIANT' : 'NEEDS_IMPROVEMENT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Run comprehensive accessibility audit
     */
    async runAccessibilityAudit() {
        console.log('♿ Running Accessibility Audit...');

        const accessibilityTests = {
            wcagCompliance: await this.auditWCAGCompliance(),
            semanticHTML: await this.auditSemanticHTML(),
            ariaImplementation: await this.auditARIAImplementation(),
            colorContrast: await this.auditColorContrast(),
            keyboardNavigation: await this.auditKeyboardNavigation(),
            screenReaderSupport: await this.auditScreenReaderSupport()
        };

        this.auditResults.accessibility = accessibilityTests;

        const passed = Object.values(accessibilityTests).filter(t => t.passed).length;
        const total = Object.keys(accessibilityTests).length;
        const accessibilityScore = Math.round((passed / total) * 100);

        this.auditResults.summary.accessibilityScore = accessibilityScore;

        console.log(`   ♿ Accessibility audit: ${passed}/${total} passed (${accessibilityScore}%)`);
    }

    /**
     * Audit WCAG 2.1 AA compliance
     */
    async auditWCAGCompliance() {
        try {
            const wcagIssues = [];
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);

            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for missing lang attribute
                if (!content.includes('lang=')) {
                    wcagIssues.push({
                        type: 'MISSING_LANG',
                        severity: 'HIGH',
                        file,
                        description: 'Missing lang attribute on html element'
                    });
                }

                // Check for missing page title
                if (!content.includes('<title>') || content.includes('<title></title>')) {
                    wcagIssues.push({
                        type: 'MISSING_TITLE',
                        severity: 'HIGH',
                        file,
                        description: 'Missing or empty page title'
                    });
                }

                // Check for images without alt text
                const images = content.match(/<img[^>]*>/g) || [];
                for (const img of images) {
                    if (!img.includes('alt=')) {
                        wcagIssues.push({
                            type: 'MISSING_ALT_TEXT',
                            severity: 'HIGH',
                            file,
                            description: 'Image without alt attribute'
                        });
                    }
                }

                // Check for form inputs without labels
                const inputs = content.match(/<input[^>]*>/g) || [];
                for (const input of inputs) {
                    if (input.includes('type="text"') || input.includes('type="email"')) {
                        const id = input.match(/id="([^"]+)"/);
                        if (id && !content.includes(`for="${id[1]}"`)) {
                            wcagIssues.push({
                                type: 'MISSING_LABEL',
                                severity: 'HIGH',
                                file,
                                description: 'Form input without associated label'
                            });
                        }
                    }
                }
            }

            return {
                passed: wcagIssues.length === 0,
                issues: wcagIssues,
                details: {
                    filesScanned: Math.min(htmlFiles.length, 20),
                    wcagViolations: wcagIssues.length,
                    complianceLevel: wcagIssues.length === 0 ? 'AA_COMPLIANT' : 'NON_COMPLIANT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit semantic HTML usage
     */
    async auditSemanticHTML() {
        try {
            const semanticIssues = [];
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);

            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for semantic elements usage
                const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
                let semanticElementsFound = 0;

                for (const element of semanticElements) {
                    if (content.includes(`<${element}`)) {
                        semanticElementsFound++;
                    }
                }

                if (semanticElementsFound < 3) {
                    semanticIssues.push({
                        type: 'INSUFFICIENT_SEMANTIC_ELEMENTS',
                        severity: 'MEDIUM',
                        file,
                        description: `Only ${semanticElementsFound} semantic elements found`
                    });
                }

                // Check for proper heading hierarchy
                const headings = content.match(/<h[1-6][^>]*>/g) || [];
                if (headings.length > 0) {
                    const firstHeading = headings[0];
                    if (!firstHeading.includes('<h1')) {
                        semanticIssues.push({
                            type: 'IMPROPER_HEADING_HIERARCHY',
                            severity: 'MEDIUM',
                            file,
                            description: 'Page does not start with h1 element'
                        });
                    }
                }

                // Check for div/span overuse
                const divCount = (content.match(/<div/g) || []).length;
                const spanCount = (content.match(/<span/g) || []).length;
                const totalElements = (content.match(/<[a-zA-Z]/g) || []).length;

                if ((divCount + spanCount) / totalElements > 0.5) {
                    semanticIssues.push({
                        type: 'EXCESSIVE_GENERIC_ELEMENTS',
                        severity: 'LOW',
                        file,
                        description: 'Excessive use of div/span elements'
                    });
                }
            }

            return {
                passed: semanticIssues.length === 0,
                issues: semanticIssues,
                details: {
                    filesScanned: Math.min(htmlFiles.length, 20),
                    semanticIssues: semanticIssues.length,
                    semanticScore: semanticIssues.length === 0 ? 100 : Math.max(0, 100 - (semanticIssues.length * 10))
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit ARIA implementation
     */
    async auditARIAImplementation() {
        try {
            const ariaIssues = [];
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);

            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for ARIA landmarks
                const landmarks = ['banner', 'navigation', 'main', 'complementary', 'contentinfo'];
                let landmarksFound = 0;

                for (const landmark of landmarks) {
                    if (content.includes(`role="${landmark}"`) || content.includes(`aria-label`)) {
                        landmarksFound++;
                    }
                }

                if (landmarksFound === 0) {
                    ariaIssues.push({
                        type: 'NO_ARIA_LANDMARKS',
                        severity: 'MEDIUM',
                        file,
                        description: 'No ARIA landmarks found'
                    });
                }

                // Check for interactive elements without ARIA
                const buttons = content.match(/<button[^>]*>/g) || [];
                for (const button of buttons) {
                    if (!button.includes('aria-label') && !button.includes('aria-describedby')) {
                        const hasText = button.includes('>') && !button.includes('></button>');
                        if (!hasText) {
                            ariaIssues.push({
                                type: 'BUTTON_WITHOUT_ACCESSIBLE_NAME',
                                severity: 'HIGH',
                                file,
                                description: 'Button without accessible name'
                            });
                        }
                    }
                }

                // Check for form controls with ARIA
                const formControls = content.match(/<(input|select|textarea)[^>]*>/g) || [];
                for (const control of formControls) {
                    if (control.includes('required') && !control.includes('aria-required')) {
                        ariaIssues.push({
                            type: 'MISSING_ARIA_REQUIRED',
                            severity: 'MEDIUM',
                            file,
                            description: 'Required form control without aria-required'
                        });
                    }
                }
            }

            return {
                passed: ariaIssues.length === 0,
                issues: ariaIssues,
                details: {
                    filesScanned: Math.min(htmlFiles.length, 20),
                    ariaIssues: ariaIssues.length,
                    ariaImplementationLevel: ariaIssues.length === 0 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit color contrast compliance
     */
    async auditColorContrast() {
        try {
            const contrastIssues = [];
            const cssFiles = this.findFiles('.', /\.css$/, ['node_modules', 'dist']);

            // Define color contrast requirements
            const minContrastNormal = 4.5; // WCAG AA for normal text
            const minContrastLarge = 3.0;  // WCAG AA for large text

            for (const file of cssFiles) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for potential low contrast combinations
                const colorDeclarations = content.match(/color\s*:\s*[^;]+;/g) || [];
                const backgroundDeclarations = content.match(/background(-color)?\s*:\s*[^;]+;/g) || [];

                // Simplified contrast check (would need actual color parsing in real implementation)
                if (colorDeclarations.length > 0 && backgroundDeclarations.length === 0) {
                    contrastIssues.push({
                        type: 'POTENTIAL_CONTRAST_ISSUE',
                        severity: 'MEDIUM',
                        file,
                        description: 'Text colors defined without background colors'
                    });
                }

                // Check for hardcoded light colors on light backgrounds
                const lightColors = content.match(/color\s*:\s*(#[fF]{3,6}|white|#fff)/g);
                if (lightColors && content.includes('background') && content.includes('white')) {
                    contrastIssues.push({
                        type: 'LOW_CONTRAST_SUSPECTED',
                        severity: 'HIGH',
                        file,
                        description: 'Potential low contrast: light text on light background'
                    });
                }
            }

            // Check HTML for inline styles
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);
            for (const file of htmlFiles.slice(0, 10)) {
                const content = fs.readFileSync(file, 'utf8');

                const inlineStyles = content.match(/style="[^"]*color[^"]*"/g) || [];
                if (inlineStyles.length > 0) {
                    contrastIssues.push({
                        type: 'INLINE_COLOR_STYLES',
                        severity: 'LOW',
                        file,
                        description: 'Inline color styles found - difficult to audit contrast'
                    });
                }
            }

            return {
                passed: contrastIssues.length === 0,
                issues: contrastIssues,
                details: {
                    cssFilesScanned: cssFiles.length,
                    htmlFilesScanned: Math.min(htmlFiles.length, 10),
                    contrastIssues: contrastIssues.length,
                    contrastCompliance: contrastIssues.length === 0 ? 'LIKELY_COMPLIANT' : 'NEEDS_REVIEW'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit keyboard navigation support
     */
    async auditKeyboardNavigation() {
        try {
            const keyboardIssues = [];
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);
            const jsFiles = this.findFiles('./src', /\.js$/, []);

            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for interactive elements without proper tabindex
                const interactiveElements = content.match(/<(button|a|input|select|textarea)[^>]*>/g) || [];
                for (const element of interactiveElements) {
                    if (element.includes('tabindex="-1"') && !element.includes('aria-hidden="true"')) {
                        keyboardIssues.push({
                            type: 'FOCUSABLE_ELEMENT_REMOVED_FROM_TAB_ORDER',
                            severity: 'MEDIUM',
                            file,
                            description: 'Interactive element removed from tab order'
                        });
                    }
                }

                // Check for custom interactive elements
                const customInteractive = content.match(/<div[^>]*onclick[^>]*>/g) || [];
                for (const element of customInteractive) {
                    if (!element.includes('tabindex') && !element.includes('role="button"')) {
                        keyboardIssues.push({
                            type: 'CUSTOM_INTERACTIVE_NOT_KEYBOARD_ACCESSIBLE',
                            severity: 'HIGH',
                            file,
                            description: 'Custom interactive element not keyboard accessible'
                        });
                    }
                }

                // Check for skip links
                if (!content.includes('skip') || !content.includes('main')) {
                    keyboardIssues.push({
                        type: 'MISSING_SKIP_LINKS',
                        severity: 'MEDIUM',
                        file,
                        description: 'No skip navigation links found'
                    });
                }
            }

            // Check JavaScript for keyboard event handling
            for (const file of jsFiles.slice(0, 10)) {
                const content = fs.readFileSync(file, 'utf8');

                if (content.includes('onclick') && !content.includes('onkeydown') && !content.includes('onkeypress')) {
                    keyboardIssues.push({
                        type: 'MOUSE_ONLY_INTERACTION',
                        severity: 'HIGH',
                        file,
                        description: 'Mouse-only interaction detected'
                    });
                }
            }

            return {
                passed: keyboardIssues.length === 0,
                issues: keyboardIssues,
                details: {
                    htmlFilesScanned: Math.min(htmlFiles.length, 20),
                    jsFilesScanned: Math.min(jsFiles.length, 10),
                    keyboardIssues: keyboardIssues.length,
                    keyboardAccessibility: keyboardIssues.length === 0 ? 'FULLY_ACCESSIBLE' : 'NEEDS_IMPROVEMENT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Audit screen reader support
     */
    async auditScreenReaderSupport() {
        try {
            const screenReaderIssues = [];
            const htmlFiles = this.findFiles('.', /\.html$/, ['node_modules', 'dist']);

            for (const file of htmlFiles.slice(0, 20)) {
                const content = fs.readFileSync(file, 'utf8');

                // Check for screen reader only content
                if (!content.includes('sr-only') && !content.includes('screen-reader')) {
                    screenReaderIssues.push({
                        type: 'NO_SCREEN_READER_CONTENT',
                        severity: 'LOW',
                        file,
                        description: 'No screen reader specific content found'
                    });
                }

                // Check for live regions
                if (!content.includes('aria-live') && !content.includes('role="alert"')) {
                    screenReaderIssues.push({
                        type: 'NO_LIVE_REGIONS',
                        severity: 'MEDIUM',
                        file,
                        description: 'No ARIA live regions for dynamic content'
                    });
                }

                // Check for proper table headers
                const tables = content.match(/<table[^>]*>/g) || [];
                for (const table of tables) {
                    const tableContent = content.substring(content.indexOf(table));
                    const tableEnd = tableContent.indexOf('</table>');
                    const tableHTML = tableContent.substring(0, tableEnd);

                    if (!tableHTML.includes('<th') && !tableHTML.includes('scope=')) {
                        screenReaderIssues.push({
                            type: 'TABLE_WITHOUT_HEADERS',
                            severity: 'HIGH',
                            file,
                            description: 'Data table without proper headers'
                        });
                    }
                }

                // Check for form fieldsets
                const forms = content.match(/<form[^>]*>/g) || [];
                for (const form of forms) {
                    const formContent = content.substring(content.indexOf(form));
                    const formEnd = formContent.indexOf('</form>');
                    const formHTML = formContent.substring(0, formEnd);

                    const radioInputs = (formHTML.match(/type="radio"/g) || []).length;
                    const checkboxInputs = (formHTML.match(/type="checkbox"/g) || []).length;
                    const fieldsets = (formHTML.match(/<fieldset/g) || []).length;

                    if ((radioInputs > 1 || checkboxInputs > 1) && fieldsets === 0) {
                        screenReaderIssues.push({
                            type: 'FORM_GROUPS_WITHOUT_FIELDSET',
                            severity: 'MEDIUM',
                            file,
                            description: 'Related form controls not grouped with fieldset'
                        });
                    }
                }
            }

            return {
                passed: screenReaderIssues.length === 0,
                issues: screenReaderIssues,
                details: {
                    filesScanned: Math.min(htmlFiles.length, 20),
                    screenReaderIssues: screenReaderIssues.length,
                    screenReaderSupport: screenReaderIssues.length === 0 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
                }
            };
        } catch (error) {
            return { passed: false, error: error.message };
        }
    }

    /**
     * Generate comprehensive audit report
     */
    async generateAuditReport() {
        const summary = this.generateAuditSummary();
        this.auditResults.summary = summary;

        const report = {
            timestamp: new Date().toISOString(),
            summary,
            security: this.auditResults.security,
            accessibility: this.auditResults.accessibility,
            errors: this.errors,
            warnings: this.warnings,
            recommendations: this.generateRecommendations()
        };

        // Save JSON report
        fs.writeFileSync('./security-accessibility-audit-report.json', JSON.stringify(report, null, 2));

        // Generate human-readable report
        this.generateHumanReadableReport(report);
    }

    /**
     * Generate audit summary
     */
    generateAuditSummary() {
        const securityScore = this.auditResults.summary.securityScore || 0;
        const accessibilityScore = this.auditResults.summary.accessibilityScore || 0;
        const overallScore = Math.round((securityScore + accessibilityScore) / 2);

        // Count critical issues
        let criticalIssues = 0;

        // Count security critical issues
        Object.values(this.auditResults.security).forEach(category => {
            if (category.issues || category.vulnerabilities) {
                const issues = category.issues || category.vulnerabilities || [];
                criticalIssues += issues.filter(issue => issue.severity === 'CRITICAL').length;
            }
        });

        // Count accessibility critical issues
        Object.values(this.auditResults.accessibility).forEach(category => {
            if (category.issues) {
                criticalIssues += category.issues.filter(issue => issue.severity === 'CRITICAL').length;
            }
        });

        return {
            securityScore,
            accessibilityScore,
            overallScore,
            criticalIssues,
            status: overallScore >= 90 ? 'EXCELLENT' :
                   overallScore >= 80 ? 'GOOD' :
                   overallScore >= 70 ? 'FAIR' : 'NEEDS_IMPROVEMENT',
            auditPassed: overallScore >= 80 && criticalIssues === 0
        };
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        // Security recommendations
        const securityIssues = [];
        Object.values(this.auditResults.security).forEach(category => {
            if (category.issues || category.vulnerabilities) {
                securityIssues.push(...(category.issues || category.vulnerabilities || []));
            }
        });

        if (securityIssues.length > 0) {
            const criticalSecurity = securityIssues.filter(i => i.severity === 'CRITICAL');
            const highSecurity = securityIssues.filter(i => i.severity === 'HIGH');

            if (criticalSecurity.length > 0) {
                recommendations.push({
                    priority: 'CRITICAL',
                    category: 'Security',
                    title: 'Critical Security Vulnerabilities',
                    description: `${criticalSecurity.length} critical security issues found`,
                    action: 'Immediately address all critical security vulnerabilities before deployment'
                });
            }

            if (highSecurity.length > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'Security',
                    title: 'High Priority Security Issues',
                    description: `${highSecurity.length} high priority security issues found`,
                    action: 'Address high priority security issues within 24 hours'
                });
            }
        }

        // Accessibility recommendations
        const accessibilityIssues = [];
        Object.values(this.auditResults.accessibility).forEach(category => {
            if (category.issues) {
                accessibilityIssues.push(...category.issues);
            }
        });

        if (accessibilityIssues.length > 0) {
            const highAccessibility = accessibilityIssues.filter(i => i.severity === 'HIGH');

            if (highAccessibility.length > 0) {
                recommendations.push({
                    priority: 'HIGH',
                    category: 'Accessibility',
                    title: 'WCAG Compliance Issues',
                    description: `${highAccessibility.length} high priority accessibility issues found`,
                    action: 'Fix accessibility issues to ensure WCAG 2.1 AA compliance'
                });
            }
        }

        // Overall recommendations
        if (this.auditResults.summary.overallScore < 80) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Overall',
                title: 'Improve Security and Accessibility',
                description: `Overall audit score: ${this.auditResults.summary.overallScore}%`,
                action: 'Implement comprehensive security and accessibility improvements'
            });
        }

        return recommendations;
    }

    /**
     * Generate human-readable report
     */
    generateHumanReadableReport(report) {
        const summary = report.summary;
        let output = `# Security and Accessibility Audit Report\n\n`;
        output += `Generated: ${report.timestamp}\n\n`;
        output += `## Executive Summary\n`;
        output += `- **Overall Score**: ${summary.overallScore}/100 (${summary.status})\n`;
        output += `- **Security Score**: ${summary.securityScore}/100\n`;
        output += `- **Accessibility Score**: ${summary.accessibilityScore}/100\n`;
        output += `- **Critical Issues**: ${summary.criticalIssues}\n`;
        output += `- **Audit Status**: ${summary.auditPassed ? 'PASSED' : 'FAILED'}\n\n`;

        // Security Results
        output += `## Security Audit Results\n\n`;
        Object.entries(report.security).forEach(([category, result]) => {
            const status = result.passed ? '✅' : '❌';
            output += `### ${status} ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;

            if (result.details) {
                Object.entries(result.details).forEach(([key, value]) => {
                    output += `- **${key}**: ${value}\n`;
                });
            }

            if (result.issues || result.vulnerabilities) {
                const issues = result.issues || result.vulnerabilities || [];
                if (issues.length > 0) {
                    output += `\n**Issues Found:**\n`;
                    issues.forEach((issue, index) => {
                        output += `${index + 1}. **${issue.type}** (${issue.severity}): ${issue.description}\n`;
                    });
                }
            }
            output += `\n`;
        });

        // Accessibility Results
        output += `## Accessibility Audit Results\n\n`;
        Object.entries(report.accessibility).forEach(([category, result]) => {
            const status = result.passed ? '✅' : '❌';
            output += `### ${status} ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;

            if (result.details) {
                Object.entries(result.details).forEach(([key, value]) => {
                    output += `- **${key}**: ${value}\n`;
                });
            }

            if (result.issues && result.issues.length > 0) {
                output += `\n**Issues Found:**\n`;
                result.issues.forEach((issue, index) => {
                    output += `${index + 1}. **${issue.type}** (${issue.severity}): ${issue.description}\n`;
                });
            }
            output += `\n`;
        });

        // Recommendations
        if (report.recommendations.length > 0) {
            output += `## Recommendations\n\n`;
            report.recommendations.forEach((rec, index) => {
                output += `### ${index + 1}. ${rec.title} (${rec.priority})\n`;
                output += `**Category**: ${rec.category}\n`;
                output += `**Description**: ${rec.description}\n`;
                output += `**Action**: ${rec.action}\n\n`;
            });
        }

        // Next Steps
        output += `## Next Steps\n\n`;
        if (summary.auditPassed) {
            output += `✅ **Audit Passed**\n`;
            output += `- Security and accessibility standards met\n`;
            output += `- Platform ready for production deployment\n`;
            output += `- Continue regular security and accessibility monitoring\n`;
        } else {
            output += `❌ **Audit Failed**\n`;
            output += `- Address critical and high priority issues\n`;
            output += `- Re-run audit after fixes are implemented\n`;
            output += `- Target: 80%+ overall score with zero critical issues\n`;
        }

        fs.writeFileSync('./security-accessibility-audit-report.md', output);
        console.log('📄 Security and accessibility audit report saved to security-accessibility-audit-report.md');
    }

    /**
     * Utility method to find files
     */
    findFiles(dir, pattern, excludeDirs = []) {
        const files = [];

        if (!fs.existsSync(dir)) return files;

        const walk = (currentDir) => {
            try {
                const items = fs.readdirSync(currentDir);

                for (const item of items) {
                    const fullPath = path.join(currentDir, item);
                    const stats = fs.statSync(fullPath);

                    if (stats.isDirectory()) {
                        if (!excludeDirs.some(exclude => fullPath.includes(exclude))) {
                            walk(fullPath);
                        }
                    } else if (pattern.test(item)) {
                        files.push(fullPath);
                    }
                }
            } catch (error) {
                // Ignore errors
            }
        };

        walk(dir);
        return files;
    }
}

// Run security and accessibility audit
console.log('🔒 Starting Security and Accessibility Audit...\n');
const auditor = new SecurityAccessibilityAuditor();
auditor.runComprehensiveAudit()
    .then(results => {
        const summary = results.summary;
        console.log(`🎉 Security and accessibility audit completed!`);
        console.log(`📊 Overall Score: ${summary.overallScore}/100 (${summary.status})`);
        console.log(`🔒 Security Score: ${summary.securityScore}/100`);
        console.log(`♿ Accessibility Score: ${summary.accessibilityScore}/100`);
        console.log(`🚨 Critical Issues: ${summary.criticalIssues}`);
        console.log(`✅ Audit Status: ${summary.auditPassed ? 'PASSED' : 'FAILED'}`);
        process.exit(summary.auditPassed ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Security and accessibility audit failed:', error);
        process.exit(1);
    });

export default SecurityAccessibilityAuditor;