#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSavedListingsTable() {
    console.log('🔍 Diagnosing saved_listings Table Structure');
    console.log('===========================================\n');
    
    try {
        // Try to get the table structure by querying with limit 0
        const { data, error } = await supabase
            .from('saved_listings')
            .select('*')
            .limit(0);
        
        if (error) {
            console.log(`❌ Error querying saved_listings: ${error.message}`);
            
            // Check if it's a column-specific error
            if (error.message.includes('user_id')) {
                console.log('🔍 The error mentions user_id - this confirms the column issue');
            }
            
            // Try a simpler query to see what columns exist
            console.log('\n🔍 Trying to identify existing columns...');
            
            // Try common column names one by one
            const commonColumns = ['id', 'listing_id', 'buyer_id', 'created_at', 'updated_at'];
            
            for (const column of commonColumns) {
                try {
                    const { data: colData, error: colError } = await supabase
                        .from('saved_listings')
                        .select(column)
                        .limit(1);
                    
                    if (!colError) {
                        console.log(`   ✅ Column exists: ${column}`);
                    } else {
                        console.log(`   ❌ Column missing: ${column}`);
                    }
                } catch (e) {
                    console.log(`   ❌ Column missing: ${column} (${e.message})`);
                }
            }
            
            return false;
        }
        
        console.log('✅ saved_listings table is accessible');
        console.log('📋 Table structure appears to be compatible');
        
        return true;
        
    } catch (e) {
        console.log(`❌ Exception while diagnosing: ${e.message}`);
        return false;
    }
}

async function checkListingsTableColumns() {
    console.log('\n🔍 Checking listings table for expected counter columns...');
    
    try {
        // Check if listings table has the counter columns that the triggers expect
        const counterColumns = ['views_count', 'inquiries_count', 'saves_count', 'last_viewed_at', 'last_inquiry_at'];
        
        for (const column of counterColumns) {
            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select(column)
                    .limit(1);
                
                if (!error) {
                    console.log(`   ✅ listings.${column} exists`);
                } else {
                    console.log(`   ❌ listings.${column} missing - triggers may fail`);
                }
            } catch (e) {
                console.log(`   ❌ listings.${column} missing - triggers may fail`);
            }
        }
        
    } catch (e) {
        console.log(`❌ Error checking listings table: ${e.message}`);
    }
}

async function identifyProblemArea() {
    console.log('\n🎯 Identifying Problem Area...');
    
    // The error is likely in one of these areas:
    console.log('📋 Potential problem areas:');
    console.log('1. Index creation on user_id column that doesn\'t exist');
    console.log('2. Foreign key constraint addition on missing user_id column');
    console.log('3. Trigger function referencing non-existent columns');
    console.log('4. Table creation conflict with existing saved_listings structure');
    
    console.log('\n💡 Most likely cause:');
    console.log('The saved_listings table already exists but has different column names');
    console.log('Expected: user_id, listing_id');
    console.log('Actual: might be buyer_id, listing_id (based on BuyMartV1 naming)');
    
    console.log('\n🔧 Recommended fix:');
    console.log('1. Check existing saved_listings table structure');
    console.log('2. Update schema to match existing column names');
    console.log('3. Or add column migration if user_id is truly missing');
}

async function main() {
    try {
        console.log('🔍 Diagnosing "column user_id does not exist" Error');
        console.log('====================================================\n');
        
        // Diagnose the saved_listings table
        const tableAccessible = await diagnoseSavedListingsTable();
        
        // Check listings table for counter columns
        await checkListingsTableColumns();
        
        // Identify the most likely problem area
        await identifyProblemArea();
        
        console.log('\n📝 Next Steps:');
        if (!tableAccessible) {
            console.log('1. The saved_listings table exists but has structural issues');
            console.log('2. Need to align schema with existing table structure');
            console.log('3. Update enhanced-marketplace-schema.sql to match reality');
        } else {
            console.log('1. Table structure seems compatible');
            console.log('2. Error might be in index or constraint creation');
            console.log('3. Check for column name mismatches');
        }
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error.message);
        process.exit(1);
    }
}

main();
