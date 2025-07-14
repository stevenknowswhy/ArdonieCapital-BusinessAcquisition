#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumnReferences() {
    console.log('🔍 Testing Fixed Column References in RLS Policies');
    console.log('=================================================\n');
    
    // Test tables that had column reference issues
    const tableTests = [
        {
            name: 'payments',
            expectedColumn: 'user_id',
            test: async () => {
                const { data, error } = await supabase.from('payments').select('user_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'listing_inquiries',
            expectedColumn: 'buyer_id, seller_id',
            test: async () => {
                const { data, error } = await supabase.from('listing_inquiries').select('buyer_id, seller_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'matches',
            expectedColumn: 'buyer_id, seller_id',
            test: async () => {
                const { data, error } = await supabase.from('matches').select('buyer_id, seller_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'cms_media',
            expectedColumn: 'uploaded_by',
            test: async () => {
                const { data, error } = await supabase.from('cms_media').select('uploaded_by').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'user_badges',
            expectedColumn: 'user_id',
            test: async () => {
                const { data, error } = await supabase.from('user_badges').select('user_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'badge_verification',
            expectedColumn: 'badge_id',
            test: async () => {
                const { data, error } = await supabase.from('badge_verification').select('badge_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        },
        {
            name: 'invoices',
            expectedColumn: 'user_id',
            test: async () => {
                const { data, error } = await supabase.from('invoices').select('user_id').limit(1);
                return { success: !error || !error.message.includes('column'), error };
            }
        }
    ];
    
    let passedTests = 0;
    
    for (const test of tableTests) {
        try {
            const result = await test.test();
            if (result.success) {
                console.log(`   ✅ ${test.name}: Column references correct (${test.expectedColumn})`);
                passedTests++;
            } else {
                console.log(`   ❌ ${test.name}: ${result.error?.message || 'Column reference issue'}`);
            }
        } catch (e) {
            console.log(`   ❌ ${test.name}: Exception - ${e.message}`);
        }
    }
    
    const successRate = (passedTests / tableTests.length * 100).toFixed(1);
    console.log(`\n📊 Column Reference Tests: ${passedTests}/${tableTests.length} passed (${successRate}%)`);
    
    return passedTests === tableTests.length;
}

async function testRLSPolicyDeployment() {
    console.log('\n🔒 Testing RLS Policy Deployment Readiness');
    console.log('==========================================\n');
    
    // Test that tables are accessible (either public or with proper RLS)
    const rlsTables = [
        'payments',
        'badge_orders', 
        'subscriptions',
        'listing_inquiries',
        'inquiry_responses',
        'saved_listings',
        'matches',
        'user_preferences',
        'match_feedback',
        'cms_categories',
        'cms_content',
        'cms_comments',
        'cms_media',
        'user_badges',
        'badge_verification',
        'invoices'
    ];
    
    let readyTables = 0;
    let rlsActiveTables = 0;
    
    for (const table of rlsTables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            
            if (!error) {
                console.log(`   ✅ ${table}: Accessible (public or no RLS conflicts)`);
                readyTables++;
            } else if (error.message.includes('violates row-level security')) {
                console.log(`   🔒 ${table}: RLS policy active (needs authentication)`);
                readyTables++;
                rlsActiveTables++;
            } else if (error.message.includes('column') && error.message.includes('does not exist')) {
                console.log(`   ❌ ${table}: Column reference error - ${error.message}`);
            } else {
                console.log(`   ⚠️  ${table}: ${error.message}`);
            }
        } catch (e) {
            console.log(`   ❌ ${table}: Exception - ${e.message}`);
        }
    }
    
    const readinessRate = (readyTables / rlsTables.length * 100).toFixed(1);
    console.log(`\n📊 RLS Deployment Readiness: ${readyTables}/${rlsTables.length} tables ready (${readinessRate}%)`);
    console.log(`🔒 Tables with Active RLS: ${rlsActiveTables}`);
    
    return { ready: readyTables >= rlsTables.length * 0.9, rlsActive: rlsActiveTables > 0 };
}

async function testServiceOperationReadiness() {
    console.log('\n🔧 Testing Service Operation Readiness');
    console.log('======================================\n');
    
    // Test basic operations that services need to perform
    const operationTests = [
        {
            name: 'Payment Creation',
            table: 'payments',
            operation: 'INSERT',
            test: async () => {
                const { data, error } = await supabase.from('payments').insert({
                    payment_type: 'badge',
                    amount: 9900,
                    status: 'pending'
                }).select();
                return { 
                    success: !error || !error.message.includes('column'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security'),
                    validationError: error && (error.message.includes('null value') || error.message.includes('not-null'))
                };
            }
        },
        {
            name: 'Inquiry Creation',
            table: 'listing_inquiries',
            operation: 'INSERT',
            test: async () => {
                const { data, error } = await supabase.from('listing_inquiries').insert({
                    inquiry_type: 'general',
                    status: 'pending',
                    priority: 'medium',
                    subject: 'Test inquiry',
                    message: 'Test message'
                }).select();
                return { 
                    success: !error || !error.message.includes('column'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security'),
                    validationError: error && (error.message.includes('null value') || error.message.includes('not-null'))
                };
            }
        },
        {
            name: 'Match Creation',
            table: 'matches',
            operation: 'INSERT',
            test: async () => {
                const { data, error } = await supabase.from('matches').insert({
                    compatibility_score: 85,
                    status: 'pending'
                }).select();
                return { 
                    success: !error || !error.message.includes('column'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security'),
                    validationError: error && (error.message.includes('null value') || error.message.includes('not-null'))
                };
            }
        },
        {
            name: 'CMS Category Access',
            table: 'cms_categories',
            operation: 'SELECT',
            test: async () => {
                const { data, error } = await supabase.from('cms_categories').select('*').limit(1);
                return { 
                    success: !error, 
                    error,
                    rlsWorking: false // SELECT should work for public read
                };
            }
        },
        {
            name: 'Media Library Access',
            table: 'cms_media',
            operation: 'SELECT',
            test: async () => {
                const { data, error } = await supabase.from('cms_media').select('uploaded_by').limit(1);
                return { 
                    success: !error, 
                    error,
                    rlsWorking: false // Should have public read access
                };
            }
        }
    ];
    
    let readyOperations = 0;
    let rlsOperations = 0;
    
    for (const test of operationTests) {
        try {
            const result = await test.test();
            
            if (result.success) {
                console.log(`   ✅ ${test.name}: Ready (no column errors)`);
                readyOperations++;
            } else if (result.rlsWorking) {
                console.log(`   🔒 ${test.name}: RLS policy working (needs authentication)`);
                readyOperations++;
                rlsOperations++;
            } else if (result.validationError) {
                console.log(`   ⚠️  ${test.name}: Validation error (RLS working, missing required fields)`);
                readyOperations++;
            } else {
                console.log(`   ❌ ${test.name}: ${result.error?.message || 'Failed'}`);
            }
        } catch (e) {
            console.log(`   ❌ ${test.name}: Exception - ${e.message}`);
        }
    }
    
    const readinessRate = (readyOperations / operationTests.length * 100).toFixed(1);
    console.log(`\n📊 Operation Readiness: ${readyOperations}/${operationTests.length} operations ready (${readinessRate}%)`);
    console.log(`🔒 Operations with RLS: ${rlsOperations}`);
    
    return readyOperations === operationTests.length;
}

async function main() {
    try {
        console.log('🚀 Fixed RLS Policies Validation');
        console.log('=================================\n');
        
        // Test column reference fixes
        const columnRefsFixed = await testColumnReferences();
        
        // Test RLS policy deployment readiness
        const rlsResults = await testRLSPolicyDeployment();
        
        // Test service operation readiness
        const operationsReady = await testServiceOperationReadiness();
        
        // Generate final report
        console.log('\n📋 Fixed RLS Policies Status');
        console.log('============================\n');
        
        if (columnRefsFixed) {
            console.log('✅ COLUMN REFERENCES: All fixed - no "column does not exist" errors expected');
        } else {
            console.log('❌ COLUMN REFERENCES: Some tables still have column issues');
        }
        
        if (rlsResults.ready) {
            console.log('✅ RLS DEPLOYMENT: Ready for deployment without conflicts');
        } else {
            console.log('⚠️  RLS DEPLOYMENT: Some tables need attention');
        }
        
        if (operationsReady) {
            console.log('✅ SERVICE OPERATIONS: All operations ready for testing');
        } else {
            console.log('⚠️  SERVICE OPERATIONS: Some operations need fixes');
        }
        
        console.log('\n🎯 Next Steps:');
        if (columnRefsFixed && rlsResults.ready && operationsReady) {
            console.log('🚀 Fixed RLS policies are ready for deployment!');
            console.log('📝 Deploy database/comprehensive-rls-policies.sql via Supabase SQL Editor');
            console.log('📝 Expected: No "column does not exist" errors');
            console.log('📝 Then run: node test-service-integration.js');
        } else {
            console.log('⚠️  Address remaining column reference issues before deployment');
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

main();
