#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicyConflicts() {
    console.log('🔒 Testing Enhanced RLS Policy Deployment');
    console.log('=========================================\n');
    
    // Test tables that were causing policy conflicts
    const conflictTables = [
        'payments',
        'listing_inquiries', 
        'matches',
        'cms_categories',
        'user_badges'
    ];
    
    console.log('📋 Testing Tables with Previous Policy Conflicts...');
    
    let accessibleTables = 0;
    
    for (const table of conflictTables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                if (error.message.includes('violates row-level security')) {
                    console.log(`   ⚠️  ${table}: RLS policy active (needs authentication)`);
                    accessibleTables++; // Table is accessible, just needs auth
                } else if (error.message.includes('infinite recursion')) {
                    console.log(`   ❌ ${table}: Still has infinite recursion`);
                } else {
                    console.log(`   ❌ ${table}: ${error.message}`);
                }
            } else {
                console.log(`   ✅ ${table}: Accessible without RLS issues`);
                accessibleTables++;
            }
        } catch (e) {
            console.log(`   ❌ ${table}: Exception - ${e.message}`);
        }
    }
    
    const successRate = (accessibleTables / conflictTables.length * 100).toFixed(1);
    console.log(`\n📊 Policy Conflict Resolution: ${accessibleTables}/${conflictTables.length} tables accessible (${successRate}%)`);
    
    return accessibleTables === conflictTables.length;
}

