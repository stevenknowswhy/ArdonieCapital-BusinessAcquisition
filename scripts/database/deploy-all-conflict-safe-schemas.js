#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Conflict-safe schema files in deployment order
const schemaFiles = [
    {
        name: 'Deal Management System',
        file: 'database/deal-management-schema.sql',
        tables: ['deals', 'deal_documents', 'deal_milestones', 'deal_activities'],
        priority: 1
    },
    {
        name: 'Payment System',
        file: 'database/payment-system-schema.sql',
        tables: ['payments', 'badge_orders', 'subscriptions', 'escrow_accounts', 'fee_transactions'],
        priority: 2
    },
    {
        name: 'Enhanced Marketplace',
        file: 'database/enhanced-marketplace-schema.sql',
        tables: ['listing_inquiries', 'inquiry_responses', 'listing_views', 'listing_engagement'],
        priority: 3
    },
    {
        name: 'Matchmaking System',
        file: 'database/matchmaking-schema.sql',
        tables: ['user_preferences', 'match_feedback', 'match_interactions', 'match_scores'],
        priority: 4
    },
    {
        name: 'CMS System',
        file: 'database/cms-schema.sql',
        tables: ['cms_categories', 'cms_tags', 'cms_content', 'cms_comments', 'cms_media'],
        priority: 5
    },
    {
        name: 'Subscription & Badge Management',
        file: 'database/subscriptions-schema.sql',
        tables: ['subscription_plans', 'user_badges', 'badge_verification', 'invoices'],
        priority: 6
    }
];

// Track deployment results
const deploymentResults = {
    schemas: [],
    totalTables: 0,
    accessibleTables: 0,
    errors: []
};

async function testTableAccess(tableName) {
    try {
        const { data, error } = await supabase.from(tableName).select('count').limit(1);
        if (error) {
            if (error.message.includes('infinite recursion')) {
                return { status: 'rls_error', message: 'RLS infinite recursion' };
            } else if (error.message.includes('does not exist')) {
                return { status: 'missing', message: 'Table does not exist' };
            } else {
                return { status: 'error', message: error.message };
            }
        }
        return { status: 'success', message: 'Accessible' };
    } catch (e) {
        return { status: 'exception', message: e.message };
    }
}

async function validateSchemaDeployment(schema) {
    console.log(`\n🔍 Validating ${schema.name}...`);
    
    const results = {
        name: schema.name,
        tables: {},
        accessible: 0,
        total: schema.tables.length
    };
    
    for (const table of schema.tables) {
        const result = await testTableAccess(table);
        results.tables[table] = result;
        
        if (result.status === 'success') {
            console.log(`   ✅ ${table}: ${result.message}`);
            results.accessible++;
            deploymentResults.accessibleTables++;
        } else {
            console.log(`   ❌ ${table}: ${result.message}`);
        }
        
        deploymentResults.totalTables++;
    }
    
    const successRate = (results.accessible / results.total * 100).toFixed(1);
    console.log(`   📊 ${schema.name}: ${results.accessible}/${results.total} tables accessible (${successRate}%)`);
    
    deploymentResults.schemas.push(results);
    return results.accessible === results.total;
}

async function generateDeploymentReport() {
    console.log('\n📈 Conflict-Safe Schema Deployment Report');
    console.log('==========================================');
    
    const overallHealth = deploymentResults.totalTables > 0 ? 
        (deploymentResults.accessibleTables / deploymentResults.totalTables * 100).toFixed(1) : 0;
    
    console.log(`\n📊 Overall Database Health: ${overallHealth}%`);
    console.log(`Total Tables: ${deploymentResults.totalTables}`);
    console.log(`Accessible: ${deploymentResults.accessibleTables}`);
    console.log(`Missing/Error: ${deploymentResults.totalTables - deploymentResults.accessibleTables}`);
    
    console.log(`\n📋 Schema-by-Schema Results:`);
    deploymentResults.schemas.forEach(schema => {
        const rate = (schema.accessible / schema.total * 100).toFixed(1);
        const status = rate === '100.0' ? '✅' : rate >= '50.0' ? '⚠️' : '❌';
        console.log(`   ${status} ${schema.name}: ${schema.accessible}/${schema.total} (${rate}%)`);
    });
    
    // Deployment recommendations
    console.log(`\n📋 Deployment Recommendations:`);
    
    if (overallHealth >= 80) {
        console.log('🟢 Excellent! Database is ready for production use');
        console.log('✅ All major features should be functional');
        console.log('📝 Next: Deploy RLS policies for security');
    } else if (overallHealth >= 60) {
        console.log('🟡 Good progress! Most features are available');
        console.log('⚠️  Some tables may need manual deployment');
        console.log('📝 Next: Deploy missing schemas via Supabase SQL Editor');
    } else if (overallHealth >= 30) {
        console.log('🟠 Partial deployment - core features available');
        console.log('🔄 Re-run schema deployments for missing tables');
        console.log('📝 Next: Focus on failed schema deployments');
    } else {
        console.log('🔴 Deployment needs attention');
        console.log('❌ Most features will not work properly');
        console.log('📝 Next: Manual deployment via Supabase SQL Editor required');
    }
    
    // Specific next steps
    console.log(`\n🎯 Immediate Next Steps:`);
    console.log('1. Copy schema file contents to Supabase SQL Editor');
    console.log('2. Execute each schema file individually');
    console.log('3. Deploy deal-management-rls-safe.sql for RLS policies');
    console.log('4. Re-run: node test-database-schemas.js');
    console.log('5. Run service integration tests');
    
    return overallHealth >= 60;
}

async function displayDeploymentInstructions() {
    console.log('\n📋 Manual Deployment Instructions');
    console.log('==================================');
    console.log('Since the schemas are now conflict-safe, deploy them manually:');
    console.log('');
    
    schemaFiles.forEach((schema, index) => {
        console.log(`${index + 1}. **${schema.name}**`);
        console.log(`   File: ${schema.file}`);
        console.log(`   Tables: ${schema.tables.join(', ')}`);
        console.log(`   Action: Copy file contents → Supabase SQL Editor → Execute`);
        console.log('');
    });
    
    console.log('🔒 **After all schemas are deployed:**');
    console.log('   File: database/deal-management-rls-safe.sql');
    console.log('   Purpose: Fix RLS infinite recursion issues');
    console.log('   Action: Copy contents → Supabase SQL Editor → Execute');
    console.log('');
    console.log('✅ **Validation:**');
    console.log('   Run: node test-database-schemas.js');
    console.log('   Expected: 80%+ database health');
}

async function main() {
    console.log('🚀 BuyMartV1 Conflict-Safe Schema Deployment Validator');
    console.log('======================================================');
    console.log('Testing current database state after conflict-safe modifications\n');
    
    try {
        // Test current database state
        console.log('🔍 Testing Current Database State...');
        
        let allSchemasSuccessful = true;
        
        for (const schema of schemaFiles) {
            const success = await validateSchemaDeployment(schema);
            if (!success) {
                allSchemasSuccessful = false;
            }
        }
        
        // Generate comprehensive report
        const overallSuccess = await generateDeploymentReport();
        
        // Show deployment instructions
        await displayDeploymentInstructions();
        
        if (overallSuccess) {
            console.log('\n🎉 Database deployment validation successful!');
            console.log('✅ Ready for service integration testing');
        } else {
            console.log('\n⚠️  Database needs schema deployment');
            console.log('📝 Follow the manual deployment instructions above');
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

main();
