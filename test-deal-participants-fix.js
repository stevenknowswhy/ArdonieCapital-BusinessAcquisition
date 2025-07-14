#!/usr/bin/env node

/**
 * Test Deal Participants Infinite Recursion Fix
 * Specifically validates that the deal_participants table infinite recursion is resolved
 * Expected: Deal Management Service should pass, achieving 100% service health (5/5)
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test deal_participants table specifically for infinite recursion
 */
async function testDealParticipantsRecursion() {
    console.log('🔧 Testing deal_participants table for infinite recursion...');
    
    try {
        // Test 1: Basic table access
        console.log('   Testing basic table access...');
        const { data: basicData, error: basicError } = await supabase
            .from('deal_participants')
            .select('count')
            .limit(1);
            
        if (basicError) {
            if (basicError.message.includes('infinite recursion')) {
                console.log('   ❌ INFINITE RECURSION STILL EXISTS');
                return { success: false, error: 'Infinite recursion detected' };
            } else if (basicError.message.includes('does not exist')) {
                console.log('   ❌ Table does not exist');
                return { success: false, error: 'Table does not exist' };
            } else if (basicError.message.includes('violates row-level security')) {
                console.log('   ✅ Table accessible (RLS working correctly)');
            } else {
                console.log(`   ❌ Unexpected error: ${basicError.message}`);
                return { success: false, error: basicError.message };
            }
        } else {
            console.log('   ✅ Table accessible without errors');
        }
        
        // Test 2: Try a more complex query that might trigger recursion
        console.log('   Testing complex query for recursion triggers...');
        const { data: complexData, error: complexError } = await supabase
            .from('deal_participants')
            .select('id, deal_id, user_id, role')
            .limit(5);
            
        if (complexError) {
            if (complexError.message.includes('infinite recursion')) {
                console.log('   ❌ INFINITE RECURSION in complex query');
                return { success: false, error: 'Infinite recursion in complex query' };
            } else if (complexError.message.includes('violates row-level security')) {
                console.log('   ✅ Complex query handled correctly (RLS working)');
            } else {
                console.log(`   ⚠️  Complex query error: ${complexError.message}`);
            }
        } else {
            console.log('   ✅ Complex query executed without recursion');
        }
        
        // Test 3: Test related tables for circular references
        console.log('   Testing deals table for circular references...');
        const { data: dealsData, error: dealsError } = await supabase
            .from('deals')
            .select('count')
            .limit(1);
            
        if (dealsError) {
            if (dealsError.message.includes('infinite recursion')) {
                console.log('   ❌ CIRCULAR REFERENCE: deals table has infinite recursion');
                return { success: false, error: 'Circular reference in deals table' };
            } else if (dealsError.message.includes('violates row-level security')) {
                console.log('   ✅ Deals table accessible (RLS working correctly)');
            } else {
                console.log(`   ⚠️  Deals table error: ${dealsError.message}`);
            }
        } else {
            console.log('   ✅ Deals table accessible without circular references');
        }
        
        console.log('   ✅ Deal participants infinite recursion FIXED!');
        return { success: true, error: null };
        
    } catch (error) {
        console.log(`   ❌ Exception during testing: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Test all 5 services to verify 100% success rate
 */
async function testAllServices() {
    console.log('\n📊 Testing all 5 services for 100% success rate...');
    
    const services = [
        { name: 'Deal Management', table: 'deal_participants', testFunc: testDealParticipantsRecursion },
        { name: 'Payment Service', table: 'payments' },
        { name: 'Enhanced Marketplace', table: 'listing_inquiries' },
        { name: 'Matchmaking Service', table: 'matches' },
        { name: 'CMS Service', table: 'cms_categories' }
    ];
    
    const results = [];
    
    for (const service of services) {
        console.log(`\n${service.name} Service:`);
        
        if (service.testFunc) {
            // Use custom test function for deal management
            const result = await service.testFunc();
            results.push({ ...service, ...result });
        } else {
            // Standard table access test for other services
            try {
                const { data, error } = await supabase
                    .from(service.table)
                    .select('count')
                    .limit(1);
                    
                if (error) {
                    if (error.message.includes('infinite recursion')) {
                        console.log(`   ❌ ${service.name}: Infinite recursion`);
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
            } catch (error) {
                console.log(`   ❌ ${service.name}: Exception - ${error.message}`);
                results.push({ ...service, success: false, error: error.message });
            }
        }
    }
    
    return results;
}

/**
 * Generate final report
 */
function generateFinalReport(results) {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 DEAL PARTICIPANTS INFINITE RECURSION FIX VALIDATION');
    console.log('='.repeat(70));
    
    let passCount = 0;
    
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        const error = result.error ? ` (${result.error})` : '';
        console.log(`${status} ${result.name} Service${error}`);
        if (result.success) passCount++;
    });
    
    const successRate = (passCount / results.length * 100).toFixed(1);
    
    console.log('\n📊 FINAL RESULTS:');
    console.log(`   Service Health: ${successRate}% (${passCount}/${results.length} services passing)`);
    
    if (passCount === results.length) {
        console.log('   🎉 100% SERVICE HEALTH ACHIEVED!');
        console.log('   🔥 Deal participants infinite recursion successfully fixed!');
        console.log('   ✅ All 5 services are now passing!');
        return true;
    } else if (passCount === 4) {
        console.log('   ⚠️  80% service health - Deal Management Service still needs attention');
        console.log('\n💡 NEXT STEPS:');
        console.log('   1. Deploy database/deal-participants-infinite-recursion-fix.sql');
        console.log('   2. Re-run this validation test');
        return false;
    } else {
        console.log('   ❌ Multiple services still have issues');
        console.log('\n💡 NEXT STEPS:');
        console.log('   1. Ensure all schema files are deployed');
        console.log('   2. Deploy the comprehensive RLS policy fix');
        console.log('   3. Deploy the deal participants recursion fix');
        return false;
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🔥 DEAL PARTICIPANTS INFINITE RECURSION FIX VALIDATION');
    console.log('======================================================');
    console.log('Target: Fix remaining infinite recursion to achieve 100% service health\n');
    
    try {
        // First, specifically test deal_participants for infinite recursion
        const dealParticipantsResult = await testDealParticipantsRecursion();
        
        // Then test all services
        const allResults = await testAllServices();
        
        // Generate final report
        const success = generateFinalReport(allResults);
        
        if (success) {
            console.log('\n✅ Deal participants infinite recursion fix validation SUCCESSFUL');
            console.log('🎯 100% service integration health achieved!');
            process.exit(0);
        } else {
            console.log('\n⚠️  Deal participants infinite recursion fix validation completed with issues');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
}

main();
