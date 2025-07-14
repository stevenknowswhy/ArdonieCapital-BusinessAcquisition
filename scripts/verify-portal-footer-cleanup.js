/**
 * Verification script for portal footer cleanup
 * Ensures all portal pages have clean, single footer implementations
 */

import fs from 'fs';
import path from 'path';

class PortalFooterVerification {
    constructor() {
        this.results = {
            summary: {
                totalPages: 0,
                cleanPages: 0,
                issuesFound: 0
            },
            pageDetails: []
        };
    }

    async runVerification() {
        console.log('🔍 Verifying Portal Footer Cleanup...\n');

        const portalPages = [
            'portals/buyer-portal.html',
            'portals/seller-portal.html',
            'portals/attorney-portal.html',
            'portals/accountant-portal.html',
            'portals/lender-portal.html'
        ];

        for (const page of portalPages) {
            const result = this.verifyPage(page);
            this.results.pageDetails.push(result);
            this.updateCounters(result);
        }

        this.generateReport();
        return this.results;
    }

    verifyPage(filePath) {
        const result = {
            page: filePath,
            isClean: true,
            issues: [],
            checks: {
                hasOnlyOneFooter: false,
                noDynamicFooterDiv: false,
                noFooterConfigCode: false,
                noPortalFooterReferences: false,
                footerAtBottom: false
            }
        };

        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Check 1: Only one footer element
            const footerMatches = content.match(/<footer[^>]*>/g);
            if (footerMatches && footerMatches.length === 1) {
                result.checks.hasOnlyOneFooter = true;
            } else {
                result.issues.push(`Found ${footerMatches ? footerMatches.length : 0} footer elements (should be 1)`);
                result.isClean = false;
            }

            // Check 2: No dynamic footer div elements
            if (!content.includes('<div id="portal-footer"') && !content.includes('<div id="footer"')) {
                result.checks.noDynamicFooterDiv = true;
            } else {
                result.issues.push('Found dynamic footer div elements');
                result.isClean = false;
            }

            // Check 3: No footer configuration code
            if (!content.includes('Configure footer') && !content.includes('window.PortalFooter')) {
                result.checks.noFooterConfigCode = true;
            } else {
                result.issues.push('Found footer configuration JavaScript code');
                result.isClean = false;
            }

            // Check 4: No PortalFooter references
            if (!content.includes('PortalFooter.setDescription') && 
                !content.includes('PortalFooter.setTagline') && 
                !content.includes('PortalFooter.setStatus')) {
                result.checks.noPortalFooterReferences = true;
            } else {
                result.issues.push('Found PortalFooter method references');
                result.isClean = false;
            }

            // Check 5: Footer appears at bottom (before closing body tag)
            const footerIndex = content.lastIndexOf('<footer');
            const bodyCloseIndex = content.lastIndexOf('</body>');
            if (footerIndex > 0 && bodyCloseIndex > footerIndex) {
                result.checks.footerAtBottom = true;
            } else {
                result.issues.push('Footer not properly positioned at bottom of page');
                result.isClean = false;
            }

        } catch (error) {
            result.isClean = false;
            result.issues.push(`File read error: ${error.message}`);
        }

        return result;
    }

    updateCounters(result) {
        this.results.summary.totalPages++;
        if (result.isClean) {
            this.results.summary.cleanPages++;
        } else {
            this.results.summary.issuesFound++;
        }
    }

    generateReport() {
        console.log('📊 PORTAL FOOTER CLEANUP VERIFICATION RESULTS\n');
        console.log(`✅ Clean Pages: ${this.results.summary.cleanPages}/${this.results.summary.totalPages}`);
        console.log(`❌ Pages with Issues: ${this.results.summary.issuesFound}/${this.results.summary.totalPages}\n`);

        this.results.pageDetails.forEach(page => {
            const status = page.isClean ? '✅' : '❌';
            console.log(`${status} ${page.page}`);
            
            if (page.isClean) {
                console.log('   All footer cleanup checks passed');
            } else {
                console.log('   Issues found:');
                page.issues.forEach(issue => {
                    console.log(`   - ${issue}`);
                });
            }

            console.log('   Checks:');
            Object.entries(page.checks).forEach(([check, passed]) => {
                const checkStatus = passed ? '✅' : '❌';
                const checkName = check.replace(/([A-Z])/g, ' $1').toLowerCase();
                console.log(`   ${checkStatus} ${checkName}`);
            });
            console.log('');
        });

        // Save detailed results
        const outputPath = 'portal-footer-cleanup-verification.json';
        fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
        console.log(`💾 Detailed results saved to: ${outputPath}`);

        // Summary
        if (this.results.summary.issuesFound === 0) {
            console.log('🎉 All portal pages have clean footer implementations!');
        } else {
            console.log(`⚠️  ${this.results.summary.issuesFound} pages still need footer cleanup.`);
        }
    }
}

// Run the verification
const verifier = new PortalFooterVerification();
verifier.runVerification().then(results => {
    const allClean = results.summary.issuesFound === 0;
    process.exit(allClean ? 0 : 1);
}).catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});

export default PortalFooterVerification;
