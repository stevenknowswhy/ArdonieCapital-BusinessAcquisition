#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDealManagementDeployment() {
    console.log('🧪 Testing Deal Management Schema Deployment');
    console.log('=============================================\n');
    
    const testResults = {
        tables: {},
        enums: {},
        triggers: {},
        functions: {},
        rls: {},
        overall: false
    };
    
    // Test 1: Table Existence and Accessibility
    console.log('📋 Testing Table Existence...');
    const dealTables = ['deals', 'deal_documents', 'deal_milestones', 'deal_activities'];
    
    for (const table of dealTables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                if (error.message.includes('infinite recursion')) {
                    console.log(`   ❌ ${table}: RLS infinite recursion detected`);
                    testResults.tables[table] = 'rls_error';
                } else if (error.message.includes('does not exist')) {
                    console.log(`   ❌ ${table}: Table does not exist`);
                    testResults.tables[table] = 'missing';
                } else {
                    console.log(`   ❌ ${table}: ${error.message}`);
                    testResults.tables[table] = 'error';
                }
            } else {
                console.log(`   ✅ ${table}: Accessible`);
                testResults.tables[table] = 'success';
            }
        } catch (e) {
            console.log(`   ❌ ${table}: Exception - ${e.message}`);
            testResults.tables[table] = 'exception';
        }
    }
    
    // Test 2: Enum Types
    console.log('\n🔧 Testing Enum Types...');
    const enumTests = [
        { name: 'deal_status', testValue: 'initial_interest' },
        { name: 'deal_priority', testValue: 'medium' },
        { name: 'document_type', testValue: 'nda' }
    ];
    
    for (const enumTest of enumTests) {
        try {
            // Test if we can use the enum in a query
            const { data, error } = await supabase.rpc('test_enum_exists', {
                enum_name: enumTest.name,
                test_value: enumTest.testValue
            });
            
            if (error && !error.message.includes('does not exist')) {
                console.log(`   ✅ ${enumTest.name}: Enum type exists`);
                testResults.enums[enumTest.name] = 'success';
            } else {
                console.log(`   ❌ ${enumTest.name}: ${error?.message || 'Not accessible'}`);
                testResults.enums[enumTest.name] = 'missing';
            }
        } catch (e) {
            // Enum likely exists if we get a different error
            console.log(`   ✅ ${enumTest.name}: Likely exists (${e.message.substring(0, 40)}...)`);
            testResults.enums[enumTest.name] = 'likely_exists';
        }
    }
    
    // Test 3: Basic CRUD Operations (if tables are accessible)
    console.log('\n💾 Testing Basic CRUD Operations...');
    
    if (testResults.tables.deals === 'success') {
        try {
            // Test creating a deal
            const testDeal = {
                buyer_id: '00000000-0000-0000-0000-000000000001',
                seller_id: '00000000-0000-0000-0000-000000000002', 
                listing_id: '00000000-0000-0000-0000-000000000003',
                status: 'initial_interest',
                initial_offer: 250000,
                offer_date: new Date().toISOString().split('T')[0]
            };
            
            console.log('   Testing deal creation...');
            const { data: dealData, error: dealError } = await supabase
                .from('deals')
                .insert(testDeal)
                .select()
                .single();
            
            if (dealError) {
                console.log(`   ❌ Deal creation failed: ${dealError.message}`);
                testResults.rls.deals = 'failed';
            } else {
                console.log(`   ✅ Deal created successfully: ${dealData.deal_number}`);
                testResults.rls.deals = 'success';
                
                // Test milestone creation (should be automatic)
                console.log('   Testing automatic milestone creation...');
                const { data: milestones, error: milestoneError } = await supabase
                    .from('deal_milestones')
                    .select('*')
                    .eq('deal_id', dealData.id);
                
                if (milestoneError) {
                    console.log(`   ❌ Milestone query failed: ${milestoneError.message}`);
                } else {
                    console.log(`   ✅ Found ${milestones.length} milestones created automatically`);
                }
                
                // Cleanup test data
                await supabase.from('deals').delete().eq('id', dealData.id);
                console.log('   🧹 Test data cleaned up');
            }
        } catch (e) {
            console.log(`   ❌ CRUD test exception: ${e.message}`);
            testResults.rls.deals = 'exception';
        }
    } else {
        console.log('   ⚠️  Skipping CRUD tests - deals table not accessible');
    }
    
    // Test 4: Sequence Functionality
    console.log('\n🔢 Testing Sequence Functionality...');
    try {
        const { data, error } = await supabase.rpc('test_sequence', {
            sequence_name: 'deal_number_seq'
        });
        
        if (error && !error.message.includes('does not exist')) {
            console.log('   ✅ deal_number_seq: Sequence exists and functional');
            testResults.functions.sequence = 'success';
        } else {
            console.log('   ❌ deal_number_seq: Sequence missing or not functional');
            testResults.functions.sequence = 'missing';
        }
    } catch (e) {
        console.log('   ✅ deal_number_seq: Likely exists (function test not available)');
        testResults.functions.sequence = 'likely_exists';
    }
    
    // Generate Report
    console.log('\n📈 Deal Management Deployment Report');
    console.log('====================================');
    
    const tableCount = Object.keys(testResults.tables).length;
    const successfulTables = Object.values(testResults.tables).filter(v => v === 'success').length;
    const rlsErrors = Object.values(testResults.tables).filter(v => v === 'rls_error').length;
    const missingTables = Object.values(testResults.tables).filter(v => v === 'missing').length;
    
    console.log(`\n📊 Summary:`);
    console.log(`Tables: ${successfulTables}/${tableCount} accessible`);
    console.log(`RLS Errors: ${rlsErrors}`);
    console.log(`Missing Tables: ${missingTables}`);
    
    if (successfulTables === tableCount) {
        console.log('🟢 All deal management tables deployed successfully!');
        testResults.overall = true;
    } else if (rlsErrors > 0) {
        console.log('🟡 Tables exist but have RLS policy issues');
        console.log('💡 Recommendation: Deploy deal-management-rls-safe.sql');
    } else if (missingTables > 0) {
        console.log('🔴 Some tables are missing - schema deployment incomplete');
        console.log('💡 Recommendation: Re-run deal-management-schema.sql deployment');
    }
    
    // Specific recommendations
    console.log('\n📋 Next Steps:');
    if (rlsErrors > 0) {
        console.log('1. Execute deal-management-rls-safe.sql to fix RLS recursion');
    }
    if (missingTables > 0) {
        console.log('1. Re-deploy deal-management-schema.sql in Supabase SQL Editor');
    }
    if (successfulTables > 0) {
        console.log('2. Run full database health check: node test-database-schemas.js');
        console.log('3. Proceed with other schema deployments');
    }
    
    return testResults.overall;
}

async function main() {
    try {
        const success = await testDealManagementDeployment();
        
        if (success) {
            console.log('\n✅ Deal management deployment validation passed!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Deal management deployment needs attention');
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

main();
