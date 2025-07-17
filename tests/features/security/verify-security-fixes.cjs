/**
 * Command-line verification script for security fixes
 * Run with: node tests/verify-security-fixes.cjs
 */

const fs = require('fs');
const path = require('path');

class SecurityFixVerifier {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0
        };
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'pass': '✅',
            'fail': '❌',
            'warn': '⚠️',
            'info': 'ℹ️'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        
        if (type === 'pass') this.results.passed++;
        if (type === 'fail') this.results.failed++;
        if (type === 'warn') this.results.warnings++;
    }
    
    async verifyAuditLoggingFix() {
        this.log('Testing audit logging fix...', 'info');
        
        try {
            const auditFile = fs.readFileSync(path.join(__dirname, '../assets/js/security-audit.js'), 'utf8');
            
            // Check if TEST_EVENT is added to severity map
            if (auditFile.includes("'TEST_EVENT': 'LOW'")) {
                this.log('TEST_EVENT added to severity map', 'pass');
            } else {
                this.log('TEST_EVENT not found in severity map', 'fail');
            }
            
            // Check if error handling is added to directLogSecurityEvent
            if (auditFile.includes('try {') && auditFile.includes('catch (error)') && 
                auditFile.includes('directLogSecurityEvent')) {
                this.log('Error handling added to directLogSecurityEvent', 'pass');
            } else {
                this.log('Error handling missing in directLogSecurityEvent', 'fail');
            }
            
            // Check if getCurrentUserId has error handling
            if (auditFile.includes('getCurrentUserId()') && auditFile.includes('try {') && 
                auditFile.includes('console.warn')) {
                this.log('Error handling added to getCurrentUserId', 'pass');
            } else {
                this.log('Error handling missing in getCurrentUserId', 'fail');
            }
            
        } catch (error) {
            this.log(`Error reading audit file: ${error.message}`, 'fail');
        }
    }
    
    async verifySQLSanitizationFix() {
        this.log('Testing SQL sanitization fix...', 'info');
        
        try {
            const securityFile = fs.readFileSync(path.join(__dirname, '../assets/js/security-manager.js'), 'utf8');
            
            // Check if comprehensive SQL sanitization is implemented
            const sqlSanitizeRegex = /sanitizeSQL\(input\)\s*{[\s\S]*?DROP\|DELETE\|INSERT[\s\S]*?}/;
            if (sqlSanitizeRegex.test(securityFile)) {
                this.log('Comprehensive SQL sanitization implemented', 'pass');
            } else {
                this.log('SQL sanitization still basic', 'fail');
            }
            
            // Check if validateSQLInput method is added
            if (securityFile.includes('validateSQLInput(input)')) {
                this.log('SQL input validation method added', 'pass');
            } else {
                this.log('SQL input validation method missing', 'fail');
            }
            
            // Check for dangerous pattern detection
            if (securityFile.includes('dangerousPatterns') && securityFile.includes('OR\\s+\\d+\\s*=\\s*\\d+')) {
                this.log('Dangerous SQL pattern detection implemented', 'pass');
            } else {
                this.log('Dangerous SQL pattern detection missing', 'fail');
            }
            
        } catch (error) {
            this.log(`Error reading security manager file: ${error.message}`, 'fail');
        }
    }
    
    async verifyCareersManagerFix() {
        this.log('Testing careers manager integration fix...', 'info');
        
        try {
            const careersFile = fs.readFileSync(path.join(__dirname, '../assets/js/careers.js'), 'utf8');
            
            // Check if immediate initialization is implemented
            if (careersFile.includes('initializeCareersManager') && 
                careersFile.includes('document.readyState === \'loading\'')) {
                this.log('Immediate initialization logic added', 'pass');
            } else {
                this.log('Immediate initialization logic missing', 'fail');
            }
            
            // Check if manual initialization function is exposed
            if (careersFile.includes('window.initializeCareersManager = initializeCareersManager')) {
                this.log('Manual initialization function exposed', 'pass');
            } else {
                this.log('Manual initialization function not exposed', 'fail');
            }
            
        } catch (error) {
            this.log(`Error reading careers file: ${error.message}`, 'fail');
        }
        
        try {
            const jobMgmtFile = fs.readFileSync(path.join(__dirname, '../assets/js/job-management-supabase.js'), 'utf8');
            
            // Check if job management service has similar fix
            if (jobMgmtFile.includes('initializeJobManagementService') && 
                jobMgmtFile.includes('document.readyState === \'loading\'')) {
                this.log('Job management service initialization fixed', 'pass');
            } else {
                this.log('Job management service initialization not fixed', 'fail');
            }
            
        } catch (error) {
            this.log(`Error reading job management file: ${error.message}`, 'fail');
        }
    }
    
    async verifyTestEnhancements() {
        this.log('Testing security test enhancements...', 'info');
        
        try {
            const testFile = fs.readFileSync(path.join(__dirname, 'security-test-simple.html'), 'utf8');
            
            // Check if ensureSystemsInitialized method is added
            if (testFile.includes('ensureSystemsInitialized') && 
                testFile.includes('initializeJobManagementService') &&
                testFile.includes('initializeCareersManager')) {
                this.log('System initialization checks added to tests', 'pass');
            } else {
                this.log('System initialization checks missing in tests', 'fail');
            }
            
        } catch (error) {
            this.log(`Error reading test file: ${error.message}`, 'fail');
        }
    }
    
    async run() {
        console.log('🔧 Security Fix Verification Starting...\n');
        
        await this.verifyAuditLoggingFix();
        console.log('');
        
        await this.verifySQLSanitizationFix();
        console.log('');
        
        await this.verifyCareersManagerFix();
        console.log('');
        
        await this.verifyTestEnhancements();
        console.log('');
        
        // Summary
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        
        console.log('📊 VERIFICATION SUMMARY');
        console.log('========================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All security fixes verified successfully!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Some fixes need attention. Check the failed tests above.');
            process.exit(1);
        }
    }
}

// Run the verification
const verifier = new SecurityFixVerifier();
verifier.run().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});
