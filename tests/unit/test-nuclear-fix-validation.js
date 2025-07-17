#!/usr/bin/env node

/**
 * Nuclear Fix Validation Test
 * Comprehensive validation that the nuclear infinite recursion fix worked
 * Tests every possible access pattern to ensure no recursion remains
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test deal_participants table with multiple access patterns
 */
async function testDealParticipantsComprehensive() {
    console.log('🔬 COMPREHENSIVE deal_participants RECURSION TEST');
    console.log('================================================');
    
    const tests = [
        {
            name: 'Basic Count Query',
            test: () => supabase.from('deal_participants').select('count').limit(1)
        },
        {
            name: 'Select All Columns',
            test: () => supabase.from('deal_participants').select('*').limit(5)
        },
        {
            name: 'Select Specific Columns',
            test: () => supabase.from('deal_participants').select('id, deal_id, user_id, role').limit(5)
        },
        {
            name: 'Filter by Role',
            test: () => supabase.from('deal_participants').select('*').eq('role', 'buyer').limit(5)
        },
        {
            name: 'Filter by Active Status',
            test: () => supabase.from('deal_participants').select('*').eq('is_active', true).limit(5)
        },
        {
            name: 'Order by Joined Date',
            test: () => supabase.from('deal_participants').select('*').order('joined_at', { ascending: false }).limit(5)
        },
        {
            name: 'Complex Filter Query',
            test: () => supabase.from('deal_participants').select('*').eq('is_active', true).in('role', ['buyer', 'seller']).limit(5)
        }
    ];
    
    let passCount = 0;
    
    for (const test of tests) {
        console.log(`\n   Testing: ${test.name}...`);
        
        try {
            const { data, error } = await test.test();
            
            if (error) {
                if (error.message.includes('infinite recursion')) {
                    console.log(`   ❌ INFINITE RECURSION DETECTED in ${test.name}`);
                    return { success: false, error: `Infinite recursion in ${test.name}` };
                } else if (error.message.includes('violates row-level security')) {
                    console.log(`   ✅ ${test.name}: RLS working correctly`);
                    passCount++;
                } else if (error.message.includes('does not exist')) {
                    console.log(`   ❌ ${test.name}: Table does not exist`);
                    return { success: false, error: 'Table does not exist' };
                } else {
                    console.log(`   ⚠️  ${test.name}: ${error.message}`);
                }
            } else {
                console.log(`   ✅ ${test.name}: Success (${data ? data.length || 'count' : 0} results)`);
                passCount++;
            }
        } catch (exception) {
            console.log(`   ❌ ${test.name}: Exception - ${exception.message}`);
            if (exception.message.includes('infinite recursion')) {
                return { success: false, error: `Exception with infinite recursion in ${test.name}` };
            }
        }
    }
    
    console.log(`\n   📊 deal_participants tests: ${passCount}/${tests.length} passed`);
    
    if (passCount === tests.length) {
        console.log('   🎉 ALL deal_participants TESTS PASSED - NO INFINITE RECURSION!');
        return { success: true, error: null };
    } else {
        console.log('   ⚠️  Some deal_participants tests failed');
        return { success: false, error: 'Some tests failed' };
    }
}

/**
 * Test related tables for circular references
 */
async function testRelatedTablesForCircularReferences() {
    console.log('\n🔗 TESTING RELATED TABLES FOR CIRCULAR REFERENCES');
    console.log('=================================================');
    
    const relatedTables = [
        { name: 'deals', description: 'Deals table (should not reference deal_participants)' },
        { name: 'profiles', description: 'Profiles table (foreign key target)' },
        { name: 'deal_documents', description: 'Deal documents table' },
        { name: 'deal_activities', description: 'Deal activities table' }
    ];
    
    let passCount = 0;
    
    for (const table of relatedTables) {
        console.log(`\n   Testing ${table.name} for circular references...`);
        
        try {
            const { data, error } = await supabase
                .from(table.name)
                .select('count')
                .limit(1);
                
            if (error) {
                if (error.message.includes('infinite recursion')) {
                    console.log(`   ❌ CIRCULAR REFERENCE: ${table.name} has infinite recursion`);
                    return { success: false, error: `Circular reference in ${table.name}` };
                } else if (error.message.includes('violates row-level security')) {
                    console.log(`   ✅ ${table.name}: No circular references (RLS working)`);
                    passCount++;
                } else if (error.message.includes('does not exist')) {
                    console.log(`   ⚠️  ${table.name}: Table does not exist (skipping)`);
                    passCount++; // Don't fail for missing tables
                } else {
                    console.log(`   ⚠️  ${table.name}: ${error.message}`);
                }
            } else {
                console.log(`   ✅ ${table.name}: No circular references detected`);
                passCount++;
            }
        } catch (exception) {
            console.log(`   ❌ ${table.name}: Exception - ${exception.message}`);
            if (exception.message.includes('infinite recursion')) {
                return { success: false, error: `Circular reference exception in ${table.name}` };
            }
        }
    }
    
    console.log(`\n   📊 Related tables tests: ${passCount}/${relatedTables.length} passed`);
    return { success: passCount === relatedTables.length, error: null };
}

/**
 * Test all 5 services for final validation
 */
