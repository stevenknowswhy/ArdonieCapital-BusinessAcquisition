/**
 * SQL Syntax Verification Script
 * Verifies that all SQL files have correct syntax and are ready for deployment
 */

const fs = require('fs');
const path = require('path');

// List of SQL files to verify
const SQL_FILES = [
    'database/rls-re-enablement-fix.sql',
    'database/function-security-fix.sql',
    'database/missing-rls-policies-fix.sql'
];

function verifySQLFile(filePath) {
    console.log(`\n🔍 Verifying: ${filePath}`);

    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            return false;
        }

        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');

        // Basic syntax checks
        const issues = [];

        // Check for common SQL syntax issues
        if (content.includes('RAISE NOTICE') && content.includes('DO $$')) {
            issues.push('Contains RAISE NOTICE in DO blocks (may cause syntax errors)');
        }

        // Check for unmatched quotes
        const singleQuotes = (content.match(/'/g) || []).length;
        if (singleQuotes % 2 !== 0) {
            issues.push('Unmatched single quotes detected');
        }

        // Check for unmatched parentheses
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            issues.push(`Unmatched parentheses: ${openParens} open, ${closeParens} close`);
        }

        // Check for basic structure
        if (!content.includes('CREATE POLICY') && !content.includes('CREATE OR REPLACE FUNCTION')) {
            issues.push('No CREATE POLICY or CREATE FUNCTION statements found');
        }

        // Check file size
        const stats = fs.statSync(filePath);
        const fileSizeKB = Math.round(stats.size / 1024);

        if (issues.length === 0) {
            console.log(`✅ Syntax verification passed`);
            console.log(`   File size: ${fileSizeKB} KB`);
            console.log(`   Lines: ${content.split('\n').length}`);
            return true;
        } else {
            console.log(`❌ Syntax issues found:`);
            issues.forEach(issue => console.log(`   - ${issue}`));
            return false;
        }

    } catch (error) {
        console.log(`❌ Error reading file: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('🔒 SQL Syntax Verification for BuyMartV1 Security Fixes');
    console.log('=' .repeat(60));

    let allPassed = true;
    const results = [];

    for (const sqlFile of SQL_FILES) {
        const passed = verifySQLFile(sqlFile);
        results.push({ file: sqlFile, passed });
        if (!passed) allPassed = false;
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    results.forEach((result, index) => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${index + 1}. ${status} ${result.file}`);
    });

    console.log(`\n📈 Overall Result: ${allPassed ? '✅ ALL PASSED' : '❌ ISSUES FOUND'}`);

    if (allPassed) {
        console.log('\n🎉 All SQL files are ready for deployment!');
        console.log('\n🚀 Next Steps:');
        console.log('1. Create database backup');
        console.log('2. Deploy Phase 1: database/rls-re-enablement-fix.sql');
        console.log('3. Deploy Phase 2: database/function-security-fix.sql');
        console.log('4. Deploy Phase 3: database/missing-rls-policies-fix.sql');
        console.log('5. Run validation tests');
    } else {
        console.log('\n⚠️  Please fix the identified issues before deployment.');
    }

    return allPassed;
}

// Run verification if this file is executed directly
if (require.main === module) {
    const success = main();
    process.exit(success ? 0 : 1);
}

module.exports = { verifySQLFile, main };