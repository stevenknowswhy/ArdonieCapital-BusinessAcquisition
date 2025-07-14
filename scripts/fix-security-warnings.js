/**
 * Security Warnings Fix Script for BuyMartV1
 * Ensures HTTPS form submissions and validates security headers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityWarningsFixer {
    constructor() {
        this.rootDir = path.resolve(__dirname, '..');
        this.fixedIssues = [];
        this.results = {
            filesProcessed: 0,
            formsFixed: 0,
            securityHeadersAdded: 0
        };
    }

    async run() {
        console.log('🔒 Starting Security Warnings Fixes...\n');

        try {
            await this.fixFormSubmissions();
            await this.addSecurityHeaders();
            await this.createSecurityConfig();

            this.generateReport();
            console.log('\n✅ Security warnings fixes completed successfully!');
        } catch (error) {
            console.error('❌ Error during security fixes:', error);
            throw error;
        }
    }

    /**
     * Fix form submissions to ensure HTTPS in production
     */
    async fixFormSubmissions() {
        console.log('📝 Fixing Form Submissions for HTTPS...');

        const htmlFiles = this.findHtmlFiles();
        let formsFixed = 0;

        for (const file of htmlFiles) {
            let content = fs.readFileSync(file, 'utf8');
            let modified = false;

            // Fix forms with HTTP action URLs
            content = content.replace(
                /(<form[^>]*action=["'])http:\/\/([^"']*)(["'][^>]*>)/g,
                '$1https://$2$3'
            );

            // Add security attributes to forms
            content = content.replace(
                /<form([^>]*?)>/g,
                (match, attributes) => {
                    if (!attributes.includes('novalidate') && !attributes.includes('data-secure')) {
                        return `<form${attributes} data-secure="true">`;
                    }
                    return match;
                }
            );

            // Add CSRF protection meta tag if missing
            if (content.includes('<form') && !content.includes('csrf-token')) {
                content = content.replace(
                    /<head>/i,
                    '<head>\n    <meta name="csrf-token" content="{{ csrf_token() }}">'
                );
                modified = true;
            }

            if (content !== fs.readFileSync(file, 'utf8')) {
                fs.writeFileSync(file, content);
                modified = true;
                formsFixed++;
            }

            if (modified) {
                this.fixedIssues.push(`Fixed form security in ${path.basename(file)}`);
            }
        }

        this.results.formsFixed = formsFixed;
        console.log(`   ✅ Fixed ${formsFixed} form submissions`);
    }

    /**
     * Add comprehensive security headers
     */
    async addSecurityHeaders() {
        console.log('🛡️ Adding Security Headers...');

        const securityHeadersScript = `
/**
 * Enhanced Security Headers for Production
 */
(function() {
    'use strict';
    
    // Force HTTPS in production
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        location.replace('https:' + window.location.href.substring(window.location.protocol.length));
    }
    
    // Add security headers via meta tags (fallback)
    const securityHeaders = [
        {
            'http-equiv': 'Content-Security-Policy',
            'content': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cpwebassets.codepen.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';"
        },
        {
            'http-equiv': 'X-Content-Type-Options',
            'content': 'nosniff'
        },
        {
            'http-equiv': 'X-Frame-Options',
            'content': 'DENY'
        },
        {
            'http-equiv': 'X-XSS-Protection',
            'content': '1; mode=block'
        },
        {
            'http-equiv': 'Referrer-Policy',
            'content': 'strict-origin-when-cross-origin'
        },
        {
            'http-equiv': 'Permissions-Policy',
            'content': 'camera=(), microphone=(), geolocation=(), payment=()'
        }
    ];
    
    // Add headers if not already present
    securityHeaders.forEach(header => {
        const existing = document.querySelector(\`meta[http-equiv="\${header['http-equiv']}"]\`);
        if (!existing) {
            const meta = document.createElement('meta');
            meta.setAttribute('http-equiv', header['http-equiv']);
            meta.setAttribute('content', header.content);
            document.head.appendChild(meta);
        }
    });
    
    // Form submission security
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.tagName === 'FORM') {
            // Ensure HTTPS for form submissions in production
            if (form.action && form.action.startsWith('http:') && location.hostname !== 'localhost') {
                form.action = form.action.replace('http:', 'https:');
            }
            
            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]');
            if (csrfToken && !form.querySelector('input[name="_token"]')) {
                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = '_token';
                tokenInput.value = csrfToken.getAttribute('content');
                form.appendChild(tokenInput);
            }
        }
    });
    
    // Secure cookie settings
    if (document.cookie) {
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value && location.protocol === 'https:') {
                // Ensure secure cookies in production
                document.cookie = \`\${name}=\${value}; Secure; SameSite=Strict; Path=/\`;
            }
        });
    }
    
    // Content Security Policy violation reporting
    document.addEventListener('securitypolicyviolation', function(e) {
        console.warn('CSP Violation:', {
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            originalPolicy: e.originalPolicy
        });
        
        // In production, you might want to report this to your logging service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'csp_violation', {
                'blocked_uri': e.blockedURI,
                'violated_directive': e.violatedDirective
            });
        }
    });
    
})();
`;

        fs.writeFileSync(path.join(this.rootDir, 'assets/js/security-enhanced.js'), securityHeadersScript);
        this.results.securityHeadersAdded = 1;
        this.fixedIssues.push('Created enhanced security headers script');
        console.log('   ✅ Added comprehensive security headers');
    }

    /**
     * Create security configuration file
     */
    async createSecurityConfig() {
        console.log('⚙️ Creating Security Configuration...');

        const securityConfig = {
            "production": {
                "forceHTTPS": true,
                "secureHeaders": {
                    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "DENY",
                    "X-XSS-Protection": "1; mode=block",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cpwebassets.codepen.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';",
                    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()"
                },
                "csrfProtection": true,
                "secureCookies": true
            },
            "development": {
                "forceHTTPS": false,
                "secureHeaders": {
                    "X-Content-Type-Options": "nosniff",
                    "X-Frame-Options": "SAMEORIGIN",
                    "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: ws: wss:;"
                },
                "csrfProtection": false,
                "secureCookies": false
            }
        };

        // Ensure config directory exists
        const configDir = path.join(this.rootDir, 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(configDir, 'security.json'),
            JSON.stringify(securityConfig, null, 2)
        );

        this.fixedIssues.push('Created security configuration file');
        console.log('   ✅ Security configuration created');
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
     * Generate security report
     */
    generateReport() {
        const report = `# Security Warnings Fixes Report

Generated: ${new Date().toISOString()}

## Summary
- **Files Processed**: ${this.results.filesProcessed}
- **Forms Fixed**: ${this.results.formsFixed}
- **Security Headers Added**: ${this.results.securityHeadersAdded}

## Issues Fixed
${this.fixedIssues.map(issue => `- ${issue}`).join('\n')}

## Security Measures Implemented
1. **HTTPS Enforcement**: All forms now use HTTPS in production
2. **Security Headers**: Comprehensive security headers added
3. **CSRF Protection**: CSRF tokens added to forms
4. **Secure Cookies**: Cookie security attributes enforced
5. **CSP Violation Reporting**: Content Security Policy violations logged

## Next Steps
1. Include security-enhanced.js in all HTML pages
2. Configure server-side security headers
3. Test HTTPS redirects in production
4. Implement proper CSRF token generation
5. Set up security monitoring and logging
`;

        fs.writeFileSync(path.join(this.rootDir, 'docs/security-fixes-report.md'), report);
        console.log('\n📊 Generated security fixes report');
    }
}

// Run the security fixer
const fixer = new SecurityWarningsFixer();
fixer.run().catch(console.error);
