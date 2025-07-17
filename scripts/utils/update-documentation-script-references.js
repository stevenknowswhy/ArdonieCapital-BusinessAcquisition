#!/usr/bin/env node

/**
 * Update Documentation Script References
 * Updates all documentation files to reflect the new organized script structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Mapping of old script paths to new organized paths
const scriptMappings = {
    // Testing scripts
    'scripts/test-mcp.js': 'scripts/testing/test-mcp.js',
    'scripts/test-supabase-connection.js': 'scripts/testing/test-supabase-connection.js',
    'scripts/test-rls-policies.js': 'scripts/testing/test-rls-policies.js',
    'scripts/run-all-supabase-tests.js': 'scripts/testing/run-all-supabase-tests.js',
    'scripts/test-runner.js': 'scripts/testing/test-runner.js',
    'scripts/test-platform.js': 'scripts/testing/test-platform.js',
    'scripts/e2e-production-tests.js': 'scripts/testing/e2e-production-tests.js',
    'scripts/final-qa-testing.js': 'scripts/testing/final-qa-testing.js',
    
    // Setup scripts
    'scripts/setup-mcp.js': 'scripts/setup/setup-mcp.js',
    'scripts/setup-supabase-rls.js': 'scripts/setup/setup-supabase-rls.js',
    'scripts/setup-aws-mcp-server.js': 'scripts/setup/setup-aws-mcp-server.js',
    
    // Migration scripts
    'scripts/migrate-blog-posts.js': 'scripts/migration/migrate-blog-posts.js',
    'scripts/migrate-documents.js': 'scripts/migration/migrate-documents.js',
    'scripts/run-data-migration.js': 'scripts/migration/run-data-migration.js',
    
    // Database scripts
    'scripts/deploy-all-schemas.js': 'scripts/database/deploy-all-schemas.js',
    'scripts/deploy-all-conflict-safe-schemas.js': 'scripts/database/deploy-all-conflict-safe-schemas.js',
    'scripts/safe-schema-deployment.js': 'scripts/database/safe-schema-deployment.js',
    'scripts/direct-supabase-deployment.js': 'scripts/database/direct-supabase-deployment.js',
    
    // Footer scripts
    'scripts/footer-standardization-automation.js': 'scripts/footer/footer-standardization-automation.js',
    'scripts/footer-validation-comprehensive.js': 'scripts/footer/footer-validation-comprehensive.js',
    'scripts/complete-footer-standardization.js': 'scripts/footer/complete-footer-standardization.js',
    
    // Navigation scripts
    'scripts/admin-navigation-site-wide-implementation.js': 'scripts/navigation/admin-navigation-site-wide-implementation.js',
    'scripts/comprehensive-navigation-test.js': 'scripts/navigation/comprehensive-navigation-test.js',
    'scripts/update-navigation-site-wide.js': 'scripts/navigation/update-navigation-site-wide.js',
    
    // Utility scripts
    'scripts/generate-directory-footer-templates.js': 'scripts/utils/generate-directory-footer-templates.js',
    'scripts/optimize-images.js': 'scripts/utils/optimize-images.js',
    'scripts/run-cleanup.js': 'scripts/utils/run-cleanup.js',
    'scripts/add-favicon-to-pages.js': 'scripts/utils/add-favicon-to-pages.js',
    
    // Build scripts
    'scripts/build-optimization.js': 'scripts/build/build-optimization.js',
    'scripts/start-dev-server.js': 'scripts/build/start-dev-server.js',
    
    // Security scripts
    'scripts/quick-oauth-test.js': 'scripts/security/quick-oauth-test.js',
    'scripts/security-accessibility-audit.js': 'scripts/security/security-accessibility-audit.js',
    
    // Fixes scripts
    'scripts/fix-accessibility-issues.js': 'scripts/fixes/fix-accessibility-issues.js',
    'scripts/fix-security-warnings.js': 'scripts/fixes/fix-security-warnings.js',
    'scripts/integrate-fixes.js': 'scripts/fixes/integrate-fixes.js',
    
    // Performance scripts
    'scripts/performance-optimization-verification.js': 'scripts/performance/performance-optimization-verification.js',
    
    // Validation scripts
    'scripts/validate-imports.js': 'scripts/validation/validate-imports.js',
    'scripts/verify-dashboard-integration.js': 'scripts/validation/verify-dashboard-integration.js',
    'scripts/verify-theme-integration.js': 'scripts/validation/verify-theme-integration.js',
    'scripts/validate-dev-server.js': 'scripts/build/validate-dev-server.js',
    'scripts/verify-footer-alignment.js': 'scripts/footer/verify-footer-alignment.js',
    'scripts/verify-spacing-improvements.js': 'scripts/performance/verify-spacing-improvements.js',

    // Additional utility scripts
    'scripts/analyze-shadcn-components.js': 'scripts/utils/analyze-shadcn-components.js',
    'scripts/update-dashboard.js': 'scripts/utils/update-dashboard.js',
    'scripts/optimize-script-loading.js': 'scripts/utils/optimize-script-loading.js',

    // Audit scripts
    'scripts/comprehensive-platform-test.js': 'scripts/audit/comprehensive-platform-test.js',

    // JSON files
    'scripts/platform-test-results.json': 'scripts/audit/platform-test-results.json',

    // Deployment scripts
    'scripts/production-deployment-testing.js': 'scripts/deployment/production-deployment-testing.js',
    'scripts/production-health-monitor.js': 'scripts/deployment/production-health-monitor.js',
    'scripts/production-deployment-validation.js': 'scripts/deployment/production-deployment-validation.js',
    'scripts/production-deployment-simulation.js': 'scripts/deployment/production-deployment-simulation.js'
};

async function updateDocumentationFiles() {
    console.log('🔄 Updating documentation script references...\n');
    
    const docsDir = path.join(projectRoot, 'docs');
    const updatedFiles = [];
    
    // Find all markdown files in docs directory
    const findMarkdownFiles = (dir) => {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...findMarkdownFiles(fullPath));
            } else if (item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
        
        return files;
    };
    
    const markdownFiles = findMarkdownFiles(docsDir);
    
    for (const filePath of markdownFiles) {
        let content = fs.readFileSync(filePath, 'utf8');
        let hasChanges = false;
        
        // Update script references
        for (const [oldPath, newPath] of Object.entries(scriptMappings)) {
            if (content.includes(oldPath)) {
                content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            fs.writeFileSync(filePath, content);
            const relativePath = path.relative(projectRoot, filePath);
            updatedFiles.push(relativePath);
            console.log(`✅ Updated: ${relativePath}`);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total markdown files checked: ${markdownFiles.length}`);
    console.log(`- Files updated: ${updatedFiles.length}`);
    
    if (updatedFiles.length > 0) {
        console.log(`\n📝 Updated files:`);
        updatedFiles.forEach(file => console.log(`   - ${file}`));
    }
    
    console.log('\n✅ Documentation script references updated successfully!');
}

// Run the update
updateDocumentationFiles().catch(error => {
    console.error('❌ Error updating documentation:', error);
    process.exit(1);
});
