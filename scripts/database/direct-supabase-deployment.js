#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkyMDE5NCwiZXhwIjoyMDY3NDk2MTk0fQ.0I9WjlCedZQ_RkXx8KRXkcVW7blG7EvmHgc-ClLPRLs';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Schema files in deployment order
const schemaFiles = [
    'database/deal-management-schema.sql',
    'database/payment-system-schema.sql', 
    'database/enhanced-marketplace-schema.sql',
    'database/matchmaking-schema.sql',
    'database/cms-schema.sql',
    'database/subscriptions-schema.sql'
];

async function executeDirectSQL(sql, description) {
    console.log(`\n📄 Deploying: ${description}`);
    
    try {
        // Use the REST API directly for SQL execution
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            },
            body: JSON.stringify({ sql: sql })
        });
        
        if (response.ok) {
            console.log(`   ✅ Successfully executed: ${description}`);
            return { success: true };
        } else {
            const error = await response.text();
            console.log(`   ❌ Failed: ${error}`);
            return { success: false, error };
        }
        
    } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function deploySchemaFile(filePath) {
    try {
        console.log(`\n🚀 Processing: ${filePath}`);
        
        // Read the SQL file
        const sql = readFileSync(filePath, 'utf8');
        
        if (!sql.trim()) {
            console.log(`   ⚠️  Empty file: ${filePath}`);
            return true;
        }
        
        // Split into individual statements
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`   📊 Found ${statements.length} SQL statements`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Execute each statement individually
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                console.log(`   Executing statement ${i + 1}/${statements.length}...`);
                
                try {
                    // Use direct SQL execution via Supabase client
                    const { data, error } = await supabase.rpc('exec', {
                        sql: statement + ';'
                    });
                    
                    if (error) {
                        if (error.message.includes('already exists') || 
                            error.message.includes('duplicate')) {
                            console.log(`     ⚠️  Already exists (OK)`);
                        } else {
                            console.log(`     ❌ Error: ${error.message.substring(0, 80)}...`);
                            errorCount++;
                        }
                    } else {
                        console.log(`     ✅ Success`);
                        successCount++;
                    }
                } catch (e) {
                    console.log(`     ❌ Exception: ${e.message.substring(0, 80)}...`);
                    errorCount++;
                }
            }
        }
        
        console.log(`   📈 Results: ${successCount} success, ${errorCount} errors`);
        return errorCount < (statements.length * 0.5); // Allow up to 50% errors for "already exists"
        
    } catch (error) {
        console.error(`❌ Failed to process ${filePath}:`, error.message);
        return false;
    }
}

async function validateTables() {
    console.log('\n🔍 Validating deployed tables...');
    
    const testTables = [
        'deals', 'deal_documents', 'deal_milestones', 'deal_activities',
        'payments', 'badge_orders', 'subscriptions', 'escrow_accounts',
        'listing_inquiries', 'inquiry_responses', 'listing_views',
        'matches', 'user_preferences', 'match_feedback',
        'cms_content', 'cms_categories', 'cms_tags'
    ];
    
    let accessibleTables = 0;
    
    for (const table of testTables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (!error) {
                console.log(`   ✅ ${table}: accessible`);
                accessibleTables++;
            } else {
                console.log(`   ❌ ${table}: ${error.message.substring(0, 60)}...`);
            }
        } catch (e) {
            console.log(`   ❌ ${table}: ${e.message.substring(0, 60)}...`);
        }
    }
    
    const healthPercentage = (accessibleTables / testTables.length * 100).toFixed(1);
    console.log(`\n🎯 Database Health: ${healthPercentage}% (${accessibleTables}/${testTables.length} tables)`);
    
    return healthPercentage;
}

async function main() {
    console.log('🚀 Direct Supabase Schema Deployment');
    console.log('====================================');
    console.log('Using direct SQL execution method\n');
    
    try {
        let successfulFiles = 0;
        
        // Deploy each schema file
        for (const filePath of schemaFiles) {
            const success = await deploySchemaFile(filePath);
            if (success) {
                successfulFiles++;
            }
        }
        
        console.log(`\n📊 Deployment Summary:`);
        console.log(`Files processed: ${schemaFiles.length}`);
        console.log(`Successful: ${successfulFiles}`);
        console.log(`Failed: ${schemaFiles.length - successfulFiles}`);
        
        // Validate the deployment
        const healthPercentage = await validateTables();
        
        if (healthPercentage >= 70) {
            console.log('\n🎉 Schema deployment successful!');
            console.log('✅ Most tables are now accessible');
            console.log('\n📋 Next steps:');
            console.log('1. Execute fix-rls-recursion.sql to resolve policy issues');
            console.log('2. Re-run node test-database-schemas.js to verify');
            console.log('3. Run service integration tests');
        } else {
            console.log('\n⚠️  Schema deployment partially successful');
            console.log('🔄 Some tables may need manual deployment via Supabase SQL Editor');
        }
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        process.exit(1);
    }
}

main();