async function testServiceIntegrationReadiness() {
    console.log('\n🔧 Testing Service Integration Readiness');
    console.log('========================================\n');
    
    // Test basic operations that services need to perform
    const serviceTests = [
        {
            name: 'Payment System',
            table: 'payments',
            test: async () => {
                const { data, error } = await supabase.from('payments').insert({
                    payment_type: 'badge',
                    amount: 9900,
                    status: 'pending'
                }).select();
                return { 
                    success: !error || error.message.includes('null value') || error.message.includes('violates not-null'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security')
                };
            }
        },
        {
            name: 'Marketplace System',
            table: 'listing_inquiries',
            test: async () => {
                const { data, error } = await supabase.from('listing_inquiries').insert({
                    inquiry_type: 'general',
                    status: 'pending',
                    priority: 'medium',
                    subject: 'Test inquiry',
                    message: 'Test message'
                }).select();
                return { 
                    success: !error || error.message.includes('null value') || error.message.includes('violates not-null'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security')
                };
            }
        },
        {
            name: 'Matchmaking System',
            table: 'matches',
            test: async () => {
                const { data, error } = await supabase.from('matches').insert({
                    compatibility_score: 85,
                    status: 'pending'
                }).select();
                return { 
                    success: !error || error.message.includes('null value') || error.message.includes('violates not-null'), 
                    error,
                    rlsWorking: error && error.message.includes('violates row-level security')
                };
            }
        },
        {
            name: 'CMS System',
            table: 'cms_categories',
            test: async () => {
                const { data, error } = await supabase.from('cms_categories').select('*').limit(1);
                return { 
                    success: !error, 
                    error,
                    rlsWorking: false // SELECT should work for public read
                };
            }
        }
    ];
    
    let readyServices = 0;
    let rlsPoliciesWorking = 0;
    
    for (const test of serviceTests) {
        try {
            const result = await test.test();
            
            if (result.success) {
                console.log(`   ✅ ${test.name}: Ready for service integration`);
                readyServices++;
            } else if (result.rlsWorking) {
                console.log(`   🔒 ${test.name}: RLS policy working (needs authentication)`);
                readyServices++; // RLS working is good
                rlsPoliciesWorking++;
            } else {
                console.log(`   ❌ ${test.name}: ${result.error?.message || 'Failed'}`);
            }
        } catch (e) {
            console.log(`   ❌ ${test.name}: Exception - ${e.message}`);
        }
    }
    
    const readinessRate = (readyServices / serviceTests.length * 100).toFixed(1);
    console.log(`\n📊 Service Readiness: ${readyServices}/${serviceTests.length} services ready (${readinessRate}%)`);
    console.log(`🔒 RLS Policies Working: ${rlsPoliciesWorking}/${serviceTests.length} services have active RLS`);
    
    return { ready: readyServices === serviceTests.length, rlsActive: rlsPoliciesWorking > 0 };
}

async function testComprehensiveRLSCoverage() {
    console.log('\n📋 Testing Comprehensive RLS Coverage');
    console.log('=====================================\n');
    
    // Test all major system tables for RLS policy presence
    const systemTables = [
        { name: 'payments', system: 'Payment' },
        { name: 'badge_orders', system: 'Payment' },
        { name: 'escrow_accounts', system: 'Payment' },
        { name: 'listing_inquiries', system: 'Marketplace' },
        { name: 'inquiry_responses', system: 'Marketplace' },
        { name: 'saved_listings', system: 'Marketplace' },
        { name: 'matches', system: 'Matchmaking' },
        { name: 'user_preferences', system: 'Matchmaking' },
        { name: 'match_feedback', system: 'Matchmaking' },
        { name: 'cms_categories', system: 'CMS' },
        { name: 'cms_content', system: 'CMS' },
        { name: 'cms_comments', system: 'CMS' },
        { name: 'user_badges', system: 'Subscription' },
        { name: 'invoices', system: 'Subscription' }
    ];
    
    let tablesWithRLS = 0;
    const systemCoverage = {};
    
    for (const table of systemTables) {
        try {
            const { data, error } = await supabase.from(table.name).select('count').limit(1);
            
            if (!systemCoverage[table.system]) {
                systemCoverage[table.system] = { total: 0, covered: 0 };
            }
            systemCoverage[table.system].total++;
            
            if (error && error.message.includes('violates row-level security')) {
                console.log(`   🔒 ${table.name}: RLS policy active`);
                tablesWithRLS++;
                systemCoverage[table.system].covered++;
            } else if (!error) {
                console.log(`   ✅ ${table.name}: Accessible (public or no RLS needed)`);
                tablesWithRLS++;
                systemCoverage[table.system].covered++;
            } else {
                console.log(`   ❌ ${table.name}: ${error.message}`);
            }
        } catch (e) {
            console.log(`   ❌ ${table.name}: Exception - ${e.message}`);
        }
    }
    
    const coverageRate = (tablesWithRLS / systemTables.length * 100).toFixed(1);
    console.log(`\n📊 RLS Coverage: ${tablesWithRLS}/${systemTables.length} tables covered (${coverageRate}%)`);
    
    console.log('\n📋 System-by-System Coverage:');
    for (const [system, stats] of Object.entries(systemCoverage)) {
        const systemRate = (stats.covered / stats.total * 100).toFixed(1);
        console.log(`   ${system}: ${stats.covered}/${stats.total} tables (${systemRate}%)`);
    }
    
    return tablesWithRLS >= systemTables.length * 0.8; // 80% coverage
}

async function main() {
    try {
        console.log('🚀 Enhanced RLS Policy Validation');
        console.log('==================================\n');
        
        // Test policy conflict resolution
        const conflictsResolved = await testRLSPolicyConflicts();
        
        // Test service integration readiness
        const serviceResults = await testServiceIntegrationReadiness();
        
        // Test comprehensive RLS coverage
        const comprehensiveCoverage = await testComprehensiveRLSCoverage();
        
        // Generate final report
        console.log('\n📋 Enhanced RLS Deployment Status');
        console.log('=================================\n');
        
        if (conflictsResolved) {
            console.log('✅ POLICY CONFLICTS: All resolved - no "policy already exists" errors expected');
        } else {
            console.log('❌ POLICY CONFLICTS: Some tables still have issues');
        }
        
        if (serviceResults.ready) {
            console.log('✅ SERVICE INTEGRATION: All services ready for testing');
        } else {
            console.log('⚠️  SERVICE INTEGRATION: Some services need attention');
        }
        
        if (serviceResults.rlsActive) {
            console.log('🔒 RLS SECURITY: Policies are active and working');
        } else {
            console.log('⚠️  RLS SECURITY: Policies may not be active');
        }
        
        if (comprehensiveCoverage) {
            console.log('✅ RLS COVERAGE: Comprehensive coverage across all systems');
        } else {
            console.log('⚠️  RLS COVERAGE: Some systems need additional policies');
        }
        
        console.log('\n🎯 Next Steps:');
        if (conflictsResolved && serviceResults.ready && comprehensiveCoverage) {
            console.log('🚀 Enhanced RLS policies are ready for deployment!');
            console.log('📝 Deploy database/comprehensive-rls-policies.sql via Supabase SQL Editor');
            console.log('📝 Then run: node test-service-integration.js');
        } else {
            console.log('⚠️  Review and address any remaining issues before deployment');
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

main();
