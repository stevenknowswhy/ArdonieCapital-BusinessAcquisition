#!/usr/bin/env node

/**
 * Deploy Multi-Role Schema to Supabase
 * This script deploys the enhanced multi-role database schema
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase configuration
const SUPABASE_URL = 'https://pbydepsqcypwqbicnsco.supabase.co';
const SUPABASE_PROJECT_ID = 'pbydepsqcypwqbicnsco';

class MultiRoleSchemaDeployer {
    constructor() {
        this.databaseDir = path.join(path.dirname(__dirname), 'database');
        this.deploymentSteps = [
            {
                name: 'Base Multi-Role Schema',
                file: 'multi-role-schema.sql',
                description: 'Deploy core multi-role tables and relationships'
            },
            {
                name: 'Enhanced Multi-Role Schema',
                file: 'enhanced-multi-role-schema.sql',
                description: 'Deploy subscription tiers and vendor categories'
            },
            {
                name: 'Multi-Role RLS Policies',
                file: 'multi-role-rls-policies.sql',
                description: 'Apply row-level security policies'
            },
            {
                name: 'Data Migration',
                file: 'migration-to-multi-role.sql',
                description: 'Migrate existing users to multi-role system'
            }
        ];
    }

    /**
     * Read SQL file content
     */
    readSQLFile(filename) {
        const filePath = path.join(this.databaseDir, filename);
        if (!fs.existsSync(filePath)) {
            throw new Error(`SQL file not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf8');
    }

    /**
     * Display deployment instructions
     */
    displayDeploymentInstructions() {
        console.log('🚀 MULTI-ROLE SCHEMA DEPLOYMENT GUIDE');
        console.log('=====================================\n');
        
        console.log('📋 PREREQUISITES:');
        console.log('1. Access to Supabase Dashboard');
        console.log('2. Admin privileges on the database');
        console.log('3. Backup of current database (recommended)\n');
        
        console.log('🔗 SUPABASE PROJECT DETAILS:');
        console.log(`   Project ID: ${SUPABASE_PROJECT_ID}`);
        console.log(`   Project URL: ${SUPABASE_URL}`);
        console.log(`   Dashboard: https://app.supabase.com/project/${SUPABASE_PROJECT_ID}\n`);
    }

    /**
     * Generate deployment SQL script
     */
    generateDeploymentScript() {
        console.log('📝 Generating deployment script...\n');
        
        let deploymentSQL = '';
        deploymentSQL += '-- ARDONIE CAPITAL MULTI-ROLE SYSTEM DEPLOYMENT\n';
        deploymentSQL += '-- Generated automatically - Deploy in Supabase SQL Editor\n';
        deploymentSQL += `-- Project: ${SUPABASE_PROJECT_ID}\n`;
        deploymentSQL += `-- Generated: ${new Date().toISOString()}\n\n`;
        
        deploymentSQL += '-- ============================================================================\n';
        deploymentSQL += '-- DEPLOYMENT VERIFICATION\n';
        deploymentSQL += '-- ============================================================================\n\n';
        
        deploymentSQL += 'DO $$\n';
        deploymentSQL += 'BEGIN\n';
        deploymentSQL += '    RAISE NOTICE \'🚀 Starting Multi-Role Schema Deployment...\';\n';
        deploymentSQL += '    RAISE NOTICE \'Project: ' + SUPABASE_PROJECT_ID + '\';\n';
        deploymentSQL += '    RAISE NOTICE \'Timestamp: %\', NOW();\n';
        deploymentSQL += 'END $$;\n\n';

        // Add each deployment step
        for (const step of this.deploymentSteps) {
            try {
                const sqlContent = this.readSQLFile(step.file);
                
                deploymentSQL += '-- ============================================================================\n';
                deploymentSQL += `-- ${step.name.toUpperCase()}\n`;
                deploymentSQL += `-- ${step.description}\n`;
                deploymentSQL += '-- ============================================================================\n\n';
                
                deploymentSQL += sqlContent + '\n\n';
                
                console.log(`✅ Added: ${step.name}`);
            } catch (error) {
                console.log(`⚠️  Skipped: ${step.name} (${error.message})`);
            }
        }

        // Add final verification
        deploymentSQL += '-- ============================================================================\n';
        deploymentSQL += '-- DEPLOYMENT COMPLETION VERIFICATION\n';
        deploymentSQL += '-- ============================================================================\n\n';
        
        deploymentSQL += 'DO $$\n';
        deploymentSQL += 'DECLARE\n';
        deploymentSQL += '    table_count INTEGER;\n';
        deploymentSQL += '    role_count INTEGER;\n';
        deploymentSQL += '    user_role_count INTEGER;\n';
        deploymentSQL += 'BEGIN\n';
        deploymentSQL += '    -- Count new tables\n';
        deploymentSQL += '    SELECT COUNT(*) INTO table_count FROM information_schema.tables \n';
        deploymentSQL += '    WHERE table_schema = \'public\' \n';
        deploymentSQL += '    AND table_name IN (\'roles\', \'user_roles\', \'subscription_tiers\', \'vendor_categories\');\n\n';
        deploymentSQL += '    SELECT COUNT(*) INTO role_count FROM roles;\n';
        deploymentSQL += '    SELECT COUNT(*) INTO user_role_count FROM user_roles;\n\n';
        deploymentSQL += '    RAISE NOTICE \'📊 DEPLOYMENT SUMMARY:\';\n';
        deploymentSQL += '    RAISE NOTICE \'New tables created: %\', table_count;\n';
        deploymentSQL += '    RAISE NOTICE \'Roles defined: %\', role_count;\n';
        deploymentSQL += '    RAISE NOTICE \'User roles assigned: %\', user_role_count;\n\n';
        deploymentSQL += '    IF table_count >= 4 AND role_count >= 5 THEN\n';
        deploymentSQL += '        RAISE NOTICE \'✅ Multi-role schema deployment completed successfully!\';\n';
        deploymentSQL += '    ELSE\n';
        deploymentSQL += '        RAISE NOTICE \'⚠️  Deployment may be incomplete. Please review.\';\n';
        deploymentSQL += '    END IF;\n';
        deploymentSQL += 'END $$;\n\n';

        return deploymentSQL;
    }

    /**
     * Save deployment script to file
     */
    saveDeploymentScript(sqlContent) {
        const outputPath = path.join(this.databaseDir, 'DEPLOY-MULTI-ROLE-COMPLETE.sql');
        fs.writeFileSync(outputPath, sqlContent);
        console.log(`\n📁 Deployment script saved: ${outputPath}`);
        return outputPath;
    }

    /**
     * Display manual deployment instructions
     */
    displayManualInstructions(scriptPath) {
        console.log('\n🔧 MANUAL DEPLOYMENT INSTRUCTIONS:');
        console.log('==================================\n');
        
        console.log('1. 📋 BACKUP YOUR DATABASE (IMPORTANT!)');
        console.log('   - Go to Supabase Dashboard > Settings > Database');
        console.log('   - Create a backup before proceeding\n');
        
        console.log('2. 🔗 OPEN SUPABASE SQL EDITOR');
        console.log(`   - Visit: https://app.supabase.com/project/${SUPABASE_PROJECT_ID}/sql`);
        console.log('   - Click "New Query"\n');
        
        console.log('3. 📝 COPY AND EXECUTE SQL');
        console.log(`   - Open file: ${scriptPath}`);
        console.log('   - Copy the entire content');
        console.log('   - Paste into Supabase SQL Editor');
        console.log('   - Click "Run" to execute\n');
        
        console.log('4. ✅ VERIFY DEPLOYMENT');
        console.log('   - Check the output messages for success confirmation');
        console.log('   - Verify new tables exist in Database > Tables');
        console.log('   - Test authentication and role assignment\n');
        
        console.log('5. 🧪 TEST THE SYSTEM');
        console.log('   - Run: npm run test:auth');
        console.log('   - Run: npm run test:database');
        console.log('   - Test user registration and login\n');
    }

    /**
     * Generate configuration updates
     */
    generateConfigUpdates() {
        console.log('⚙️  CONFIGURATION UPDATES NEEDED:');
        console.log('=================================\n');
        
        const newTables = [
            'roles',
            'user_roles', 
            'role_hierarchies',
            'user_sessions',
            'companies',
            'subscription_tiers',
            'user_subscriptions',
            'vendor_categories',
            'vendor_profiles',
            'dashboard_preferences',
            'usage_analytics',
            'content_workflow',
            'audit_log'
        ];

        console.log('📝 Update src/shared/services/supabase/supabase.config.js:');
        console.log('Add these tables to the database.tables configuration:\n');
        
        newTables.forEach(table => {
            console.log(`    ${table}: '${table}',`);
        });
        
        console.log('\n📝 Update authentication service to use multi-role system');
        console.log('📝 Update dashboard routing to handle role selection');
        console.log('📝 Test all existing functionality for backward compatibility\n');
    }

    /**
     * Main deployment process
     */
    async deploy() {
        try {
            console.log('🎯 Multi-Role Schema Deployment Tool\n');
            
            this.displayDeploymentInstructions();
            
            const deploymentSQL = this.generateDeploymentScript();
            const scriptPath = this.saveDeploymentScript(deploymentSQL);
            
            this.displayManualInstructions(scriptPath);
            this.generateConfigUpdates();
            
            console.log('🎉 Deployment preparation completed!');
            console.log('📋 Follow the manual instructions above to complete the deployment.\n');
            
        } catch (error) {
            console.error('❌ Deployment preparation failed:', error.message);
            process.exit(1);
        }
    }
}

// Run the deployment
const deployer = new MultiRoleSchemaDeployer();
deployer.deploy();
