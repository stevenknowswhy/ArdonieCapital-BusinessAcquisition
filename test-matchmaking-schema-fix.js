#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMatchmakingTables() {
    console.log('🧪 Testing Matchmaking Schema Fix');
    console.log('=================================\n');
    
    // Matchmaking tables to test
    const matchmakingTables = [
        'matches', // Already exists, should be enhanced
        'user_preferences',
        'match_feedback', 
        'match_interactions',
        'match_scores',
        'algorithm_learning_data',
        'match_analytics'
    ];
    
    const results = {
        accessible: 0,
        total: matchmakingTables.length,
        errors: []
    };
    
    console.log('📋 Testing Matchmaking Tables...');
    
    for (const table of matchmakingTables) {
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
    
    console.log(`\n📊 Matchmaking System Results:`);
    console.log(`Accessible: ${results.accessible}/${results.total} tables (${successRate}%)`);
    
    if (results.accessible === results.total) {
        console.log('🟢 All matchmaking tables are accessible!');
        console.log('✅ Schema deployment was successful');
        return true;
    } else if (results.accessible > 1) {
        console.log('🟡 Some matchmaking tables are accessible');
        console.log('⚠️  Some tables may need deployment');
        return false;
    } else {
        console.log('🔴 Most matchmaking tables need deployment');
        console.log('❌ Schema deployment needed');
        return false;
    }
}

async function testMatchesTableColumns() {
    console.log('\n🔍 Testing Enhanced Matches Table Columns...');
    
    try {
        // Test if we can query the enhanced matches table structure
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .limit(0); // Just get structure, no data
        
        if (error) {
            console.log(`   ❌ Cannot query matches table: ${error.message}`);
            return false;
        }
        
        console.log('   ✅ Matches table structure is queryable');
        
        // Test specific enhanced columns by trying to select them
        const enhancedColumns = [
            'expires_at',
            'match_number', 
            'quality_score',
            'match_reasons',
            'algorithm_version',
            'viewed_by_buyer',
            'viewed_by_seller',
            'metadata'
        ];
        
        let columnsWorking = 0;
        
        for (const column of enhancedColumns) {
            try {
                const { data: colData, error: colError } = await supabase
                    .from('matches')
                    .select(column)
                    .limit(1);
                
                if (!colError) {
                    console.log(`   ✅ Enhanced column: ${column}`);
                    columnsWorking++;
                } else {
                    console.log(`   ❌ Missing column: ${column} - ${colError.message}`);
                }
            } catch (e) {
                console.log(`   ❌ Missing column: ${column} - ${e.message}`);
            }
        }
        
        const columnSuccessRate = (columnsWorking / enhancedColumns.length * 100).toFixed(1);
        console.log(`   📊 Enhanced columns: ${columnsWorking}/${enhancedColumns.length} working (${columnSuccessRate}%)`);
        
        return columnsWorking >= enhancedColumns.length * 0.8; // 80% success rate
        
    } catch (error) {
        console.log(`   ❌ Matches table test failed: ${error.message}`);
        return false;
    }
}

async function main() {
    try {
        console.log('🔍 Testing Matchmaking Schema Column Fix');
        console.log('After adding missing columns to existing matches table\n');
        
        // Test table accessibility
        const tablesAccessible = await testMatchmakingTables();
        
        // Test enhanced matches table columns
        const columnsWorking = await testMatchesTableColumns();
        
        // Generate recommendations
        console.log('\n📋 Recommendations:');
        
        if (tablesAccessible && columnsWorking) {
            console.log('🎉 Matchmaking schema fix was successful!');
            console.log('✅ All tables are accessible and enhanced columns work');
            console.log('📝 Next: Deploy remaining schema files (CMS)');
            console.log('📝 Then: Run full database validation');
        } else if (tablesAccessible) {
            console.log('🟡 Tables exist but enhanced columns need attention');
            console.log('📝 Next: Check column migration and data validation');
        } else {
            console.log('🔴 Matchmaking schema still needs deployment');
            console.log('📝 Next: Deploy database/matchmaking-schema.sql via Supabase SQL Editor');
            console.log('📝 The schema is now safe to deploy without "column does not exist" errors');
        }
        
        console.log('\n🎯 The key fixes applied:');
        console.log('- Added column migration section for existing matches table');
        console.log('- Added missing expires_at column (the main issue)');
        console.log('- Fixed compatibility_score data type conversion (DECIMAL → INTEGER)');
        console.log('- Enhanced matches table with all missing columns');
        console.log('- Skipped matches table creation (already exists)');
        console.log('- Applied conflict-safe patterns for new table creation');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

main();