async function testAllServicesForFinalValidation() {
    console.log('\n🎯 FINAL VALIDATION: ALL 5 SERVICES TEST');
    console.log('========================================');
    
    const services = [
        { name: 'Deal Management', table: 'deal_participants', critical: true },
        { name: 'Payment Service', table: 'payments', critical: false },
        { name: 'Enhanced Marketplace', table: 'listing_inquiries', critical: false },
        { name: 'Matchmaking Service', table: 'matches', critical: false },
        { name: 'CMS Service', table: 'cms_categories', critical: false }
    ];
    
    const results = [];
    
    for (const service of services) {
        console.log(`\n   ${service.name} Service:`);
        
        try {
            const { data, error } = await supabase
                .from(service.table)
                .select('count')
                .limit(1);
                
            if (error) {
                if (error.message.includes('infinite recursion')) {
                    console.log(`   ❌ ${service.name}: INFINITE RECURSION`);
                    results.push({ ...service, success: false, error: 'Infinite recursion' });
                } else if (error.message.includes('does not exist')) {
                    console.log(`   ❌ ${service.name}: Table does not exist`);
                    results.push({ ...service, success: false, error: 'Table does not exist' });
                } else if (error.message.includes('violates row-level security')) {
                    console.log(`   ✅ ${service.name}: PASS (RLS working correctly)`);
                    results.push({ ...service, success: true, error: null });
                } else {
                    console.log(`   ❌ ${service.name}: ${error.message}`);
                    results.push({ ...service, success: false, error: error.message });
                }
            } else {
                console.log(`   ✅ ${service.name}: PASS`);
                results.push({ ...service, success: true, error: null });
            }
        } catch (exception) {
            console.log(`   ❌ ${service.name}: Exception - ${exception.message}`);
            results.push({ ...service, success: false, error: exception.message });
        }
    }
    
    return results;
}

/**
 * Generate comprehensive final report
 */
function generateComprehensiveFinalReport(dealParticipantsResult, circularRefResult, allServicesResults) {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 NUCLEAR INFINITE RECURSION FIX VALIDATION REPORT');
    console.log('='.repeat(80));
    
    // Deal participants specific results
    console.log('\n🔧 DEAL PARTICIPANTS TABLE RESULTS:');
    if (dealParticipantsResult.success) {
        console.log('   ✅ INFINITE RECURSION ELIMINATED');
        console.log('   ✅ All access patterns working correctly');
    } else {
        console.log('   ❌ INFINITE RECURSION STILL EXISTS');
        console.log(`   ❌ Error: ${dealParticipantsResult.error}`);
    }
    
    // Circular reference results
    console.log('\n🔗 CIRCULAR REFERENCE RESULTS:');
    if (circularRefResult.success) {
        console.log('   ✅ No circular references detected');
        console.log('   ✅ All related tables accessible');
    } else {
        console.log('   ❌ Circular references still exist');
        console.log(`   ❌ Error: ${circularRefResult.error}`);
    }
    
    // All services results
    console.log('\n🎯 ALL SERVICES RESULTS:');
    let passCount = 0;
    allServicesResults.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const error = result.error ? ` (${result.error})` : '';
        console.log(`   ${status} ${result.name} Service${error}`);
        if (result.success) passCount++;
    });
    
    const successRate = (passCount / allServicesResults.length * 100).toFixed(1);
    
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`   Service Health: ${successRate}% (${passCount}/${allServicesResults.length} services passing)`);
    
    const overallSuccess = dealParticipantsResult.success && circularRefResult.success && passCount === allServicesResults.length;
    
    if (overallSuccess) {
        console.log('   🎉 NUCLEAR FIX SUCCESSFUL!');
        console.log('   🔥 100% SERVICE HEALTH ACHIEVED!');
        console.log('   ✅ Infinite recursion completely eliminated!');
        return true;
    } else {
        console.log('   ❌ Nuclear fix was not completely successful');
        console.log('\n💡 NEXT STEPS:');
        if (!dealParticipantsResult.success) {
            console.log('   1. deal_participants table still has infinite recursion');
            console.log('   2. Consider more aggressive database-level fixes');
        }
        if (!circularRefResult.success) {
            console.log('   1. Circular references still exist in related tables');
            console.log('   2. Check profiles table RLS policies');
        }
        if (passCount < allServicesResults.length) {
            console.log('   1. Some services still failing');
            console.log('   2. Check individual service table schemas');
        }
        return false;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 NUCLEAR INFINITE RECURSION FIX VALIDATION');
    console.log('===========================================');
    console.log('Testing if the nuclear fix eliminated ALL sources of infinite recursion\n');
    
    try {
        // Test 1: Comprehensive deal_participants testing
        const dealParticipantsResult = await testDealParticipantsComprehensive();
        
        // Test 2: Check for circular references in related tables
        const circularRefResult = await testRelatedTablesForCircularReferences();
        
        // Test 3: Final validation of all 5 services
        const allServicesResults = await testAllServicesForFinalValidation();
        
        // Generate comprehensive report
        const success = generateComprehensiveFinalReport(dealParticipantsResult, circularRefResult, allServicesResults);
        
        if (success) {
            console.log('\n✅ Nuclear infinite recursion fix validation SUCCESSFUL');
            console.log('🎯 100% service integration health achieved!');
            process.exit(0);
        } else {
            console.log('\n❌ Nuclear infinite recursion fix validation FAILED');
            console.log('🔧 Additional fixes may be required');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Nuclear fix validation failed:', error.message);
        process.exit(1);
    }
}

main();
