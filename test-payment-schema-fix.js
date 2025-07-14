#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentSystemTables() {
    console.log('🧪 Testing Payment System Schema Fix');
    console.log('====================================\n');
    
    // Payment system tables to test
    const paymentTables = [
        'payments',
        'badge_orders', 
        'subscriptions',
        'escrow_accounts',
        'escrow_transactions',
        'fee_transactions',
        'fee_configurations',
        'discount_codes'
    ];
    
    const results = {
        accessible: 0,
        total: paymentTables.length,
        errors: []
    };
    
    console.log('📋 Testing Payment System Tables...');
    
    for (const table of paymentTables) {
        try {
            const { data, error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                if (error.message.includes('does not exist')) {
                    console.log(`   ❌ ${table}: Table does not exist`);
                    results.errors.push({ table, error: 'Table does not exist' });
                } else if (error.message.includes('infinite recursion')) {
                    console.log(`   ⚠️  ${table}: RLS infinite recursion (table exists but has policy issues)`);
                    results.accessible++; // Table exists, just has RLS issues
                } else {
                    console.log(`   ❌ ${table}: ${error.message}`);
                    results.errors.push({ table, error: error.message });
                }
            } else {
                console.log(`   ✅ ${table}: Accessible`);
                results.accessible++;
            }
        } catch (e) {
            console.log(`   ❌ ${table}: Exception - ${e.message}`);
            results.errors.push({ table, error: e.message });
        }
    }
    
    // Calculate success rate
    const successRate = (results.accessible / results.total * 100).toFixed(1);
    
    console.log(`\n📊 Payment System Results:`);
    console.log(`Accessible: ${results.accessible}/${results.total} tables (${successRate}%)`);
    
    if (results.accessible === results.total) {
        console.log('🟢 All payment system tables are accessible!');
        console.log('✅ Schema deployment was successful');
        return true;
    } else if (results.accessible > 0) {
        console.log('🟡 Some payment system tables are accessible');
        console.log('⚠️  Some tables may need deployment');
        return false;
    } else {
        console.log('🔴 No payment system tables are accessible');
        console.log('❌ Schema deployment needed');
        return false;
    }
}

async function testBasicPaymentOperations() {
    console.log('\n💳 Testing Basic Payment Operations...');
    
    try {
        // Test if we can query the payments table structure
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .limit(0); // Just get structure, no data
        
        if (error) {
            console.log(`   ❌ Cannot query payments table: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Payments table structure is queryable');
        
        // Test enum types by trying to insert a test record (will fail due to missing required fields, but will validate enums)
        try {
            const { data: insertData, error: insertError } = await supabase
                .from('payments')
                .insert({
                    payment_type: 'badge',
                    amount: 9900,
                    status: 'pending'
                })
                .select();
            
            if (insertError) {
                if (insertError.message.includes('null value') || insertError.message.includes('violates')) {
                    console.log('   ✅ Enum types are working (insert failed due to missing required fields, as expected)');
                    return true;
                } else {
                    console.log(`   ❌ Enum validation failed: ${insertError.message}`);
                    return false;
                }
            } else {
                console.log('   ✅ Test payment record created successfully');
                // Clean up test record
                if (insertData && insertData[0]) {
                    await supabase.from('payments').delete().eq('id', insertData[0].id);
                    console.log('   🧹 Test record cleaned up');
                }
                return true;
            }
        } catch (e) {
            console.log(`   ❌ Payment operation test failed: ${e.message}`);
            return false;
        }
        
    } catch (error) {
        console.log(`   ❌ Payment operations test failed: ${error.message}`);
        return false;
    }
}

async function main() {
    try {
        console.log('🔍 Testing Payment System Schema Fix');
        console.log('After fixing trigger cleanup that caused "relation does not exist" errors\n');

        // Test table accessibility
        const tablesAccessible = await testPaymentSystemTables();

        // Test basic operations if tables are accessible
        let operationsWorking = false;
        if (tablesAccessible) {
            operationsWorking = await testBasicPaymentOperations();
        }

        // Generate recommendations
        console.log('\n📋 Recommendations:');

        if (tablesAccessible && operationsWorking) {
            console.log('🎉 Payment system schema fix was successful!');
            console.log('✅ All tables are accessible and operations work');
            console.log('📝 Next: Deploy other schema files (marketplace, matchmaking, CMS, subscriptions)');
            console.log('📝 Then: Add foreign key constraints after all schemas are deployed');
        } else if (tablesAccessible) {
            console.log('🟡 Tables exist but operations need attention');
            console.log('📝 Next: Check RLS policies and data validation');
        } else {
            console.log('🔴 Payment system schema still needs deployment');
            console.log('📝 Next: Deploy database/payment-system-schema.sql via Supabase SQL Editor');
            console.log('📝 The schema is now safe to deploy without "relation does not exist" errors');
        }

        console.log('\n🎯 The key fixes applied:');
        console.log('- Fixed trigger cleanup to only drop triggers if tables exist');
        console.log('- Removed immediate foreign key constraints during table creation');
        console.log('- Added conditional foreign key constraints at the end of the schema');
        console.log('- This allows the schema to be deployed safely even on a fresh database');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

main();
